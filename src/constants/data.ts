import { CityOption, IqamaSettings, AdhanSound } from '../types';

export const CITIES: CityOption[] = [
  { nameAr: 'تونس', apiName: 'Tunis' },
  { nameAr: 'أريانة', apiName: 'Ariana' },
  { nameAr: 'باجة', apiName: 'Beja' },
  { nameAr: 'بن عروس', apiName: 'Ben Arous' },
  { nameAr: 'بنزرت', apiName: 'Bizerte' },
  { nameAr: 'تطاوين', apiName: 'Tataouine' },
  { nameAr: 'توزر', apiName: 'Tozeur' },
  { nameAr: 'جندوبة', apiName: 'Jendouba' },
  { nameAr: 'زغوان', apiName: 'Zaghouan' },
  { nameAr: 'سليانة', apiName: 'Siliana' },
  { nameAr: 'سوسة', apiName: 'Sousse' },
  { nameAr: 'سيدي بوزيد', apiName: 'Sidi Bouzid' },
  { nameAr: 'صفاقس', apiName: 'Sfax' },
  { nameAr: 'قابس', apiName: 'Gabes' },
  { nameAr: 'قبلي', apiName: 'Kebili' },
  { nameAr: 'القصرين', apiName: 'Kasserine' },
  { nameAr: 'قفصة', apiName: 'Gafsa' },
  { nameAr: 'القيروان', apiName: 'Kairouan' },
  { nameAr: 'الكاف', apiName: 'El Kef' },
  { nameAr: 'المهدية', apiName: 'Mahdia' },
  { nameAr: 'المنستير', apiName: 'Monastir' },
  { nameAr: 'مدنين', apiName: 'Medenine' },
  { nameAr: 'منوبة', apiName: 'Manouba' },
  { nameAr: 'نابل', apiName: 'Nabeul' },
];

export const APP_LOGO_URL = "/icon.png";

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