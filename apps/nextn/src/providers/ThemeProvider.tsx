'use client';

import * as React from 'react';
import { DEFAULT_PALETTE, type PaletteId } from '@/lib/themes';

type Theme = string;

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  palette: PaletteId;
  setPalette: (palette: PaletteId) => void;
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
  palette: DEFAULT_PALETTE,
  setPalette: () => {},
});

export function useTheme() {
  return React.useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>('light');

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', DEFAULT_PALETTE);
    try {
      localStorage.setItem('theme', theme);
      localStorage.setItem('site-palette', DEFAULT_PALETTE);
    } catch {}
  }, [theme]);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const setPalette = React.useCallback((_next: PaletteId) => {
    /* Single identity — switcher removed. */
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        palette: DEFAULT_PALETTE,
        setPalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
