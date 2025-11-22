import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import * as serviceWorkerRegistration from './src/serviceWorkerRegistration';

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

// Service Worker registration
serviceWorkerRegistration.register({
  onSuccess: () => console.log('SW Registered: App is offline-ready'),
  onUpdate: () => console.log('SW Updated: New content available')
});