import { useState } from 'react';
import { Language, useLanguage } from '../lib/language';
export function LanguageSelect({ onContinue }: { onContinue: () => void }) {
  const { setLanguage } = useLanguage(); const [hovered, setHovered] = useState<Language>('ru');
  const choose = (language: Language) => { setLanguage(language); onContinue(); };
  return <main className="language-screen"><div className="brand-static">Refri<span>.</span></div><div className="language-copy" aria-live="polite"><div className="eyebrow">{hovered === 'en' ? 'WELCOME TO REFRI' : 'ДОБРО ПОЖАЛОВАТЬ В REFRI'}</div><h1>{hovered === 'en' ? 'Choose your language' : 'Выберите язык'}</h1><p>{hovered === 'en' ? 'Choose the language you want to use.' : 'Выберите язык, на котором хотите продолжить работу.'}</p></div><div className="language-options"><button onMouseEnter={() => setHovered('en')} onFocus={() => setHovered('en')} onClick={() => choose('en')}><span>EN</span><b>English</b><small>Continue in English</small></button><button onMouseEnter={() => setHovered('ru')} onFocus={() => setHovered('ru')} onClick={() => choose('ru')}><span>RU</span><b>Русский</b><small>Продолжить на русском</small></button></div></main>;
}
