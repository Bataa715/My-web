import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Орчуулгын дата
const resources = {
  mn: {
    translation: {
      common: {
        home: 'Нүүр',
        about: 'Тухай',
        tools: 'Хэрэгсэл',
        settings: 'Тохиргоо',
        logout: 'Гарах',
        login: 'Нэвтрэх',
        edit: 'Засварлах',
        view: 'Харах',
        theme: 'Загвар',
        language: 'Хэл',
        save: 'Хадгалах',
        cancel: 'Цуцлах',
        delete: 'Устгах',
        add: 'Нэмэх',
        search: 'Хайх',
      },
    },
  },
  en: {
    translation: {
      common: {
        home: 'Home',
        about: 'About',
        tools: 'Tools',
        settings: 'Settings',
        logout: 'Logout',
        login: 'Login',
        edit: 'Edit',
        view: 'View',
        theme: 'Theme',
        language: 'Language',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        add: 'Add',
        search: 'Search',
      },
    },
  },
  ja: {
    translation: {
      common: {
        home: 'ホーム',
        about: 'について',
        tools: 'ツール',
        settings: '設定',
        logout: 'ログアウト',
        login: 'ログイン',
        edit: '編集',
        view: '表示',
        theme: 'テーマ',
        language: '言語',
        save: '保存',
        cancel: 'キャンセル',
        delete: '削除',
        add: '追加',
        search: '検索',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'mn',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
