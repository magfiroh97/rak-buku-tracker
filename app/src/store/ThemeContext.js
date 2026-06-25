// src/store/ThemeContext.js
// Context untuk mode tema (terang/gelap), bagian dari Fitur 6: Pengaturan.
// Disimpan di AsyncStorage (bukan data sensitif, cukup AsyncStorage biasa).

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../constants/theme';

const ThemeContext = createContext(null);
const THEME_STORAGE_KEY = 'rakbuku_theme';

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((value) => {
      if (value === 'dark') setIsDark(true);
      setIsLoaded(true);
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
  };

  const colors = isDark ? darkColors : lightColors;

  if (!isLoaded) return null; // hindari flicker tema saat pertama load

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme harus dipakai di dalam ThemeProvider');
  return ctx;
}
