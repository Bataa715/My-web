"use client";

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from "next-themes/dist/types";
import { themes } from '@/lib/themes';

export function AppThemeProvider({ children, ...props }: Omit<ThemeProviderProps, 'themes' | 'attribute' | 'defaultTheme'>) {
  const themeValues = themes.reduce((acc, theme) => {
    acc[theme.name] = `theme-${theme.name}`;
    return acc;
  }, {} as { [key: string]: string });

  return (
    <NextThemesProvider 
      {...props} 
      attribute="class"
      defaultTheme="dracula"
      value={themeValues}
      disableTransitionOnChange
    >
        {children}
    </NextThemesProvider>
  );
}
