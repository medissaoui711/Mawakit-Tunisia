
/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'mawakit-tn-v2';
// إضافة الأيقونة للقائمة لضمان تحميلها عند التثبيت
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png'
];

const APP_LOGO = "/icon.png";

// المجالات الخارجية المسموح بتخزينها
const EXTERNAL_DOMAINS = [
  'cdn.tailwindcss.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'aistudiocdn.com',
  'flagcdn.com'
];

// 1. التثبيت (Install)
self.addEventListener('install', (event) => {
  // تخطي الانتظار لتفعيل الـ SW فوراً
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // محاولة تخزين الملفات الأساسية
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('Some assets failed to cache:', err);
      });
    })
  );
});

// 2. التفعيل (Activate) وتنظيف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // السيطرة على الصفحات المفتوحة فوراً
    })
  );
});

// 3. استراتيجية الكاش (Network First with Cache Fallback)
self.addEventListener('fetch', (event) => {
  // تجاهل طلبات API (تدار عبر التطبيق) وطلبات غير GET
  if (event.request.method !== 'GET' || event.request.url.includes('api.aladhan.com')) {
    return;
  }

  const isExternalResource = EXTERNAL_DOMAINS.some(domain => event.request.url.includes(domain));
  const isInternalResource = event.request.url.startsWith(self.location.origin);
  // التحقق مما إذا كان الطلب هو للأيقونة تحديداً
  const isAppIcon = event.request.url.endsWith('icon.png');

  if (isInternalResource || isExternalResource || isAppIcon) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // تحديث الكاش بالنسخة الجديدة من الشبكة
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // الفشل (أوفلاين) -> العودة للكاش
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // صفحة احتياطية إذا لم يوجد كاش (يمكن إضافتها لاحقاً)
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return null;
          });
        })
    );
  }
});

// 4. الاستماع لرسائل من التطبيق (Message Event)
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon } = event.data.payload;
    const options = {
      body,
      icon: icon || APP_LOGO,
      vibrate: [200, 100, 200],
      badge: APP_LOGO,
      dir: 'rtl',
      lang: 'ar-TN',
      tag: 'prayer-notification',
      renotify: true,
      data: {
        url: self.location.origin
      }
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// 5. التعامل مع إشعارات Push
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'مواقيت الصلاة', body: event.data.text() };
    }
  }

  const options = {
    body: data.body || 'تنبيه جديد',
    icon: APP_LOGO,
    badge: APP_LOGO,
    vibrate: [100, 50, 100],
    data: {
      url: self.location.origin
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'تنبيه', options)
  );
});

// 6. التعامل مع النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});