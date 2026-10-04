'use client';

import {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import i18n from '@/lib/i18n';
import { I18nextProvider } from 'react-i18next';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  languages: { code: string; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const languages = [
  { code: 'mn', name: 'Монгол', flag: '🇲🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: 'Japan', flag: '🇯🇵' },
];

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState('mn');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('i18nextLng') || 'mn';
    setLanguageState(savedLang);
    if (i18n.isInitialized) {
      i18n.changeLanguage(savedLang);
    }
  }, []);

  const setLanguage = (lang: string) => {
    console.log('Setting language to:', lang);
    setLanguageState(lang);
    if (i18n.isInitialized) {
      i18n.changeLanguage(lang);
    }
    localStorage.setItem('i18nextLng', lang);
    // Force a re-render by reloading
    window.location.reload();
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={{ language, setLanguage, languages }}>
        {children}
      </LanguageContext.Provider>
    </I18nextProvider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within an I18nProvider');
  }
  return context;
}
