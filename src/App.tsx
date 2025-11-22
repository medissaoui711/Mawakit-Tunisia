
import React, { useEffect } from 'react';
import Header from './components/layout/Header';
import PrayerCard from './components/PrayerCard';
import CountdownTimer from './components/CountdownTimer';
import StatusBanner from './components/common/StatusBanner';
import SettingsModal from './components/settings/SettingsModal';
import QiblaCompass from './components/QiblaCompass';
import InstallPrompt from './components/common/InstallPrompt';
import AudioPermissionModal from './components/common/AudioPermissionModal';
import WeeklySchedule from './components/desktop/WeeklySchedule';
import DayTimeline from './components/desktop/DayTimeline';

import { PrayerProvider, usePrayerData } from './context/PrayerContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { DeviceProvider, useDevice } from './context/DeviceContext';
import { CITIES } from './constants/data';
import { useSwipe } from './hooks/useSwipe';
import { useViewportHeight } from './hooks/useViewportHeight';
import { useWeeklySchedule } from './hooks/useWeeklySchedule';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';

// Inner Component to use hooks
const AppContent: React.FC = () => {
  const { 
    timings, loading, error, 
    nextPrayerEn, countdown, isUrgent,
    requestPermission, enableAudio, audioUnlocked,
    selectedCity, setSelectedCity, setIsSettingsOpen,
    iqamaSettings,
    isQiblaOpen, setIsQiblaOpen
  } = usePrayerData();

  const { toggleDarkMode } = useTheme();
  const { schedule } = useWeeklySchedule(selectedCity);
  
  useViewportHeight();

  const handleUserInteraction = () => {
    if (!audioUnlocked) {
      enableAudio();
      // We don't force request permission on every click anymore, handled by the Modal
    }
  };

  const handleNextCity = () => {
    const currentIndex = CITIES.findIndex(c => c.apiName === selectedCity.apiName);
    const nextIndex = (currentIndex + 1) % CITIES.length;
    setSelectedCity(CITIES[nextIndex]);
  };

  const handlePrevCity = () => {
    const currentIndex = CITIES.findIndex(c => c.apiName === selectedCity.apiName);
    const prevIndex = (currentIndex - 1 + CITIES.length) % CITIES.length;
    setSelectedCity(CITIES[prevIndex]);
  };

  const swipeHandlers = useSwipe({
    onSwipedLeft: handleNextCity,
    onSwipedRight: handlePrevCity
  });

  useKeyboardNavigation({
    onNextCity: handleNextCity,
    onPrevCity: handlePrevCity,
    toggleTheme: toggleDarkMode,
    toggleSettings: () => setIsSettingsOpen(true)
  });

  return (
    <div 
      className="w-full min-h-screen bg-gray-100 dark:bg-slate-950 text-gray-900 dark:text-white font-tajawal flex flex-col transition-colors duration-300 pb-safe-area-pb hardware-accelerated overflow-x-hidden"
      onClick={handleUserInteraction}
      {...swipeHandlers}
      style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}
    >
      <StatusBanner />
      <SettingsModal />
      <QiblaCompass isOpen={isQiblaOpen} onClose={() => setIsQiblaOpen(false)} />
      <InstallPrompt />
      <AudioPermissionModal />

      {/* Responsive Layout Strategy */}
      <div className="flex flex-col lg:flex-row h-full">
        
        {/* Main Content Area (Mobile: Full width, Desktop: 70%) */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />

          <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 -mt-6 md:-mt-10 relative z-10">
            
            {/* Desktop: Day Timeline (Visual Progress) */}
            {timings && <DayTimeline timings={timings} />}

            <div className="mb-4 sm:mb-6" style={{ willChange: 'contents' }}>
              <CountdownTimer 
                nextPrayerName={nextPrayerEn || ''} 
                countdown={countdown} 
                isUrgent={isUrgent} 
              />
            </div>

            {error && !timings && (
               <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-4 rounded-xl mb-6 text-center shadow-sm" role="alert">
                  <strong className="font-bold block mb-1">تنبيه</strong>
                  <span className="block text-sm sm:text-base">{error}</span>
               </div>
            )}

            {loading && !timings ? (
              <div className="flex flex-col justify-center items-center min-h-[300px] text-gray-500 dark:text-gray-400 gap-6">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-900 dark:border-slate-700 dark:border-t-red-500"></div>
                <p className="font-medium animate-pulse">جاري تحميل المواقيت...</p>
              </div>
            ) : timings ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                 {/* Prayer Cards Wrapper - Grid with rounded corners */}
                 <div className="col-span-2 md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-px bg-gray-200 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5 dark:ring-white/5 hardware-accelerated">
                   <div className="bg-white dark:bg-slate-900 h-full min-h-[110px] sm:min-h-[120px]"><PrayerCard name="الفجر" time={timings.Fajr} iqamaOffset={iqamaSettings.Fajr} isNext={nextPrayerEn === 'Fajr'} /></div>
                   <div className="bg-white dark:bg-slate-900 h-full min-h-[110px] sm:min-h-[120px]"><PrayerCard name="الشروق" time={timings.Sunrise} iqamaOffset={0} isNext={nextPrayerEn === 'Sunrise'} /></div>
                   <div className="bg-white dark:bg-slate-900 h-full min-h-[110px] sm:min-h-[120px]"><PrayerCard name="الظهر" time={timings.Dhuhr} iqamaOffset={iqamaSettings.Dhuhr} isNext={nextPrayerEn === 'Dhuhr'} /></div>
                   <div className="bg-white dark:bg-slate-900 h-full min-h-[110px] sm:min-h-[120px]"><PrayerCard name="العصر" time={timings.Asr} iqamaOffset={iqamaSettings.Asr} isNext={nextPrayerEn === 'Asr'} /></div>
                   <div className="bg-white dark:bg-slate-900 h-full min-h-[110px] sm:min-h-[120px]"><PrayerCard name="المغرب" time={timings.Maghrib} iqamaOffset={iqamaSettings.Maghrib} isNext={nextPrayerEn === 'Maghrib'} /></div>
                   <div className="bg-white dark:bg-slate-900 h-full min-h-[110px] sm:min-h-[120px]"><PrayerCard name="العشاء" time={timings.Isha} iqamaOffset={iqamaSettings.Isha} isNext={nextPrayerEn === 'Isha'} /></div>
                 </div>
              </div>
            ) : null}

            <div className="text-center mt-8 md:mt-16 text-gray-500 dark:text-gray-400 lg:hidden">
              <p className="font-quran text-brand-light dark:text-red-400/80 leading-loose opacity-90 drop-shadow-sm" style={{ fontSize: 'var(--text-fluid-xl)' }}>
                &#123; إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا &#125;
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar / Secondary Content (Desktop Only) */}
        <div className="hidden lg:flex w-80 flex-col p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-r border-gray-200 dark:border-slate-800 overflow-y-auto">
           <div className="sticky top-0 space-y-6">
              
              {/* Additional Info Block */}
              <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-2xl p-6 text-white shadow-lg">
                 <h3 className="font-bold text-lg mb-2 opacity-90">معلومة اليوم</h3>
                 <p className="text-sm leading-relaxed opacity-80">
                   أفضل الأعمال الصلاة في وقتها. حافظ على صلواتك وذكر الله في كل حين.
                 </p>
              </div>

              {/* Weekly Schedule */}
              <WeeklySchedule schedule={schedule} />

              {/* Keyboard Shortcuts Hint */}
              <div className="bg-gray-100 dark:bg-slate-800 rounded-xl p-4 text-xs text-gray-500 dark:text-gray-400">
                <h4 className="font-bold mb-2 uppercase tracking-wider text-gray-400 dark:text-gray-500">اختصارات لوحة المفاتيح</h4>
                <div className="flex justify-between mb-1"><span>تغيير المدينة</span> <span className="font-mono bg-gray-200 dark:bg-slate-700 px-1 rounded">← / →</span></div>
                <div className="flex justify-between mb-1"><span>الوضع الليلي</span> <span className="font-mono bg-gray-200 dark:bg-slate-700 px-1 rounded">M</span></div>
                <div className="flex justify-between"><span>الإعدادات</span> <span className="font-mono bg-gray-200 dark:bg-slate-700 px-1 rounded">S</span></div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DeviceProvider>
      <ThemeProvider>
        <PrayerProvider>
          <AppContent />
        </PrayerProvider>
      </ThemeProvider>
    </DeviceProvider>
  );
};

export default App;
