
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { CityOption, PrayerTimings, NotificationSettings, IqamaSettings } from '../types';
import { CITIES, ADHAN_SOUNDS } from '../constants/data';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { useCountdown } from '../hooks/useCountdown';
import { useAdhanNotification } from '../hooks/useAdhanNotification';
import { useNotificationSettings } from '../hooks/useNotificationSettings';
import { useIqamaSettings } from '../hooks/useIqamaSettings';

interface PrayerContextType {
  selectedCity: CityOption;
  setSelectedCity: (city: CityOption) => void;
  timings: PrayerTimings | null;
  hijriDate: string;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  isStale: boolean;
  refetch: () => void;
  nextPrayer: string | null;
  nextPrayerEn: string | null;
  countdown: string;
  isUrgent: boolean;
  
  // Notification logic
  notificationsEnabled: boolean;
  requestPermission: () => void;
  enableAudio: () => void;
  audioUnlocked: boolean;

  // Settings
  settings: NotificationSettings;
  updateGlobalEnabled: (val: boolean) => void;
  updatePrayerSetting: (prayer: string, field: 'enabled' | 'preAdhanMinutes', value: any) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (val: boolean) => void;

  // Iqama Settings
  iqamaSettings: IqamaSettings;
  updateIqamaTime: (prayer: string, minutes: number) => void;
  resetIqamaDefaults: () => void;
  applyRamadanIqama: () => void;
  
  // Qibla Modal Control
  isQiblaOpen: boolean;
  setIsQiblaOpen: (val: boolean) => void;

  // Adhan Sound Logic
  adhanSoundId: string;
  setAdhanSoundId: (id: string) => void;
}

const PrayerContext = createContext<PrayerContextType | undefined>(undefined);

export const PrayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState<CityOption>(CITIES[0]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQiblaOpen, setIsQiblaOpen] = useState(false);
  
  // Adhan Sound State
  const [adhanSoundId, setAdhanSoundId] = useState<string>(() => {
     return localStorage.getItem('mawakit_adhan_sound') || 'makkah';
  });

  useEffect(() => {
    localStorage.setItem('mawakit_adhan_sound', adhanSoundId);
  }, [adhanSoundId]);
  
  // 1. Data Hooks
  const { timings, hijriDate, loading, error, isOffline, isStale, refetch } = usePrayerTimes(selectedCity);
  const { nextPrayer, nextPrayerEn, countdown, isUrgent } = useCountdown(timings);
  
  // 2. Settings Hooks
  const { settings, updateGlobalEnabled, updatePrayerSetting } = useNotificationSettings();
  const { iqamaSettings, updateIqamaTime, resetToDefaults, applyRamadanPreset } = useIqamaSettings();

  // 3. Notification Logic
  // Pass the dynamic selected sound ID to the hook
  const { notificationsEnabled, requestPermission, enableAudio, audioUnlocked } = useAdhanNotification(
    timings, 
    adhanSoundId, 
    settings
  );

  const value = useMemo(() => ({
    selectedCity,
    setSelectedCity,
    timings,
    hijriDate,
    loading,
    error,
    isOffline,
    isStale,
    refetch,
    nextPrayer,
    nextPrayerEn,
    countdown,
    isUrgent,
    notificationsEnabled,
    requestPermission,
    enableAudio,
    audioUnlocked,
    settings,
    updateGlobalEnabled,
    updatePrayerSetting,
    isSettingsOpen,
    setIsSettingsOpen,
    // New Iqama Props
    iqamaSettings,
    updateIqamaTime,
    resetIqamaDefaults: resetToDefaults,
    applyRamadanIqama: applyRamadanPreset,
    // New Qibla Props
    isQiblaOpen,
    setIsQiblaOpen,
    // Adhan Sound
    adhanSoundId,
    setAdhanSoundId
  }), [
    selectedCity, timings, hijriDate, loading, error, isOffline, isStale, 
    nextPrayer, nextPrayerEn, countdown, isUrgent, 
    notificationsEnabled, audioUnlocked, settings, isSettingsOpen,
    iqamaSettings, isQiblaOpen, adhanSoundId
  ]);

  return (
    <PrayerContext.Provider value={value}>
      {children}
    </PrayerContext.Provider>
  );
};

export const usePrayerData = () => {
  const context = useContext(PrayerContext);
  if (context === undefined) {
    throw new Error('usePrayerData must be used within a PrayerProvider');
  }
  return context;
};
