import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// تسجيل Service Worker
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('SW Registered: App is offline-ready');
  },
  onUpdate: (registration) => {
    console.log('SW Updated: New content available');
    // يمكن هنا إضافة منطق لإظهار تنبيه للمستخدم لتحديث الصفحة
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
});
