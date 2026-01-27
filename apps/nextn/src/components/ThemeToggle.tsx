'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme as useNextTheme } from 'next-themes';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { setTheme, theme } = useNextTheme();
  const { firestore, user } = useFirebase();
  const [hasSynced, setHasSynced] = React.useState(false);

  // Load theme from Firestore when user logs in
  React.useEffect(() => {
    async function loadThemeFromFirestore() {
      if (!firestore || !user || hasSynced) return;

      try {
        const settingsRef = doc(
          firestore,
          `users/${user.uid}/settings/preferences`
        );
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          if (data.theme && ['light', 'dark', 'system'].includes(data.theme)) {
            setTheme(data.theme);
          }
        }
        setHasSynced(true);
      } catch (error) {
        console.error('Error loading theme from Firestore:', error);
        setHasSynced(true);
      }
    }

    loadThemeFromFirestore();
  }, [firestore, user, hasSynced, setTheme]);

  // Save theme to Firestore when it changes
  const handleSetTheme = React.useCallback(
    async (newTheme: string) => {
      setTheme(newTheme);

      if (!firestore || !user) return;

      try {
        const settingsRef = doc(
          firestore,
          `users/${user.uid}/settings/preferences`
        );
        await setDoc(settingsRef, { theme: newTheme }, { merge: true });
      } catch (error) {
        console.error('Error saving theme to Firestore:', error);
      }
    },
    [firestore, user, setTheme]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleSetTheme('light')}>
          Цайвар
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSetTheme('dark')}>
          Бараан
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSetTheme('system')}>
          Систем
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
