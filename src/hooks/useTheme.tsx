import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { storageService } from '../services/storage';

interface Theme {
  colors: {
    background: string;
    surface: string;
    primary: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
  };
}

const lightTheme: Theme = {
  colors: {
    background: '#ffffff',
    surface: '#f5f5f5',
    primary: '#007AFF',
    text: '#000000',
    textSecondary: '#666666',
    border: '#e0e0e0',
    error: '#FF3B30',
    success: '#34C759',
  },
};

const darkTheme: Theme = {
  colors: {
    background: '#000000',
    surface: '#1c1c1e',
    primary: '#0A84FF',
    text: '#ffffff',
    textSecondary: '#999999',
    border: '#333333',
    error: '#FF453A',
    success: '#30D158',
  },
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  themeMode: 'light' | 'dark' | 'system';
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'system'>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    // Load saved theme preference
    storageService.getTheme().then(setThemeModeState);

    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const setThemeMode = async (mode: 'light' | 'dark' | 'system') => {
    setThemeModeState(mode);
    await storageService.setTheme(mode);
  };

  const isDark = themeMode === 'system' 
    ? systemScheme === 'dark'
    : themeMode === 'dark';

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}