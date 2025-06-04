
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { themes, type Theme } from '@/lib/themes';

interface ThemeContextType {
  theme: Theme;
  setThemeById: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]); // Default to the first theme

  const applyTheme = useCallback((themeToApply: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove(...themes.map(t => t.id)); // Remove any existing theme classes
    root.classList.add(themeToApply.id); // Add new theme class (optional, for CSS targeting)

    // Set CSS variables
    Object.entries(themeToApply.colors).forEach(([key, value]) => {
      const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });
    setCurrentTheme(themeToApply);
  }, []);

  useEffect(() => {
    const storedThemeId = localStorage.getItem('app-theme');
    const themeToLoad = themes.find(t => t.id === storedThemeId) || themes[0];
    applyTheme(themeToLoad);
  }, [applyTheme]);

  const setThemeById = (themeId: string) => {
    const newTheme = themes.find(t => t.id === themeId);
    if (newTheme) {
      applyTheme(newTheme);
      localStorage.setItem('app-theme', newTheme.id);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setThemeById, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
