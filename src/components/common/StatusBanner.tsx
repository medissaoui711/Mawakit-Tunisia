
import React from 'react';
import { WifiOff, Clock, RefreshCw } from 'lucide-react';
import { usePrayerData } from '../../context/PrayerContext';

const StatusBanner: React.FC = () => {
  const { isOffline, isStale, refetch, loading, lastUpdated, timings } = usePrayerData();

  // Helper to calculate time ago string
  const getTimeAgo = (timestamp: number | null) => {
    if (!timestamp) return '';
    const diffMs = Date.now() - timestamp;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `منذ ${diffHours} ساعة`;
    }
    return `منذ ${diffMinutes} دقيقة`;
  };

  // لا نظهر شيئاً إذا كنا متصلين والبيانات حديثة
  if (!isOffline && !isStale) return null;

  const getStatusConfig = () => {
    if (isOffline) {
      // إذا كان لدينا بيانات (حتى لو قديمة أو مخزنة)، نعرض وقت آخر تحديث
      if (timings) {
        const timeAgo = getTimeAgo(lastUpdated);
        return {
          color: 'bg-red-600 dark:bg-red-800',
          icon: <WifiOff size={18} />,
          text: `وضع غير متصل. آخر تحديث: ${timeAgo}.`
        };
      } else {
        // لا توجد بيانات والإنترنت مقطوع
        return {
          color: 'bg-red-600 dark:bg-red-800',
          icon: <WifiOff size={18} />,
          text: 'انقطع الاتصال بالإنترنت. لا توجد بيانات للعرض.'
        };
      }
    } else {
      // متصل ولكن البيانات تعتبر "قديمة" (جاري التحديث)
      return {
        color: 'bg-yellow-600 dark:bg-yellow-700',
        icon: <Clock size={18} />,
        text: 'جاري تحديث البيانات...'
      };
    }
  };

  const config = getStatusConfig();

  return (
    <div 
      className={`w-full px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 text-white shadow-md transition-colors duration-300 ${config.color}`}
    >
      {config.icon}
      
      <div className="flex-1 text-center">
        {config.text}
      </div>

      <button 
        onClick={() => refetch()} 
        disabled={loading}
        className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors active:scale-95"
        aria-label="تحديث البيانات"
      >
        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
      </button>
    </div>
  );
};

export default StatusBanner;
