import { useState } from 'react';
import { useLanguage } from '../lib/language';

type Stage = 'offer' | 'steps' | 'declined';
type Props = { onClose: () => void; onStartCreating: () => void };

const content = {
  ru: [
    ['Выбирай готовые варианты', 'На каждом этапе выбери подходящую карточку или напиши свой вариант. Так персонаж получится именно таким, как ты задумал.'],
    ['Комментарии необязательны', 'Поле «Комментарий к выбору» можно пропустить. Заполняй его, только если хочешь добавить важную деталь.'],
    ['Можно вставлять ссылки', 'В поле «Свой вариант» можно вставить ссылку на картинку из Pinterest или другого сайта. Она станет визуальным примером.'],
    ['Создай и сохрани', 'После всех шагов нажми «Создать генерацию», а затем «В мои референсы». Результат появится в твоей коллекции.'],
  ],
  en: [
    ['Choose ready-made options', 'At each step, select a card or enter your own option to describe the character you imagined.'],
    ['Comments are optional', 'You can skip “Comment on your choice”. Use it only when an extra detail is important.'],
    ['You can paste links', 'Paste a Pinterest or other image link into “Custom option” to use it as a visual example.'],
    ['Create and save', 'After all steps, select “Create generation” and then “Add to my references” to save it.'],
  ],
};

export function OnboardingTutorial({ onClose, onStartCreating }: Props) {
  const { language } = useLanguage(); const en = language === 'en';
  const [stage, setStage] = useState<Stage>('offer'); const [step, setStep] = useState(0);
  const steps = content[language];
  if (stage === 'offer') return <Overlay><div className="onboarding-icon">✦</div><h2>{en ? 'Would you like a quick tutorial?' : 'Хочешь пройти короткое обучение?'}</h2><p>{en ? 'We will show you how to create and save your first reference.' : 'Покажем по шагам, как создать и сохранить первый референс.'}</p><div className="onboarding-actions"><button className="onboarding-primary" onClick={() => setStage('steps')}>{en ? 'Yes, show me' : 'Да, пройти'}</button><button onClick={() => setStage('declined')}>{en ? 'Not now' : 'Не сейчас'}</button></div></Overlay>;
  if (stage === 'declined') return <Overlay><div className="onboarding-icon">?</div><h2>{en ? 'Help is always nearby' : 'Помощь всегда рядом'}</h2><p>{en ? 'Use “Start tutorial” in the top menu whenever you have a question. The AI tutor will help.' : 'В любой момент нажми «Пройти обучение» в верхнем меню — там можно задать вопрос AI-помощнику.'}</p><button className="onboarding-primary" onClick={onClose}>{en ? 'Got it' : 'Понятно'}</button></Overlay>;
  const last = step === steps.length - 1;
  return <Overlay><div className="onboarding-progress">{steps.map((_, index) => <span key={index} className={index <= step ? 'active' : ''}/>)}</div><div className="onboarding-step-number">{en ? 'STEP' : 'ШАГ'} {step + 1} / {steps.length}</div><h2>{steps[step][0]}</h2><p>{steps[step][1]}</p><div className="onboarding-actions"><button disabled={!step} onClick={() => setStep(step - 1)}>← {en ? 'Back' : 'Назад'}</button><button className="onboarding-primary" onClick={() => last ? onStartCreating() : setStep(step + 1)}>{last ? (en ? 'Create a reference' : 'Создать референс') : (en ? 'Next' : 'Далее')} →</button></div></Overlay>;
}

function Overlay({ children }: { children: React.ReactNode }) {
  return <div className="onboarding-backdrop" role="dialog" aria-modal="true"><section className="onboarding-card">{children}</section></div>;
}
