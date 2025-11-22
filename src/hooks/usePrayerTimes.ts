
import { useState, useEffect, useCallback } from 'react';
import { AlAdhanResponse, PrayerTimings, CityOption } from '../types';
import { cacheUtils } from '../utils/cache';

const CACHE_KEY_PREFIX = 'mawakit-cache-data-';

interface StoredPrayerData {
  timings: PrayerTimings;
  hijriDate: string;
}

export const usePrayerTimes = (selectedCity: CityOption) => {
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [hijriDate, setHijriDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchTimings = useCallback(async (forceUpdate = false) => {
    const cacheKey = `${CACHE_KEY_PREFIX}${selectedCity.apiName}`;
    
    setLoading(true);
    setError(null);

    // تحديث حالة الاتصال الحالية
    const currentIsOffline = !navigator.onLine;
    setIsOffline(currentIsOffline);

    // 1. محاولة استرجاع الكاش الصالح (Cache-First)
    if (!forceUpdate) {
      const cachedEntry = cacheUtils.get<StoredPrayerData>(cacheKey, selectedCity.apiName);
      
      if (cachedEntry) {
        setTimings(cachedEntry.data.timings);
        setHijriDate(cachedEntry.data.hijriDate);
        setLastUpdated(cachedEntry.timestamp);
        setLoading(false);
        
        // إذا كنا غير متصلين، نعرض البيانات ولكن نعتبرها Stale لتفعيل البانر
        // البانر يعتمد على isOffline لعرض التنبيه
        setIsStale(false); // البيانات صالحة (< 24 ساعة)
        return; 
      }
    }

    // 2. إذا لم يوجد كاش صالح أو تم طلب تحديث، نحاول الاتصال بالشبكة
    // إذا كنا نعلم أننا غير متصلين، نتجاوز المحاولة ونذهب للخطوة 3 مباشرة
    if (currentIsOffline) {
       handleOfflineFallback(cacheKey);
       return;
    }

    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${selectedCity.apiName}&country=Tunisia&method=2`
      );
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data: AlAdhanResponse = await response.json();
      
      if (data.code === 200) {
        const fetchedTimings = data.data.timings;
        const h = data.data.date.hijri;
        const fetchedHijri = `${h.day} ${h.month.ar} ${h.year} هـ`;
        const resultData: StoredPrayerData = { timings: fetchedTimings, hijriDate: fetchedHijri };

        setTimings(fetchedTimings);
        setHijriDate(fetchedHijri);
        setLastUpdated(Date.now());
        setIsStale(false);
        setIsOffline(false);

        // حفظ في الكاش الجديد
        cacheUtils.set(cacheKey, resultData, selectedCity.apiName);
      } else {
        throw new Error('API Error');
      }
    } catch (err) {
      console.error(err);
      setIsOffline(true);
      handleOfflineFallback(cacheKey);
    } finally {
      setLoading(false);
    }
  }, [selectedCity]);

  // 3. دالة مساعدة للتعامل مع البيانات القديمة
  const handleOfflineFallback = (cacheKey: string) => {
    const staleEntry = cacheUtils.getStale<StoredPrayerData>(cacheKey, selectedCity.apiName);
    
    if (staleEntry) {
      setTimings(staleEntry.data.timings);
      setHijriDate(staleEntry.data.hijriDate);
      setLastUpdated(staleEntry.timestamp);
      setIsStale(true); // بيانات قد تكون قديمة
      // لا نضبط error هنا لأننا نعرض بيانات
    } else {
      setError('تعذر الاتصال بالخادم ولا توجد بيانات محفوظة.');
      setTimings(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTimings();

    const handleOnline = () => {
      setIsOffline(false);
      fetchTimings(true); // تحديث فوري عند عودة الاتصال
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchTimings]);

  return { 
    timings, 
    hijriDate, 
    loading, 
    error, 
    isOffline, 
    isStale, 
    lastUpdated,
    refetch: () => fetchTimings(true) 
  };
};
