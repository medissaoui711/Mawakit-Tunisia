
import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Check, Activity } from 'lucide-react';
import { usePrayerData } from '../../context/PrayerContext';

const AudioPermissionModal: React.FC = () => {
  const { 
    audioUnlocked, 
    enableAudio, 
    audioPermission, 
    setAudioPermission 
  } = usePrayerData();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // يظهر المودال فقط إذا لم يتخذ المستخدم قراراً بعد، ولم يتم فتح الصوت
    // وإذا كان المستخدم قد دخل التطبيق للتو
    if (audioPermission === 'unknown' && !audioUnlocked) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [audioPermission, audioUnlocked]);

  const handleEnable = async () => {
    // تهيئة AudioContext وتشغيل صوت صامت
    enableAudio();
    setAudioPermission('granted');
    setIsOpen(false);
  };

  const handleDismiss = () => {
    setAudioPermission('denied');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-6 transform transition-all scale-100 ring-1 ring-white/10">
        <div className="flex flex-col items-center text-center sm:text-right sm:items-start sm:flex-row gap-5">
          <div className="bg-gradient-to-br from-red-500 to-red-700 p-4 rounded-2xl text-white shadow-lg shadow-red-500/30 shrink-0 animate-bounce-subtle">
            <Volume2 size={32} strokeWidth={2.5} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              تفعيل الأذان التلقائي
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              تمنع سياسات المتصفحات الحديثة تشغيل الصوت تلقائيًا بدون إذن صريح. لضمان سماع الأذان عند وقت الصلاة، يرجى الضغط على "تفعيل".
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={handleEnable}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
              >
                <Activity size={18} />
                تفعيل الصوت
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700 transition-colors"
              >
                ليس الآن
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPermissionModal;
