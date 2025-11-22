
import React from 'react';
import { Download, X, Share } from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwaInstall';

const InstallPrompt: React.FC = () => {
  const { isInstallable, promptInstall } = usePwaInstall();
  const [isVisible, setIsVisible] = React.useState(true);

  // التحقق مما إذا كان الجهاز iOS لعرض تعليمات خاصة
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  if ((!isInstallable && !isIOS) || !isVisible) return null;

  // لا تظهر الموجه إذا كان التطبيق مثبتاً بالفعل (في وضع standalone)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[80] animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 border border-red-100 dark:border-slate-700 ring-1 ring-black/5">
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-600 to-red-800 p-3 rounded-xl text-white shadow-lg shadow-red-600/20">
              <Download size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                {isIOS ? 'إضافة للشاشة الرئيسية' : 'تثبيت التطبيق'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isIOS 
                  ? 'للوصول السريع، اضغط على مشاركة ثم "إضافة إلى الصفحة الرئيسية"' 
                  : 'احصل على تجربة أفضل وتنبيهات أسرع بدون إنترنت'
                }
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {!isIOS && (
          <div className="mt-4 flex justify-end">
            <button 
              onClick={promptInstall}
              className="bg-red-900 hover:bg-red-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-md w-full sm:w-auto"
            >
              تثبيت الآن
            </button>
          </div>
        )}

        {isIOS && (
           <div className="mt-3 flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/10 p-2 rounded-lg">
              <span>اضغط على</span>
              <Share size={16} />
              <span>ثم اختر "Add to Home Screen"</span>
           </div>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;
