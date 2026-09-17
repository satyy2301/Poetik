// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import {
  SemanticColors,
  lightColors,
  darkColors,
  typography,
  spacing,
  radius,
  shadows,
  layout,
} from '../theme/tokens';

type ThemeMode = 'light' | 'dark' | 'auto';

export interface Theme {
  colors: SemanticColors;
  isDark: boolean;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  layout: typeof layout;
}

export type ThemeColors = SemanticColors;

const buildTheme = (colors: SemanticColors, isDark: boolean): Theme => ({
  colors,
  isDark,
  typography,
  spacing,
  radius,
  shadows,
  layout,
});

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('theme', mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  const getEffectiveTheme = (): Theme => {
    if (themeMode === 'auto') {
      return systemColorScheme === 'dark'
        ? buildTheme(darkColors, true)
        : buildTheme(lightColors, false);
    }
    return themeMode === 'dark'
      ? buildTheme(darkColors, true)
      : buildTheme(lightColors, false);
  };

  const theme = getEffectiveTheme();

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
