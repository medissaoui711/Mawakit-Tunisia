
import { useState, useEffect } from 'react';
import { CalendarData, CityOption, AlAdhanCalendarResponse } from '../types';
import { cacheUtils } from '../utils/cache';

export const useCalendar = (selectedCity: CityOption) => {
  const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<{ month: number; year: number }>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const fetchCalendar = async (month: number, year: number) => {
    setLoading(true);
    // استخدام البادئة الجديدة لتوحيد التخزين
    const cacheKey = `mawakit-cache-calendar-${selectedCity.apiName}_${month}_${year}`;
    
    // Try cache first
    const cached = cacheUtils.get<CalendarData[]>(cacheKey, selectedCity.apiName);
    if (cached) {
      setCalendarData(cached.data);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/calendarByCity?city=${selectedCity.apiName}&country=Tunisia&method=2&month=${month}&year=${year}`
      );
      const data: AlAdhanCalendarResponse = await response.json();
      if (data.code === 200) {
        setCalendarData(data.data);
        cacheUtils.set(cacheKey, data.data, selectedCity.apiName);
      }
    } catch (error) {
      console.error("Failed to fetch calendar", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar(currentMonth.month, currentMonth.year);
  }, [selectedCity, currentMonth]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => {
      let newMonth = prev.month + offset;
      let newYear = prev.year;
      
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
      
      return { month: newMonth, year: newYear };
    });
  };

  return { calendarData, loading, currentMonth, changeMonth };
};
