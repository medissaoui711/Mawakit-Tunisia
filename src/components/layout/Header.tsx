
import React, { useState } from 'react';
import { RefreshCw, Moon, Sun, Settings, ChevronDown, Compass, Calendar } from 'lucide-react';
import { CITIES, APP_LOGO_URL } from '../../constants/data';
import { usePrayerData } from '../../context/PrayerContext';
import { useTheme } from '../../context/ThemeContext';
import { getArabicDateString } from '../../utils';
import NotificationControl from '../common/NotificationControl';
import RamadanImsakiya from '../RamadanImsakiya';

const Header: React.FC = () => {
  const { 
    selectedCity, setSelectedCity, 
    loading, refetch, 
    hijriDate, setIsSettingsOpen,
    setIsQiblaOpen
  } = usePrayerData();
  
  const { isDark, toggleDarkMode } = useTheme();
  const [isImsakiyaOpen, setIsImsakiyaOpen] = useState(false);

  const today = new Date();
  const gregorianDateString = getArabicDateString(today);

  // Reusable Components for Layout Flexibility
  const ActionButtons = () => (
    <div className="flex items-center gap-1 sm:gap-2 bg-black/20 p-1.5 rounded-2xl backdrop-blur-sm">
      <button 
        onClick={() => refetch()}
        className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors text-white/90"
        aria-label="تحديث"
        disabled={loading}
      >
         <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
      </button>
      
      {/* Calendar / Imsakiya Button */}
      <button
        onClick={() => setIsImsakiyaOpen(true)}
        className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors text-white/90"
        aria-label="الممسكة"
      >
        <Calendar size={20} />
      </button>

      {/* Qibla Button */}
      <button
        onClick={() => setIsQiblaOpen(true)}
        className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors text-white/90"
        aria-label="القبلة"
      >
        <Compass size={20} />
      </button>

      <button
        onClick={() => setIsSettingsOpen(true)}
        className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors text-white/90"
        aria-label="الإعدادات"
      >
        <Settings size={20} />
      </button>
      <div className="w-px h-6 bg-white/10 mx-1"></div>
      <button 
        onClick={(e) => { e.stopPropagation(); toggleDarkMode(); }}
        className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors text-yellow-300"
        aria-label="تغيير الوضع الليلي"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  );

  const LogoCircle = ({ sizeClass = "w-12 h-12 md:w-16 md:h-16" }) => (
    <div className={`relative ${sizeClass} rounded-full border-2 border-white/20 shadow-2xl overflow-hidden flex items-center justify-center bg-red-900 group`}>
        <img 
          src="https://flagcdn.com/tn.svg"
          alt="Tunisia Flag"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-multiply"
          // @ts-ignore
          fetchpriority="high"
        />
        <img 
          src={APP_LOGO_URL}
          alt="Logo"
          className="relative z-10 w-3/4 h-3/4 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500"
        />
    </div>
  );

  const CityDateSelector = () => (
    <div className="flex flex-col items-center w-full md:w-auto">
       <div className="relative w-full max-w-xs md:max-w-none group touch-manipulation">
          <select 
            value={selectedCity.apiName}
            onChange={(e) => {
              const city = CITIES.find(c => c.apiName === e.target.value);
              if (city) setSelectedCity(city);
            }}
            className="appearance-none w-full bg-red-950/40 dark:bg-black/40 hover:bg-red-950/60 dark:hover:bg-black/60 text-white border border-white/10 backdrop-blur-md rounded-2xl pl-4 pr-12 py-3.5 text-lg font-bold text-center outline-none focus:ring-2 focus:ring-white/30 cursor-pointer transition-all shadow-lg"
          >
            {CITIES.map(c => (
              <option key={c.apiName} value={c.apiName} className="text-gray-900 bg-white p-2">{c.nameAr}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-white/70 group-hover:text-white transition-colors">
             <ChevronDown size={22} strokeWidth={3} />
          </div>
        </div>

        <div className="mt-3 flex flex-col items-center gap-1">
          <h2 className="text-sm sm:text-base font-medium text-red-100/90">
            {gregorianDateString} 
          </h2>
          <span className="text-xs sm:text-sm bg-white/10 px-3 py-0.5 rounded-full text-white/80 font-mono">
            {hijriDate}
          </span>
        </div>
    </div>
  );

  return (
    <>
    <header className="bg-gradient-to-br from-red-900 via-red-800 to-red-950 dark:from-slate-950 dark:via-slate-900 dark:to-black text-white pb-12 md:pb-16 pt-safe-top px-4 sm:px-8 rounded-b-[2rem] md:rounded-b-[3rem] shadow-2xl transition-all duration-500 relative overflow-hidden">
      
      {/* Decorative Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none bg-cover bg-center"
        style={{ 
          backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')",
          willChange: 'opacity'
        }}
      ></div>

      <div className="relative z-10 w-full max-w-5xl mx-auto pt-2 md:pt-4">
        
        {/* Mobile Layout (< md) */}
        <div className="md:hidden flex flex-col gap-4">
           {/* Top Row: Controls (Right) & Logo (Left) */}
           <div className="flex justify-between items-center px-1">
              <ActionButtons />
              <div className="flex items-center">
                <LogoCircle sizeClass="w-12 h-12" />
              </div>
           </div>
           
           {/* Center Row: City & Date */}
           <CityDateSelector />
           
           {/* Notification Control Fallback */}
           <div className="flex justify-center mt-1">
             <NotificationControl />
           </div>
        </div>

        {/* Desktop Layout (>= md) */}
        <div className="hidden md:flex justify-between items-start relative min-h-[100px]">
           {/* Left: Controls */}
           <div className="flex items-center gap-3 z-20">
              <ActionButtons />
              <NotificationControl />
           </div>

           {/* Center: City & Date (Absolute Positioned) */}
           <div className="absolute left-1/2 top-0 -translate-x-1/2 z-10">
              <CityDateSelector />
           </div>

           {/* Right: Logo */}
           <div className="flex flex-col items-end z-20">
              <div className="flex items-center gap-3">
                  <div className="text-right">
                    <h1 className="text-xl font-bold leading-none tracking-tight">مواقيت الصلاة</h1>
                    <span className="text-[10px] text-red-200 uppercase tracking-widest opacity-70">Tunisia</span>
                  </div>
                  <LogoCircle sizeClass="w-16 h-16" />
              </div>
           </div>
        </div>

      </div>
    </header>
    
    {/* Imsakiya Modal */}
    <RamadanImsakiya isOpen={isImsakiyaOpen} onClose={() => setIsImsakiyaOpen(false)} />
    </>
  );
};

export default Header;
