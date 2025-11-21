
import { useState, useEffect, useRef } from 'react';
import { PrayerTimings, NotificationSettings } from '../types';
import { sendNotification } from '../utils/notificationUtils';
import { ADHAN_SOUNDS } from '../constants/data';

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

export const useAdhanNotification = (
  timings: PrayerTimings | null,
  adhanSoundId: string,
  settings: NotificationSettings
) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // تخزين المفاتيح للإشعارات التي تم إرسالها بالفعل لمنع التكرار
  const notifiedPrayers = useRef<Set<string>>(new Set());

  // Get current audio URL based on ID
  const getCurrentAudioUrl = () => {
    const sound = ADHAN_SOUNDS.find(s => s.id === adhanSoundId) || ADHAN_SOUNDS[0];
    return sound.url;
  };

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
    // Initialize audio
    audioRef.current = new Audio(getCurrentAudioUrl());
  }, []);

  // Update audio source when ID changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = getCurrentAudioUrl();
      audioRef.current.load();
    }
  }, [adhanSoundId]);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  const enableAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          audioRef.current?.pause();
          audioRef.current!.currentTime = 0;
          setAudioUnlocked(true);
        })
        .catch(e => console.log("Audio unlock failed:", e));
    }
  };

  // المنطق الرئيسي للإشعارات
  useEffect(() => {
    if (!timings || !notificationsEnabled || !settings.globalEnabled) return;

    const checkTime = () => {
      const now = new Date();
      const isFriday = now.getDay() === 5;

      Object.keys(PRAYER_NAMES_AR).forEach((prayer) => {
        // التحقق مما إذا كان التنبيه مفعلاً لهذه الصلاة
        const prayerSetting = settings.prayers[prayer];
        if (!prayerSetting?.enabled) return;

        const timeStr = timings[prayer].split(' ')[0];
        const [pHour, pMin] = timeStr.split(':').map(Number);
        
        const prayerDate = new Date();
        prayerDate.setHours(pHour, pMin, 0, 0);

        const diffMs = prayerDate.getTime() - now.getTime();
        const diffMinutes = Math.round(diffMs / 60000);
        const prayerKey = `${prayer}-${now.getDate()}`;

        // --- منطق التنبيه المسبق (قبل X دقيقة) ---
        const preTime = prayerSetting.preAdhanMinutes;
        if (preTime > 0 && diffMinutes === preTime && !notifiedPrayers.current.has(prayerKey + '_pre')) {
          
          let title = `اقترب وقت صلاة ${PRAYER_NAMES_AR[prayer]}`;
          let body = `بقي ${preTime} دقائق على الأذان`;

          // تخصيص رسالة الجمعة
          if (isFriday && prayer === 'Dhuhr') {
             title = 'اقترب موعد صلاة الجمعة';
             body = `بقي ${preTime} دقائق. بكر إلى المسجد تنل الأجر.`;
          }

          sendNotification(title, body);
          notifiedPrayers.current.add(prayerKey + '_pre');
        }

        // --- منطق التنبيه وقت الأذان ---
        if (Math.abs(diffMinutes) < 1 && !notifiedPrayers.current.has(prayerKey + '_at')) {
          
          let title = `حان الآن وقت صلاة ${PRAYER_NAMES_AR[prayer]}`;
          let body = `الله أكبر، الله أكبر`;

          // رسائل مخصصة
          if (prayer === 'Fajr') body = SPECIAL_MESSAGES.Fajr[0];
          if (isFriday && prayer === 'Dhuhr') {
             title = 'حان موعد صلاة الجمعة';
             body = SPECIAL_MESSAGES.Friday[0];
          }

          // إرسال الإشعار
          sendNotification(title, body);

          // تشغيل الصوت
          if (audioRef.current) {
            // Check for specific Fajr sound logic if needed
            // For now, we rely on the globally selected sound
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.warn("Autoplay blocked", e));
          }
          
          notifiedPrayers.current.add(prayerKey + '_at');
        }
      });
    };

    const interval = setInterval(checkTime, 5000); // فحص كل 5 ثواني لضمان الدقة
    return () => clearInterval(interval);
  }, [timings, notificationsEnabled, settings, adhanSoundId]);

  return {
    notificationsEnabled,
    audioUnlocked,
    requestPermission,
    enableAudio
  };
};
