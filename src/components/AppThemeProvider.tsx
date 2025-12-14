"use client";

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from "next-themes/dist/types";
import { useTheme as useNextTheme } from 'next-themes';

export function AppThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export const useTheme = () => {
    const { theme, setTheme } = useNextTheme();
    return {
        theme: theme as 'light' | 'dark' | 'system',
        setTheme: setTheme as (theme: 'light' | 'dark' | 'system') => void,
    };
};
