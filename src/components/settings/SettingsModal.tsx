
import React, { useState, useRef } from 'react';
import { X, Volume2, VolumeX, Save, RotateCcw, Moon, Music, Play, Pause } from 'lucide-react';
import { usePrayerData } from '../../context/PrayerContext';
import { ADHAN_SOUNDS } from '../../constants/data';

const PRAYER_NAMES_AR: { [key: string]: string } = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

const PRE_ADHAN_OPTIONS = [0, 5, 10, 15, 20, 30];

const SettingsModal: React.FC = () => {
  const { 
    isSettingsOpen, setIsSettingsOpen, 
    settings, updateGlobalEnabled, updatePrayerSetting,
    notificationsEnabled, requestPermission,
    iqamaSettings, updateIqamaTime, resetIqamaDefaults, applyRamadanIqama,
    adhanSoundId, setAdhanSoundId
  } = usePrayerData();

  const [activeTab, setActiveTab] = useState<'notifications' | 'iqama' | 'sound'>('notifications');
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPreview = (url: string, id: string) => {
    if (playingPreviewId === id) {
      audioPreviewRef.current?.pause();
      setPlayingPreviewId(null);
    } else {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      audioPreviewRef.current = new Audio(url);
      audioPreviewRef.current.play();
      audioPreviewRef.current.onended = () => setPlayingPreviewId(null);
      setPlayingPreviewId(id);
    }
  };

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSettingsOpen(false)}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-red-900 dark:bg-slate-900 p-4 flex justify-between items-center text-white shrink-0">
          <h2 className="text-lg font-bold">الإعدادات</h2>
          <button 
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-700 shrink-0 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 min-w-[90px] py-3 text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === 'notifications' 
                ? 'text-red-800 dark:text-red-400 border-b-2 border-red-800 dark:border-red-400 bg-red-50 dark:bg-red-900/10' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            التنبيهات
          </button>
          <button 
            onClick={() => setActiveTab('sound')}
            className={`flex-1 min-w-[90px] py-3 text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === 'sound' 
                ? 'text-red-800 dark:text-red-400 border-b-2 border-red-800 dark:border-red-400 bg-red-50 dark:bg-red-900/10' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            الأصوات
          </button>
          <button 
            onClick={() => setActiveTab('iqama')}
            className={`flex-1 min-w-[90px] py-3 text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === 'iqama' 
                ? 'text-red-800 dark:text-red-400 border-b-2 border-red-800 dark:border-red-400 bg-red-50 dark:bg-red-900/10' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            وقت الإقامة
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 overflow-y-auto flex-1">
          
          {/* === Notification Settings === */}
          {activeTab === 'notifications' && (
            <>
              {!notificationsEnabled && (
                <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg flex items-center justify-between text-sm">
                  <span>يجب السماح بالإشعارات</span>
                  <button onClick={requestPermission} className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-xs font-bold">تفعيل</button>
                </div>
              )}

              <div className="flex items-center justify-between mb-4 p-3 bg-gray-100 dark:bg-slate-700/50 rounded-xl">
                <span className="font-bold text-gray-800 dark:text-gray-100">تفعيل التنبيهات العامة</span>
                <button
                  onClick={() => updateGlobalEnabled(!settings.globalEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.globalEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.globalEnabled ? 'translate-x-1' : 'translate-x-6'}`} />
                </button>
              </div>

              <div className="space-y-2">
                {Object.keys(PRAYER_NAMES_AR).map((prayer) => {
                  const setting = settings.prayers[prayer];
                  return (
                    <div key={prayer} className={`p-3 rounded-xl border flex flex-col gap-2 ${setting.enabled && settings.globalEnabled ? 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800' : 'border-transparent bg-gray-50 dark:bg-slate-900 opacity-70'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updatePrayerSetting(prayer, 'enabled', !setting.enabled)} className={`p-1.5 rounded-full ${setting.enabled ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-gray-400'}`}>
                            {setting.enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                          </button>
                          <span className="font-medium text-gray-800 dark:text-gray-200">{PRAYER_NAMES_AR[prayer]}</span>
                        </div>
                      </div>
                      {setting.enabled && (
                        <div className="flex items-center justify-between px-1">
                           <span className="text-xs text-gray-500">التنبيه قبل:</span>
                           <select
                             value={setting.preAdhanMinutes}
                             onChange={(e) => updatePrayerSetting(prayer, 'preAdhanMinutes', Number(e.target.value))}
                             className="bg-gray-100 dark:bg-slate-700 border-none rounded text-xs py-1 pr-6 pl-2 cursor-pointer"
                             dir="rtl"
                           >
                             {PRE_ADHAN_OPTIONS.map(opt => (
                               <option key={opt} value={opt}>{opt === 0 ? 'وقت الأذان' : `${opt} دقيقة`}</option>
                             ))}
                           </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* === Sound Settings === */}
          {activeTab === 'sound' && (
             <div className="space-y-3">
                <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl flex items-start gap-3 text-sm text-red-800 dark:text-red-200 mb-2">
                   <Music size={18} className="mt-0.5 shrink-0" />
                   <p>اختر صوت المؤذن المفضل لديك للتنبيهات عند دخول وقت الصلاة.</p>
                </div>

                {ADHAN_SOUNDS.map((sound) => (
                  <div 
                    key={sound.id}
                    onClick={() => setAdhanSoundId(sound.id)}
                    className={`
                      relative p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between
                      ${adhanSoundId === sound.id 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500' 
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-red-300'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                       <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${adhanSoundId === sound.id ? 'border-red-600 bg-red-600' : 'border-gray-400'}`}>
                          {adhanSoundId === sound.id && <div className="w-2 h-2 bg-white rounded-full" />}
                       </div>
                       <div className="flex flex-col">
                          <span className="font-bold text-gray-800 dark:text-white text-sm">{sound.name}</span>
                          {sound.isFajr && <span className="text-[10px] text-red-500 font-medium">مخصص للفجر</span>}
                       </div>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayPreview(sound.url, sound.id);
                      }}
                      className="p-2 bg-gray-100 dark:bg-slate-700 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-gray-600 dark:text-gray-300"
                    >
                      {playingPreviewId === sound.id ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                  </div>
                ))}
             </div>
          )}

          {/* === Iqama Settings === */}
          {activeTab === 'iqama' && (
            <div className="space-y-4">
               <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl text-xs text-blue-800 dark:text-blue-200 mb-4">
                 يمكنك ضبط الوقت الفاصل بين الأذان والإقامة (بالدقائق) لكل صلاة.
               </div>

               {/* Presets */}
               <div className="grid grid-cols-2 gap-2 mb-4">
                 <button 
                   onClick={resetIqamaDefaults}
                   className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-xs font-bold text-gray-600 dark:text-gray-300"
                 >
                   <RotateCcw size={14} /> الوضع الافتراضي
                 </button>
                 <button 
                   onClick={applyRamadanIqama}
                   className="flex items-center justify-center gap-2 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 text-xs font-bold text-indigo-700 dark:text-indigo-300"
                 >
                   <Moon size={14} /> توقيت رمضان
                 </button>
               </div>

               {/* Inputs */}
               <div className="space-y-2">
                  {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
                    <div key={prayer} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl">
                       <span className="font-medium text-gray-700 dark:text-gray-200">{PRAYER_NAMES_AR[prayer]}</span>
                       <div className="flex items-center gap-2">
                         <input 
                           type="number" 
                           min="0" 
                           max="60"
                           value={iqamaSettings[prayer]}
                           onChange={(e) => updateIqamaTime(prayer, Math.max(0, parseInt(e.target.value) || 0))}
                           className="w-16 text-center p-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                         />
                         <span className="text-xs text-gray-400">دقيقة</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 shrink-0">
          <button 
            onClick={() => setIsSettingsOpen(false)}
            className="w-full py-2.5 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <Save size={18} />
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
