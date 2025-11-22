
import { ADHAN_SOUNDS } from '../constants/data';

class AudioManager {
  private context: AudioContext | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private isUnlocked: boolean = false;
  private unlockingPromise: Promise<boolean> | null = null;

  constructor() {
    // تهيئة العنصر عند الإنشاء لكن دون تفعيله لتجنب استهلاك الموارد فوراً
    if (typeof window !== 'undefined') {
      this.audioEl = new Audio();
      this.audioEl.crossOrigin = "anonymous"; // محاولة لتجاوز مشاكل CORS
    }
  }

  /**
   * تهيئة AudioContext (يجب أن يتم استدعاؤها عند تفاعل المستخدم)
   */
  private initContext() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.context = new AudioContextClass();
      
      // إنشاء GainNode للتحكم في الصوت
      this.gainNode = this.context.createGain();
      this.gainNode.connect(this.context.destination);

      // ربط عنصر الصوت بـ Context
      if (this.audioEl) {
        // ملاحظة: createMediaElementSource يمكن استدعاؤها مرة واحدة فقط لكل عنصر
        try {
          this.sourceNode = this.context.createMediaElementSource(this.audioEl);
          this.sourceNode.connect(this.gainNode);
        } catch (e) {
          console.warn("Source node already connected or error connecting:", e);
        }
      }
    }
  }

  /**
   * فك قفل الصوت (AudioContext Unlock)
   * يقوم بتشغيل صوت صامت ومذبذب فارغ لإخبار المتصفح أن المستخدم تفاعل مع الصفحة
   */
  async unlock(): Promise<boolean> {
    if (this.isUnlocked && this.context?.state === 'running') return true;

    // منع تداخل الطلبات (Race Condition)
    if (this.unlockingPromise) {
      return this.unlockingPromise;
    }

    this.unlockingPromise = this.performUnlock();
    return this.unlockingPromise;
  }

  private async performUnlock(): Promise<boolean> {
    this.initContext();

    if (!this.context || !this.audioEl) {
        this.unlockingPromise = null;
        return false;
    }

    try {
      // 1. استئناف الـ Context
      await this.context.resume();

      // 2. تشغيل Oscillator صامت للحظة (خدعة قوية لفتح الـ Context)
      const buffer = this.context.createBuffer(1, 1, 22050);
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.connect(this.context.destination);
      source.start(0);

      // 3. تشغيل وإيقاف العنصر الصوتي لتفعيله
      const originalSrc = this.audioEl.src;
      
      // استخدام ملف صامت قصير جداً Base64
      this.audioEl.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      this.audioEl.load();
      
      const playPromise = this.audioEl.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
      
      // استعادة المصدر الأصلي إذا وجد ولم يكن data URI
      // نتجاوز الاستعادة إذا كان الرابط فارغاً أو data
      if (originalSrc && !originalSrc.startsWith('data:')) {
        this.audioEl.src = originalSrc;
        // لا ننتظر التحميل هنا
      }

      this.isUnlocked = true;
      console.log("AudioManager: AudioContext unlocked/resumed successfully");
      return true;
    } catch (error) {
      // تجاهل خطأ المقاطعة لأنه متوقع عند التفاعل السريع
      if (error instanceof Error && error.name === 'AbortError') {
         // إذا تمت المقاطعة بطلب آخر، نعتبر المحاولة ناجحة جزئياً لأن التفاعل حدث
         console.log("AudioManager: Unlock interrupted (likely by actual play call)");
         return true;
      }
      console.error("AudioManager: Failed to unlock audio:", error);
      return false;
    } finally {
      this.unlockingPromise = null;
    }
  }

  /**
   * تشغيل ملف صوتي (الأذان)
   */
  async play(soundId: string, onEnded?: () => void): Promise<void> {
    // التأكد من الجاهزية
    if (!this.isUnlocked || this.context?.state === 'suspended') {
      const unlocked = await this.unlock();
      if (!unlocked) {
        console.warn("AudioManager: Cannot play, context locked.");
        return;
      }
    }

    const sound = ADHAN_SOUNDS.find(s => s.id === soundId) || ADHAN_SOUNDS[0];
    
    if (this.audioEl) {
      try {
        this.audioEl.src = sound.url;
        this.audioEl.load();
        
        // إعادة تعيين الأحداث
        this.audioEl.onended = () => {
          if (onEnded) onEnded();
        };
        
        this.audioEl.onerror = (e) => {
          console.error("AudioManager: Playback error", e);
        };

        await this.audioEl.play();
        console.log(`AudioManager: Playing ${sound.name}`);
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') {
          console.log("AudioManager: Playback replaced by new request");
        } else {
          console.error("AudioManager: Play failed:", e);
        }
      }
    }
  }

  /**
   * إيقاف الصوت
   */
  stop() {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
    }
  }

  /**
   * التحقق مما إذا كان الصوت مهيأً
   */
  isReady(): boolean {
    return this.isUnlocked && this.context?.state === 'running';
  }
}

export const audioManager = new AudioManager();
