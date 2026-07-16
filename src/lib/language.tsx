import { createContext, ReactNode, useContext, useState } from 'react';
export type Language = 'ru' | 'en';
const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void } | null>(null);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => localStorage.getItem('refri-language') === 'en' ? 'en' : 'ru');
  const setLanguage = (next: Language) => { localStorage.setItem('refri-language', next); document.documentElement.lang = next; setLanguageState(next); };
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { const value = useContext(LanguageContext); if (!value) throw new Error('LanguageProvider is missing'); return value; }
