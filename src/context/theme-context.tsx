
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

type Theme = "default" | "forest" | "sunset" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('default');

  useEffect(() => {
    const storedTheme = localStorage.getItem('myGaadiTheme') as Theme | null;
    if (storedTheme && ['default', 'forest', 'sunset', 'dark'].includes(storedTheme)) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    document.body.classList.remove('theme-forest', 'theme-sunset', 'dark');
    if (theme !== 'default') {
      document.body.classList.add(`theme-${theme}`);
    }
    localStorage.setItem('myGaadiTheme', theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
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
