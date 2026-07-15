import { WizardStep } from '../lib/wizardOptions';

type Props = {
  step: WizardStep;
  value: string;
  comment: string;
  link: string;
  onValue: (value: string) => void;
  onComment: (value: string) => void;
  onLink: (value: string) => void;
};

export function ChoiceStep({ step, value, comment, link, onValue, onComment, onLink }: Props) {
  const isCustom = Boolean(value) && !step.options.includes(value);
  return <section className="choice-step">
    <div className="eyebrow">{step.eyebrow}</div>
    <h1>{step.title}</h1>
    <p className="lead">{step.hint}</p>
    <div className="choice-grid">{step.options.map((option) => <button type="button" key={option} className={value === option ? 'choice selected' : 'choice'} onClick={() => onValue(option)}><span>{option}</span><i>{value === option ? '✓' : '○'}</i></button>)}</div>
    <label className="custom-choice"><span>Свой вариант</span><input value={isCustom ? value : ''} onChange={(event) => onValue(event.target.value)} placeholder={step.customPlaceholder} /></label>
    {step.link && <label className="custom-choice"><span>Ссылка на пример</span><input type="url" value={link} onChange={(event) => onLink(event.target.value)} placeholder="https://…" /></label>}
    <label className="custom-choice comment-choice"><span>Комментарий к выбору</span><textarea value={comment} onChange={(event) => onComment(event.target.value)} placeholder={step.commentPlaceholder} /></label>
  </section>;
}
