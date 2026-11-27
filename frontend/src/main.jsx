import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import AppProviders from './contexts/AppProviders.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Falha ao registrar service worker:', error);
    });
  });
}
