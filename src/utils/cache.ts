
export interface CachedData<T> {
  data: T;
  timestamp: number;
  cityName: string;
  version: string;
}

const CACHE_VERSION = '1.0.0';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 Hours

export const cacheUtils = {
  /**
   * حفظ البيانات في localStorage مع معالجة الأخطاء والتحقق من المساحة
   * يستخدم المفتاح كما هو، لذا يجب إضافة البادئة في الكود المستدعي
   */
  set: <T>(key: string, data: T, cityName: string): void => {
    // هنا نستخدم المفتاح كما هو لضمان المرونة، ولكن يجب أن يبدأ بـ mawakit-cache في الاستخدام الجديد
    const entry: CachedData<T> = {
      data,
      timestamp: Date.now(),
      cityName,
      version: CACHE_VERSION
    };

    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (e: any) {
      // معالجة خطأ امتلاء الذاكرة
      if (
        e.name === 'QuotaExceededError' || 
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        e.code === 22
      ) {
        console.warn('Local storage quota exceeded. Cleaning up old items...');
        try {
          // مسح المفاتيح القديمة التي تبدأ بالبادئات المعروفة
          Object.keys(localStorage).forEach((k) => {
            if (k.startsWith('mawakit-cache') || k.startsWith('mawakit_data') || k.startsWith('mawakit_calendar')) {
              localStorage.removeItem(k);
            }
          });
          localStorage.setItem(key, JSON.stringify(entry));
        } catch (retryError) {
          console.error('Failed to save to localStorage even after cleanup', retryError);
        }
      } else {
        console.error('Error saving to localStorage', e);
      }
    }
  },

  /**
   * استرجاع البيانات الصالحة فقط (غير منتهية الصلاحية ومتوافقة مع الإصدار)
   */
  get: <T>(key: string, cityName: string): CachedData<T> | null => {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const entry: CachedData<T> = JSON.parse(itemStr);
      const now = Date.now();

      // 1. التحقق من رقم الإصدار
      if (entry.version !== CACHE_VERSION) {
        localStorage.removeItem(key);
        return null;
      }

      // 2. التحقق من اسم المدينة (لضمان عدم عرض بيانات مدينة أخرى)
      if (entry.cityName !== cityName) {
        return null;
      }

      // 3. التحقق من الصلاحية (24 ساعة)
      if (now - entry.timestamp > DEFAULT_TTL) {
        return null; // البيانات منتهية الصلاحية
      }

      return entry;
    } catch (e) {
      console.error('Error parsing cache', e);
      // في حال تلف البيانات، نقوم بحذفها
      localStorage.removeItem(key);
      return null;
    }
  },

  /**
   * استرجاع البيانات القديمة (Stale) عند عدم توفر اتصال
   * يتجاوز التحقق من الوقت ولكنه يحافظ على التحقق من الإصدار والمدينة
   */
  getStale: <T>(key: string, cityName: string): CachedData<T> | null => {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;
      
      const entry: CachedData<T> = JSON.parse(itemStr);
      
      if (entry.version !== CACHE_VERSION || entry.cityName !== cityName) {
        return null;
      }

      return entry;
    } catch (e) {
      return null;
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(key);
  }
};
