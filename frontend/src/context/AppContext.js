import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paramTheme = urlParams.get('theme');
      if (paramTheme) return paramTheme;
      return localStorage.getItem('kv_theme') || 'light';
    } catch {
      return 'light';
    }
  });
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('kv_fontSize') || '16'));
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('kv_hc') === 'true');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kv_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
    localStorage.setItem('kv_fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.setAttribute('data-hc', highContrast);
    localStorage.setItem('kv_hc', highContrast);
  }, [highContrast]);

  useEffect(() => {
    const onOnline = () => { setIsOnline(true); showNotification('You\'re back online! Syncing stories...', 'success'); };
    const onOffline = () => { setIsOnline(false); showNotification('You\'re offline. Stories will sync when connection returns.', 'warning'); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <AppContext.Provider value={{ theme, toggleTheme, fontSize, setFontSize, highContrast, setHighContrast, isOnline, notification, showNotification }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
