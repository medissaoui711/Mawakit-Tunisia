
import { useState, useEffect } from 'react';
import { CityOption, CalendarData, AlAdhanCalendarResponse } from '../types';
import { cacheUtils } from '../utils/cache';

export const useWeeklySchedule = (selectedCity: CityOption) => {
  const [schedule, setSchedule] = useState<CalendarData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      // استخدام البادئة الجديدة لتوحيد التخزين
      const cacheKey = `mawakit-cache-calendar-${selectedCity.apiName}_${month}_${year}`;
      
      // Check Cache
      const cached = cacheUtils.get<CalendarData[]>(cacheKey, selectedCity.apiName);
      if (cached) {
        setSchedule(cached.data);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://api.aladhan.com/v1/calendarByCity?city=${selectedCity.apiName}&country=Tunisia&method=2&month=${month}&year=${year}`
        );
        const data: AlAdhanCalendarResponse = await response.json();
        if (data.code === 200) {
          setSchedule(data.data);
          cacheUtils.set(cacheKey, data.data, selectedCity.apiName); 
        }
      } catch (error) {
        console.error("Failed to fetch schedule", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedCity]);

  return { schedule, loading };
};
