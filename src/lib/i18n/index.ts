import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';

function detectLanguage(): string {
  const stored = localStorage.getItem('m_and_m:locale');
  if (stored === 'en' || stored === 'es') return stored;

  const browser = navigator.language.slice(0, 2);
  return browser === 'es' ? 'es' : 'en';
}

i18next.use(initReactI18next).init({
  lng: detectLanguage(),
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  interpolation: {
    escapeValue: false, // React already escapes
  },
});

export default i18next;
