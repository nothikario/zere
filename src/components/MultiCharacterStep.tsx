import { maleHairOptions, steps, WizardKey, WizardValues } from '../lib/wizardOptions';

const keys: WizardKey[] = ['gender', 'hairColor', 'hair', 'face', 'emotion', 'build', 'outfit'];
type LinkKey = 'hairLink' | 'outfitLink';
type Props = { character: WizardValues; index: number; onChange: (key: WizardKey, value: string) => void; onLink: (key: LinkKey, value: string) => void; onComment: (value: string) => void };

export function MultiCharacterStep({ character, index, onChange, onLink, onComment }: Props) {
  return <section className="character-page"><div className="eyebrow">ПЕРСОНАЖ {index + 1}</div><h1>Создай образ <em>персонажа {index + 1}</em></h1><p className="lead">Вся внешность героя собрана на одной странице.</p>
    <div className="appearance-sections">{keys.map((key) => {
      const config = steps.find((step) => step.key === key)!;
      const options = key === 'hair' && character.gender === 'Парень' ? maleHairOptions : config.options;
      const custom = Boolean(character[key]) && !options.includes(character[key]);
      const linkKey = config.link === 'hairLink' || config.link === 'outfitLink' ? config.link : undefined;
      return <section className="appearance-group" key={key}><h2>{config.title}</h2><div className="appearance-options">{options.map((option) => <button type="button" key={option} className={character[key] === option ? 'appearance-option selected' : 'appearance-option'} onClick={() => onChange(key, option)}>{option}<i>{character[key] === option ? '✓' : '○'}</i></button>)}</div>
        <label className="appearance-custom"><span>Свой вариант</span><input value={custom ? character[key] : ''} onChange={(event) => onChange(key, event.target.value)} placeholder={config.customPlaceholder}/></label>
        {linkKey && <label className="appearance-custom"><span>Ссылка на пример</span><input type="url" value={character[linkKey]} onChange={(event) => onLink(linkKey, event.target.value)} placeholder="https://…"/></label>}
      </section>;
    })}</div>
    <label className="character-comment"><span>Дополнительное описание персонажа</span><textarea value={character.comments.gender} onChange={(event) => onComment(event.target.value)} placeholder="Особые детали, аксессуары, характер…"/></label>
  </section>;
}
