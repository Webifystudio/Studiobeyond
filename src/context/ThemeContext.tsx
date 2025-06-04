
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
    
    // Remove any existing theme ID classes if needed (currently not using id class for styling)
    // themes.forEach(t => root.classList.remove(t.id));
    // root.classList.add(themeToApply.id);


    // Set CSS variables for colors
    Object.entries(themeToApply.colors).forEach(([key, value]) => {
      const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });

    // Set CSS variables for fonts
    root.style.setProperty('--font-family-body', themeToApply.fontFamilyBody || "'Inter', sans-serif");
    root.style.setProperty('--font-family-headline', themeToApply.fontFamilyHeadline || "'Inter', sans-serif");

    // Set CSS variable for background gradient
    if (themeToApply.backgroundGradient) {
      root.style.setProperty('--background-gradient', themeToApply.backgroundGradient);
    } else {
      // Fallback or remove if no gradient
      root.style.removeProperty('--background-gradient'); 
      // Ensure --background solid color is primary if gradient is removed
      // This is handled by body { background: var(--background-gradient, var(--background)) } in CSS
    }

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

    