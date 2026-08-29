import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      if (Array.isArray(registrations)) {
        for (let registration of registrations) {
          try {
            registration.unregister();
          } catch {}
        }
      }
    }).catch(() => {});
  } catch {}
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
