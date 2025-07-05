import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { updateThemeColorMeta } from '../utils/seoUtils'; // Import the new utility

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Define your theme colors here, ideally matching your Tailwind config for consistency
const THEME_COLORS = {
  light: '#0077cc', // brand-accent
  dark: '#00bfff',  // brand-accent-dark
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  const applyTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      updateThemeColorMeta(THEME_COLORS.dark);
    } else {
      document.documentElement.classList.remove('dark');
      updateThemeColorMeta(THEME_COLORS.light);
    }
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme) {
      applyTheme(storedTheme);
    } else if (prefersDark) {
      applyTheme('dark');
    } else {
      applyTheme('light'); // Default to light if no preference or storage
    }
  }, [applyTheme]);

  const toggleTheme = () => {
    applyTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};