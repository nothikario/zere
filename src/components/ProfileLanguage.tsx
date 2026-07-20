import { Language, useLanguage } from '../lib/language';

const languages: { key: Language; label: string }[] = [
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' },
];

export function ProfileLanguage() {
  const { language, setLanguage } = useLanguage();
  const en = language === 'en';

  return <section className="settings-card">
    <h2>{en ? 'Site language' : 'Язык сайта'}</h2>
    <p className="settings-help">{en ? 'Choose the language used in the interface.' : 'Выбери язык интерфейса сайта.'}</p>
    <div className="settings-language-options">
      {languages.map((item) => <button
        type="button"
        className={language === item.key ? 'selected' : ''}
        aria-pressed={language === item.key}
        key={item.key}
        onClick={() => setLanguage(item.key)}
      ><span>{item.key.toUpperCase()}</span>{item.label}</button>)}
    </div>
  </section>;
}
