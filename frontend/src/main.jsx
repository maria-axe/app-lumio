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
