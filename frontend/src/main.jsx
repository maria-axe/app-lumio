import React, { useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import AppProviders from './contexts/AppProviders.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import './styles.css';

function Root() {
  const [splashVisible, setSplashVisible] = useState(true);
  const hideSplash = useCallback(() => setSplashVisible(false), []);

  return (
    <React.StrictMode>
      <AppProviders>
        <App />
      </AppProviders>
      {splashVisible && <SplashScreen onDone={hideSplash} />}
    </React.StrictMode>
  );
}

createRoot(document.getElementById('root')).render(<Root />);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Falha ao registrar service worker:', error);
    });
  });
}
