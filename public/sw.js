
/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'mawakit-tn-v6';
const API_CACHE_NAME = 'mawakit-api-v1';

// الأصول الثابتة للتخزين
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
  'flagcdn.com',
  'media.blubrry.com',
  'podcasts.qurancentral.com',
  'www.tvquran.com'
];

// 1. التثبيت (Install)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
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
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. التعامل مع الطلبات (Fetch Strategy)
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // أ) التعامل مع طلبات API (Network First falling back to Cache)
  if (requestUrl.hostname === 'api.aladhan.com') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // إذا نجح الاتصال، نحدث الكاش ونرجع البيانات
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return response;
          }
          return response;
        })
        .catch(() => {
          // إذا فشل الاتصال (أوفلاين)، نبحث في كاش الـ API
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // إذا لم نجد بيانات، نرجع خطأ JSON مناسب بدلاً من فشل كامل
            return new Response(
              JSON.stringify({ code: 503, status: "Offline", data: null }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // ب) التعامل مع الموارد الثابتة والخارجية (Stale-While-Revalidate)
  const isExternalResource = EXTERNAL_DOMAINS.some(domain => requestUrl.hostname.includes(domain));
  const isInternalResource = requestUrl.origin === self.location.origin;
  const isAppIcon = requestUrl.pathname.endsWith('icon.png');

  if (isInternalResource || isExternalResource || isAppIcon) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // نرجع النسخة المخبأة فوراً إن وجدت
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => {
          // فشل الشبكة صامت هنا لأننا اعتمدنا على الكاش
        });

        return cachedResponse || fetchPromise;
      })
    );
  }
});

// 4. الاستماع لرسائل من التطبيق (للإشعارات)
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
      data: { url: self.location.origin }
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// 5. التعامل مع النقر على الإشعار
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
