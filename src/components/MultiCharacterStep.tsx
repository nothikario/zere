import { maleHairOptions, steps, WizardKey, WizardValues } from '../lib/wizardOptions';

const keys: WizardKey[] = ['gender', 'hairColor', 'hair', 'face', 'emotion', 'build', 'outfit'];
type Props = { characters: WizardValues[]; count: number; onChange: (index: number, key: WizardKey, value: string) => void; onComment: (index: number, value: string) => void };

export function MultiCharacterStep({ characters, count, onChange, onComment }: Props) {
  return <section className="multi-character-step"><div className="eyebrow">ПЕРСОНАЖИ</div><h1>Как выглядят герои?</h1><p className="lead">Заполни внешность каждого персонажа на одной странице.</p><div className="character-editor-list">{characters.slice(0, count).map((person, index) => <article className="character-editor" key={index}><h2>Персонаж {index + 1}</h2><div className="character-fields">{keys.map((key) => { const config = steps.find((step) => step.key === key)!; const options = key === 'hair' && person.gender === 'Парень' ? maleHairOptions : config.options; return <label key={key}><span>{config.title.replace(/ — персонаж.*/, '')}</span><select value={person[key]} onChange={(event) => onChange(index, key, event.target.value)}><option value="">Выбери вариант</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; })}</div><label className="character-comment"><span>Дополнительное описание</span><textarea value={person.comments.gender} onChange={(event) => onComment(index, event.target.value)} placeholder={`Особенности персонажа ${index + 1}`}/></label></article>)}</div></section>;
}
