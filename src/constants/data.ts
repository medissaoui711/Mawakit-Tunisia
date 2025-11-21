
import { CityOption, IqamaSettings, AdhanSound } from '../types';

export const CITIES: CityOption[] = [
  { nameAr: 'تونس', apiName: 'Tunis' },
  { nameAr: 'صفاقس', apiName: 'Sfax' },
  { nameAr: 'سوسة', apiName: 'Sousse' },
  { nameAr: 'قابس', apiName: 'Gabes' },
  { nameAr: 'القيروان', apiName: 'Kairouan' },
  { nameAr: 'بنزرت', apiName: 'Bizerte' },
  { nameAr: 'نابل', apiName: 'Nabeul' },
  { nameAr: 'مدنين', apiName: 'Medenine' },
];

export const APP_LOGO_URL = "https://cdn-icons-png.flaticon.com/512/2319/2319865.png";

// Legacy string exports for backward compatibility if needed
export const IQAMA_OFFSETS = {
  Fajr: '+25',
  Sunrise: '--',
  Dhuhr: '+20',
  Asr: '+25',
  Maghrib: '+10',
  Isha: '+20',
};

// Numeric Defaults for Calculation
export const DEFAULT_IQAMA_SETTINGS: IqamaSettings = {
  Fajr: 30,
  Dhuhr: 20,
  Asr: 25,
  Maghrib: 15,
  Isha: 20,
};

// Ramadan Preset Example
export const RAMADAN_IQAMA_SETTINGS: IqamaSettings = {
  Fajr: 15, // Usually shorter in Ramadan
  Dhuhr: 15,
  Asr: 15,
  Maghrib: 10, // Very short for Iftar
  Isha: 15, // Short before Taraweeh
};

export const ADHAN_SOUNDS: AdhanSound[] = [
  { id: 'makkah', name: 'مكة المكرمة', url: 'https://media.blubrry.com/muslim_central_quran/podcasts.qurancentral.com/adhan/adhan-makkah-2.mp3' },
  { id: 'madinah', name: 'المدينة المنورة', url: 'https://media.blubrry.com/muslim_central_quran/podcasts.qurancentral.com/adhan/adhan-madinah.mp3' },
  { id: 'tunis', name: 'تونس (الزيتونة)', url: 'https://www.tvquran.com/uploads/adhan/Al-Zaytuna.mp3' }, 
  { id: 'aqsa', name: 'المسجد الأقصى', url: 'https://media.blubrry.com/muslim_central_quran/podcasts.qurancentral.com/adhan/adhan-alaqsa.mp3' },
  { id: 'fajr', name: 'أذان الفجر الخاص', url: 'https://media.blubrry.com/muslim_central_quran/podcasts.qurancentral.com/adhan/adhan-fajr.mp3', isFajr: true },
];

export const ADHAN_AUDIO_URL = ADHAN_SOUNDS[0].url;
