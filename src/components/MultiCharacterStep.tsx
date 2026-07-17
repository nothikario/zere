import { allHairOptions, femaleHairOptions, maleHairOptions, outfitOptionsFor, steps, WizardKey, WizardValues } from '../lib/wizardOptions';

const keys: WizardKey[] = ['gender', 'hairColor', 'hair', 'face', 'emotion', 'build', 'outfit'];
type LinkKey = 'hairLink' | 'outfitLink';
type Props = { character: WizardValues; theme: string; index: number; onChange: (key: WizardKey, value: string) => void; onLink: (key: LinkKey, value: string) => void; onComment: (value: string) => void };

export function MultiCharacterStep({ character, theme, index, onChange, onLink, onComment }: Props) {
  return <section className="character-page"><div className="eyebrow">ПЕРСОНАЖ {index + 1}</div><h1>Создай образ <em>персонажа {index + 1}</em></h1><p className="lead">Вся внешность героя собрана на одной странице.</p>
    <div className="appearance-sections">{keys.map((key) => {
      const config = steps.find((step) => step.key === key)!;
      const options = key === 'hair' ? (character.gender === 'Парень' ? maleHairOptions : character.gender === 'Девушка' ? femaleHairOptions : allHairOptions) : key === 'outfit' ? outfitOptionsFor(theme) : config.options;
      const custom = Boolean(character[key]) && !options.includes(character[key]);
      const linkKey = config.link === 'hairLink' || config.link === 'outfitLink' ? config.link : undefined;
      const customValue = linkKey && character[linkKey] ? character[linkKey] : custom ? character[key] : '';
      const changeCustom = (value: string) => {
        const isLink = /^https?:\/\//i.test(value.trim());
        if (linkKey) onLink(linkKey, isLink ? value.trim() : '');
        onChange(key, isLink ? 'Референс по ссылке' : value);
      };
      return <section className="appearance-group" key={key}><h2>{config.title}</h2><div className="appearance-options">{options.map((option) => <button type="button" key={option} className={character[key] === option ? 'appearance-option selected' : 'appearance-option'} onClick={() => onChange(key, option)}>{option}<i>{character[key] === option ? '✓' : '○'}</i></button>)}</div>
        <label className="appearance-custom"><span>Свой вариант</span><input name={`character-${index + 1}-${key}-custom`} value={customValue} onChange={(event) => changeCustom(event.target.value)} placeholder={linkKey ? 'Опиши вариант или вставь ссылку https://…' : config.customPlaceholder}/>{linkKey && <small>Можно вставить ссылку на картинку, например из Pinterest</small>}</label>
        {key === 'outfit' && character.outfit === 'Школьная форма' && <div className="appearance-group"><h2>Брюки или юбка?</h2><div className="appearance-options">{['Брюки', 'Юбка'].map((option) => <button type="button" key={option} className={character.bottom === option ? 'appearance-option selected' : 'appearance-option'} onClick={() => onChange('bottom', option)}>{option}<i>{character.bottom === option ? '✓' : '○'}</i></button>)}</div></div>}
      </section>;
    })}</div>
    <label className="character-comment"><span>Дополнительное описание персонажа</span><textarea name={`character-${index + 1}-description`} value={character.comments.gender} onChange={(event) => onComment(event.target.value)} placeholder="Особые детали, аксессуары, характер…"/></label>
  </section>;
}
