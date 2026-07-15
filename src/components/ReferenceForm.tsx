import { useMemo, useState } from 'react';
import { ArtReference, createReference, generateReferenceImage, getImageUrl, ReferenceDraft } from '../lib/references';
import { emptyWizard, steps, WizardKey, WizardValues } from '../lib/wizardOptions';
import { ChoiceStep } from './ChoiceStep';

function makeDraft(values: WizardValues): ReferenceDraft {
  const additions = steps
    .filter(({ key }) => values.comments[key])
    .map(({ key }) => `${key}: ${values.comments[key]}`)
    .join('; ');
  const links = [values.hairLink && `Пример причёски: ${values.hairLink}`, values.outfitLink && `Пример одежды: ${values.outfitLink}`].filter(Boolean).join('. ');
  const details = `Пол/образ: ${values.gender}. Лицо: ${values.face}. Эмоция: ${values.emotion}. ${additions}. ${links}`;
  const prompt = `Full-body character reference, ${values.gender}, ${values.theme}. Hair: ${values.hair}. Face: ${values.face}. Emotion: ${values.emotion}. Body type: ${values.build}. Outfit: ${values.outfit}. Pose: ${values.pose}. ${details}. Detailed concept art, clear silhouette, neutral background.`;
  return { title: `${values.theme} — ${values.gender}`, theme: values.theme, pose: values.pose, hair: values.hair, build: values.build, outfit: values.outfit, details, prompt };
}

export function ReferenceForm({ onCreated }: { onCreated: () => void }) {
  const [values, setValues] = useState<WizardValues>(emptyWizard);
  const [stepIndex, setStepIndex] = useState(0);
  const [saved, setSaved] = useState<ArtReference | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [busy, setBusy] = useState<'generate' | 'save' | ''>('');
  const [message, setMessage] = useState('');
  const draft = useMemo(() => makeDraft(values), [values]);
  const isSummary = stepIndex === steps.length;
  const step = steps[Math.min(stepIndex, steps.length - 1)];

  function setValue(key: WizardKey, value: string) { setValues((current) => ({ ...current, [key]: value })); }
  function setComment(key: WizardKey, value: string) { setValues((current) => ({ ...current, comments: { ...current.comments, [key]: value } })); }
  async function ensureSaved() { if (saved) return saved; const created = await createReference(draft); setSaved(created); return created; }
  async function generate() {
    setBusy('generate'); setMessage('');
    try { const reference = await ensureSaved(); const path = await generateReferenceImage(reference); setSaved({ ...reference, image_path: path }); setImageUrl(await getImageUrl(path)); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не получилось создать изображение'); }
    finally { setBusy(''); }
  }
  async function save() {
    setBusy('save'); setMessage('');
    try { await ensureSaved(); onCreated(); }
    catch { setMessage('Не получилось сохранить референс. Попробуй ещё раз.'); setBusy(''); }
  }

  return <main className="page wizard-page">
    <div className="progress"><span style={{ width: `${((stepIndex + 1) / (steps.length + 1)) * 100}%` }} /></div>
    {!isSummary ? <ChoiceStep step={step} value={values[step.key]} comment={values.comments[step.key]} link={step.link ? values[step.link] : ''} onValue={(value) => setValue(step.key, value)} onComment={(value) => setComment(step.key, value)} onLink={(value) => step.link && setValues((current) => ({ ...current, [step.link!]: value }))} /> : <section className="reference-result">
      <div className="eyebrow">РЕФЕРЕНС ГОТОВ</div><h1>Посмотри, что <em>получилось</em></h1>
      <div className="result-layout"><div className="result-image">{imageUrl ? <img src={imageUrl} alt={draft.title} /> : <div><span>✦</span><p>Здесь появится генерация</p></div>}</div><div className="result-copy"><h2>{draft.title}</h2><p>{draft.details}</p><h3>Поза и образ</h3><p>{values.pose}. {values.comments.pose}</p><h3>Промпт</h3><p className="result-prompt">{draft.prompt}</p></div></div>
      <div className="result-actions"><button className="generate-large" disabled={Boolean(busy)} onClick={generate}>{busy === 'generate' ? 'Создаём…' : '✦ Создать генерацию'}</button><button className="primary" disabled={Boolean(busy)} onClick={save}>{busy === 'save' ? 'Сохраняем…' : 'Сохранить референс →'}</button></div>
    </section>}
    {message && <p className="message wizard-message">{message}</p>}
    {!isSummary && <div className="wizard-navigation"><button className="back-button" disabled={stepIndex === 0} onClick={() => setStepIndex((index) => index - 1)}>← Назад</button><span>{stepIndex + 1} / {steps.length}</span><button className="next-button" disabled={!values[step.key]} onClick={() => setStepIndex((index) => index + 1)}>{stepIndex === steps.length - 1 ? 'Создать референс →' : 'Далее →'}</button></div>}
  </main>;
}
