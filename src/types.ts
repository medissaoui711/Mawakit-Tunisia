
export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface HijriDate {
  date: string;
  day: string;
  weekday: {
    ar: string;
    en: string;
  };
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
}

export interface AlAdhanResponse {
  code: number;
  data: {
    timings: PrayerTimings;
    date: {
      hijri: HijriDate;
      gregorian: {
        date: string;
        weekday: { en: string };
      };
    };
  };
}

export interface CityOption {
  nameAr: string;
  apiName: string;
}

// إعدادات الإشعارات
export interface PrayerNotificationSetting {
  enabled: boolean;
  preAdhanMinutes: number;
}

export interface NotificationSettings {
  globalEnabled: boolean;
  prayers: {
    Fajr: PrayerNotificationSetting;
    Sunrise: PrayerNotificationSetting;
    Dhuhr: PrayerNotificationSetting;
    Asr: PrayerNotificationSetting;
    Maghrib: PrayerNotificationSetting;
    Isha: PrayerNotificationSetting;
    [key: string]: PrayerNotificationSetting;
  };
}

// إعدادات الإقامة
export interface IqamaSettings {
  Fajr: number;
  Dhuhr: number;
  Asr: number;
  Maghrib: number;
  Isha: number;
  [key: string]: number;
}

// Calendar API Types
export interface CalendarData {
  timings: PrayerTimings;
  date: {
    gregorian: {
      date: string;
      weekday: { en: string };
    };
    hijri: {
      date: string;
      day: string;
      weekday: { ar: string };
      month: { ar: string };
      year: string;
    };
  };
}

export interface AlAdhanCalendarResponse {
  code: number;
  data: CalendarData[];
}

export interface AdhanSound {
  id: string;
  name: string;
  url: string;
  isFajr?: boolean;
}