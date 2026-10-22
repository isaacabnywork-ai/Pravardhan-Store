'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState<boolean>(false);

  // Read saved theme from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pravdhan_theme') as Theme | null;
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
        setThemeState(saved);
      } else {
        // Detect if document already has dark class from SSR/head script
        if (document.documentElement.classList.contains('dark')) {
          setThemeState('dark');
        } else {
          setThemeState('light');
        }
      }
    } catch {
      // Ignore storage errors
    }
    setMounted(true);
  }, []);

  // Update HTML class, attributes and localStorage whenever theme changes
  useEffect(() => {
    if (!mounted && typeof window === 'undefined') return;

    const root = document.documentElement;
    let effective: 'light' | 'dark' = 'light';

    if (theme === 'system') {
      const systemDark =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      effective = systemDark ? 'dark' : 'light';
    } else {
      effective = theme;
    }

    setResolvedTheme(effective);

    if (effective === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }

    try {
      localStorage.setItem('pravdhan_theme', theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme, mounted]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
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
