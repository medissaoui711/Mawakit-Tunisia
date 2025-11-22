
import { useState, useEffect, useRef, useCallback } from 'react';
import { PrayerTimings, NotificationSettings } from '../types';
import { sendNotification } from '../utils/notificationUtils';
import { audioManager } from '../utils/audioManager';

const PRAYER_NAMES_AR: { [key: string]: string } = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

const SPECIAL_MESSAGES: { [key: string]: string[] } = {
  Fajr: ['الصلاة خير من النوم', 'استيقظ لصلاة الفجر'],
  Maghrib: ['حان موعد الإفطار للصائمين', 'تقبل الله صلاتكم'],
  Friday: ['إنها صلاة الجمعة، فاسعوا إلى ذكر الله', 'جمعة مباركة، لا تنس سورة الكهف']
};

export type AudioPermissionState = 'granted' | 'denied' | 'unknown';

export const useAdhanNotification = (
  timings: PrayerTimings | null,
  adhanSoundId: string,
  settings: NotificationSettings
) => {
  // إذن الإشعارات النصية
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  
  // حالة AudioContext
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(false);
  
  // حالة إذن الصوت المخزنة (قرار المستخدم)
  const [audioPermission, setAudioPermissionState] = useState<AudioPermissionState>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('mawakit_audio_permission') as AudioPermissionState) || 'unknown';
    }
    return 'unknown';
  });

  const notifiedPrayers = useRef<Set<string>>(new Set());

  // دالة لحفظ قرار المستخدم
  const setAudioPermission = (state: AudioPermissionState) => {
    setAudioPermissionState(state);
    localStorage.setItem('mawakit_audio_permission', state);
  };

  // التحقق من حالة إذن الإشعارات عند التحميل
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
    // التحقق مما إذا كان مدير الصوت جاهزاً بالفعل
    if (audioManager.isReady()) {
      setAudioUnlocked(true);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  // دالة تهيئة الصوت (تستخدم في زر التفعيل أو أي تفاعل)
  const enableAudio = useCallback(async () => {
    if (audioUnlocked) return;

    const success = await audioManager.unlock();
    if (success) {
      setAudioUnlocked(true);
      if (audioPermission !== 'granted') {
        setAudioPermission('granted');
      }
    }
  }, [audioUnlocked, audioPermission]);

  // دالة تشغيل معاينة
  const playPreview = useCallback((id: string) => {
    audioManager.play(id);
  }, []);

  const stopAudio = useCallback(() => {
    audioManager.stop();
  }, []);

  // المنطق الرئيسي للمراقبة والتشغيل
  useEffect(() => {
    if (!timings || !settings.globalEnabled) return;

    const checkTime = () => {
      const now = new Date();
      const isFriday = now.getDay() === 5;

      Object.keys(PRAYER_NAMES_AR).forEach((prayer) => {
        const prayerSetting = settings.prayers[prayer];
        if (!prayerSetting?.enabled) return;

        const timeStr = timings[prayer].split(' ')[0];
        const [pHour, pMin] = timeStr.split(':').map(Number);
        
        const prayerDate = new Date();
        prayerDate.setHours(pHour, pMin, 0, 0);

        const diffMs = prayerDate.getTime() - now.getTime();
        const diffMinutes = Math.round(diffMs / 60000);
        const prayerKey = `${prayer}-${now.getDate()}`;

        // --- 1. التنبيه المسبق ---
        const preTime = prayerSetting.preAdhanMinutes;
        if (preTime > 0 && diffMinutes === preTime && !notifiedPrayers.current.has(prayerKey + '_pre')) {
          let title = `اقترب وقت صلاة ${PRAYER_NAMES_AR[prayer]}`;
          let body = `بقي ${preTime} دقائق على الأذان`;

          if (isFriday && prayer === 'Dhuhr') {
             title = 'اقترب موعد صلاة الجمعة';
             body = `بقي ${preTime} دقائق. بكر إلى المسجد تنل الأجر.`;
          }

          sendNotification(title, body);
          notifiedPrayers.current.add(prayerKey + '_pre');
        }

        // --- 2. وقت الأذان ---
        if (Math.abs(diffMinutes) < 1 && !notifiedPrayers.current.has(prayerKey + '_at')) {
          
          let title = `حان الآن وقت صلاة ${PRAYER_NAMES_AR[prayer]}`;
          let body = `الله أكبر، الله أكبر`;

          if (prayer === 'Fajr') body = SPECIAL_MESSAGES.Fajr[0];
          if (isFriday && prayer === 'Dhuhr') {
             title = 'حان موعد صلاة الجمعة';
             body = SPECIAL_MESSAGES.Friday[0];
          }

          // إرسال إشعار
          sendNotification(title, body);

          // تشغيل الصوت
          if (audioPermission === 'granted') {
            // نحدد الصوت: إذا كان فجر نستخدم صوت الفجر إذا وجد
            let soundToPlay = adhanSoundId;
            if (prayer === 'Fajr' && adhanSoundId !== 'fajr') {
               // خيار: هل نفرض صوت الفجر الخاص؟ 
               // حالياً نلتزم بما اختاره المستخدم إلا إذا اختار "أذان الفجر الخاص"
            }

            audioManager.play(soundToPlay).catch(err => {
              console.warn("Auto-play prevented or failed:", err);
              // محاولة أخيرة لإعادة التنبيه إذا فشل الصوت
              sendNotification(title, "انقر لتشغيل الأذان");
            });
          }
          
          notifiedPrayers.current.add(prayerKey + '_at');
        }
      });
    };

    const interval = setInterval(checkTime, 5000); // التحقق كل 5 ثوانٍ لدقة أعلى
    return () => clearInterval(interval);
  }, [timings, notificationsEnabled, settings, adhanSoundId, audioUnlocked, audioPermission]);

  return {
    notificationsEnabled,
    audioUnlocked,
    audioPermission,
    setAudioPermission,
    requestNotificationPermission,
    enableAudio,
    playPreview,
    stopAudio
  };
};
