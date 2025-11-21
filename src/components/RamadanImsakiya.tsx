
import React from 'react';
import { X, Printer, ChevronLeft, ChevronRight, Moon } from 'lucide-react';
import { usePrayerData } from '../context/PrayerContext';
import { useCalendar } from '../hooks/useCalendar';
import { formatTime12Hour } from '../utils';

interface RamadanImsakiyaProps {
  isOpen: boolean;
  onClose: () => void;
}

const RamadanImsakiya: React.FC<RamadanImsakiyaProps> = ({ isOpen, onClose }) => {
  const { selectedCity } = usePrayerData();
  const { calendarData, loading, currentMonth, changeMonth } = useCalendar(selectedCity);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:p-0 print:bg-white print:absolute">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col print:shadow-none print:max-w-none print:h-auto print:overflow-visible">
        
        {/* Header */}
        <div className="bg-brand-light dark:bg-slate-800 p-4 flex items-center justify-between text-white print:hidden">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Moon size={24} className="text-yellow-400" />
            ممسكة شهر {monthNames[currentMonth.month - 1]} - {selectedCity.nameAr}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="p-2 hover:bg-white/10 rounded-lg" title="طباعة">
              <Printer size={20} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg" title="إغلاق">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Header (Visible only in print) */}
        <div className="hidden print:flex flex-col items-center justify-center p-4 border-b mb-4">
           <h1 className="text-2xl font-bold text-black">ممسكة مواقيت الصلاة</h1>
           <h2 className="text-xl text-gray-600">{selectedCity.nameAr} - {monthNames[currentMonth.month - 1]} {currentMonth.year}</h2>
        </div>

        {/* Controls */}
        <div className="p-4 flex items-center justify-between bg-gray-50 dark:bg-slate-800 border-b dark:border-slate-700 print:hidden">
           <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full">
             <ChevronRight />
           </button>
           <span className="font-bold text-lg text-gray-800 dark:text-gray-200">
             {monthNames[currentMonth.month - 1]} {currentMonth.year}
           </span>
           <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full">
             <ChevronLeft />
           </button>
        </div>

        {/* Content Table */}
        <div className="overflow-auto flex-1 p-2 sm:p-4 print:overflow-visible">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-light border-t-transparent"></div>
            </div>
          ) : (
            <table className="w-full text-sm text-center border-collapse">
              <thead>
                <tr className="bg-brand-light/10 dark:bg-brand-light/20 text-brand-light dark:text-red-200">
                  <th className="p-2 sm:p-3 border dark:border-slate-700 rounded-tr-lg">اليوم</th>
                  <th className="p-2 sm:p-3 border dark:border-slate-700">التاريخ</th>
                  <th className="p-2 sm:p-3 border dark:border-slate-700 font-bold bg-brand-light/20">الفجر</th>
                  <th className="p-2 sm:p-3 border dark:border-slate-700 hidden sm:table-cell">الشروق</th>
                  <th className="p-2 sm:p-3 border dark:border-slate-700">الظهر</th>
                  <th className="p-2 sm:p-3 border dark:border-slate-700">العصر</th>
                  <th className="p-2 sm:p-3 border dark:border-slate-700 font-bold bg-brand-light/20">المغرب</th>
                  <th className="p-2 sm:p-3 border dark:border-slate-700 rounded-tl-lg">العشاء</th>
                </tr>
              </thead>
              <tbody>
                {calendarData.map((day, idx) => {
                  const isFriday = day.date.gregorian.weekday.en === 'Friday';
                  const isToday = new Date().getDate() === parseInt(day.date.gregorian.date.split('-')[0]) && 
                                  new Date().getMonth() + 1 === currentMonth.month;
                  
                  return (
                    <tr 
                      key={idx} 
                      className={`
                        border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors
                        ${isFriday ? 'bg-orange-50 dark:bg-orange-900/10' : ''}
                        ${isToday ? 'bg-red-100 dark:bg-red-900/30 ring-1 ring-red-500 print:bg-transparent print:ring-0' : ''}
                      `}
                    >
                      <td className="p-2 border-x dark:border-slate-700 font-medium">
                        <div className="flex flex-col">
                          <span>{day.date.hijri.weekday.ar}</span>
                          {isFriday && <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold print:hidden">جمعة</span>}
                        </div>
                      </td>
                      <td className="p-2 border-x dark:border-slate-700">
                        <div className="flex flex-col">
                          <span className="font-bold">{day.date.hijri.day} <span className="text-[10px] font-normal opacity-70">{day.date.hijri.month.ar}</span></span>
                          <span className="text-[10px] opacity-60">{day.date.gregorian.date.slice(0, 5)}</span>
                        </div>
                      </td>
                      <td className="p-2 border-x dark:border-slate-700 font-bold text-red-800 dark:text-red-300 bg-red-50/50 dark:bg-red-900/10">
                        {formatTime12Hour(day.timings.Fajr.split(' ')[0])}
                      </td>
                      <td className="p-2 border-x dark:border-slate-700 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                        {formatTime12Hour(day.timings.Sunrise.split(' ')[0])}
                      </td>
                      <td className="p-2 border-x dark:border-slate-700">
                        {formatTime12Hour(day.timings.Dhuhr.split(' ')[0])}
                      </td>
                      <td className="p-2 border-x dark:border-slate-700">
                        {formatTime12Hour(day.timings.Asr.split(' ')[0])}
                      </td>
                      <td className="p-2 border-x dark:border-slate-700 font-bold text-red-800 dark:text-red-300 bg-red-50/50 dark:bg-red-900/10">
                        {formatTime12Hour(day.timings.Maghrib.split(' ')[0])}
                      </td>
                      <td className="p-2 border-x dark:border-slate-700">
                        {formatTime12Hour(day.timings.Isha.split(' ')[0])}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800 text-center text-xs text-gray-500 dark:text-gray-400 print:flex print:justify-between">
           <span>* تقبل الله منا ومنكم صالح الأعمال</span>
           <span className="hidden print:inline">Mawakit Tunisia</span>
        </div>

      </div>
    </div>
  );
};

export default RamadanImsakiya;
