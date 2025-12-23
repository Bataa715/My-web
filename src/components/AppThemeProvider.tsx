
"use client";

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from "next-themes/dist/types";
import { themes } from '@/lib/themes';

export function AppThemeProvider({ children, ...props }: Omit<ThemeProviderProps, 'themes' | 'attribute' | 'defaultTheme'>) {
  const themeNames = themes.map(t => t.name);
  
  return (
    <NextThemesProvider 
      {...props} 
      themes={themeNames}
      attribute="class"
      defaultTheme="dracula"
      disableTransitionOnChange
    >
        {children}
    </NextThemesProvider>
  );
}
