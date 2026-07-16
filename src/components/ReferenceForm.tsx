import { useEffect, useMemo, useState } from 'react';
import { ArtReference, createReference, generateGuestImage, generateReferenceImage, getImageUrl, ReferenceDraft } from '../lib/references';
import { allHairOptions, emptyWizard, femaleHairOptions, guestDefaults, guestOptions, maleHairOptions, outfitOptionsFor, steps, WizardKey, WizardValues } from '../lib/wizardOptions';
import { hasGuestReference, markGuestReferenceCreated, saveGuestReference } from '../lib/usage';
import { ChoiceStep } from './ChoiceStep';
import { MultiCharacterStep } from './MultiCharacterStep';
import { useLanguage } from '../lib/language';

const globalKeys: WizardKey[] = ['peopleCount', 'theme', 'style', 'renderType'];
const characterKeys: WizardKey[] = ['gender', 'hairColor', 'hair', 'face', 'emotion', 'build', 'outfit'];
type FlowItem = { key: WizardKey; characterIndex?: number; multi?: boolean };
const fresh = (guest: boolean) => { const source = guest ? guestDefaults : emptyWizard; return { ...source, comments: { ...source.comments } }; };

function makeDraft(values: WizardValues, characters: WizardValues[]): ReferenceDraft {
  const count = Number(values.peopleCount || 1);
  const people = characters.slice(0, count).map((person, index) => `Персонаж ${index + 1}: ${person.gender}, волосы ${person.hairColor}, ${person.hair}, лицо ${person.face}, эмоция ${person.emotion}, телосложение ${person.build}, образ ${person.outfit}${person.outfit === 'Школьная форма' ? `, ${person.bottom}` : ''}, детали ${person.comments.gender}.${person.hairLink ? ` Пример волос: ${person.hairLink}.` : ''}${person.outfitLink ? ` Пример одежды: ${person.outfitLink}.` : ''}`).join(' ');
  const pose = `Поза: ${values.pose}. Взаимодействие: ${values.comments.pose}. ${values.poseLink ? `Пример позы: ${values.poseLink}.` : ''}`;
  const first = characters[0];
  const background = `Фон: ${values.background}. ${values.comments.background}`;
  return { title: `${values.theme} — ${count} персонаж${count === 1 ? '' : 'а'}`, theme: values.theme, pose: values.pose, hair: first.hair, build: first.build, outfit: `${first.outfit}${first.outfit === 'Школьная форма' ? `, ${first.bottom}` : ''}`, details: `${people} ${pose} ${background}`, prompt: `${count} full-body characters, ${values.theme}, ${values.style} style, ${values.renderType}. ${people} ${pose} ${background} Clear composition.`, art_style: values.style, render_type: values.renderType, people_count: count };
}

export function ReferenceForm({ onCreated, isGuest = false }: { onCreated: (reference?: ArtReference) => void; isGuest?: boolean }) {
  const { language } = useLanguage();
  const [values, setValues] = useState<WizardValues>(() => fresh(isGuest));
  const [characters, setCharacters] = useState<WizardValues[]>(() => Array.from({ length: 4 }, () => fresh(isGuest)));
  const [stepIndex, setStepIndex] = useState(0); const [saved, setSaved] = useState<ArtReference | null>(null);
  const [imageUrl, setImageUrl] = useState(''); const [busy, setBusy] = useState(''); const [message, setMessage] = useState(''); const [styleExample, setStyleExample] = useState<File>();
  const count = Number(values.peopleCount || 1);
  const flow = useMemo<FlowItem[]>(() => {
    const single = characterKeys.flatMap((key) => key === 'outfit' && characters[0].outfit === 'Школьная форма' ? [{ key, characterIndex: 0 }, { key: 'bottom' as WizardKey, characterIndex: 0 }] : [{ key, characterIndex: 0 }]);
    return [...globalKeys.map((key) => ({ key })), ...(count === 1 ? single : Array.from({ length: count }, (_, characterIndex) => ({ key: 'gender' as WizardKey, characterIndex, multi: true }))), { key: 'background' }, { key: 'pose' }];
  }, [characters, count]);
  const isSummary = stepIndex >= flow.length; const current = flow[Math.min(stepIndex, flow.length - 1)];
  const step = steps.find(({ key }) => key === current.key) ?? steps[0];
  const active = current.characterIndex === undefined ? values : characters[current.characterIndex];
  const draft = useMemo(() => makeDraft(values, characters), [values, characters]);
  const friendlyError = (error: unknown, fallback: string) => {
    const text = error instanceof Error ? error.message : '';
    if (text.toLowerCase().includes('лимит')) return language === 'en' ? "Today's reference creation limit has been reached." : 'Количество созданных референсов на сегодня исчерпано.';
    return text || fallback;
  };

  function update(key: WizardKey, value: string, comment = false) { const change = (item: WizardValues) => comment ? { ...item, comments: { ...item.comments, [key]: value } } : { ...item, [key]: value }; if (current.characterIndex === undefined) setValues(change); else setCharacters((all) => all.map((item, index) => index === current.characterIndex ? change(item) : item)); }
  function updateCharacter(index: number, key: WizardKey, value: string) { setCharacters((all) => all.map((item, position) => position === index ? { ...item, [key]: value } : item)); }
  function updateComment(index: number, value: string) { setCharacters((all) => all.map((item, position) => position === index ? { ...item, comments: { ...item.comments, gender: value } } : item)); }
  function updateLink(index: number, key: 'hairLink' | 'outfitLink', value: string) { setCharacters((all) => all.map((item, position) => position === index ? { ...item, [key]: value } : item)); }
  async function ensureSaved() { if (saved) return saved; if (isGuest) { if (hasGuestReference()) throw new Error(language === 'en' ? 'Guest mode allows only 1 reference per day.' : 'В гостевом режиме доступен только 1 референс в день.'); const created = { ...draft, id: 'guest', user_id: 'guest', image_path: null, final_art_path: null, is_hidden: false, created_at: new Date().toISOString() } as ArtReference; setSaved(created); return created; } const created = await createReference(draft); setSaved(created); return created; }
  useEffect(() => { if (isSummary && !saved) ensureSaved().catch((error) => setMessage(friendlyError(error, 'Ошибка создания'))); }, [isSummary]);
  async function generate() { setBusy('generate'); try { const reference = await ensureSaved(); if (isGuest) { setImageUrl(await generateGuestImage(reference.prompt)); markGuestReferenceCreated(); } else { const path = await generateReferenceImage(reference, styleExample); setSaved({ ...reference, image_path: path }); setImageUrl(getImageUrl(path)); } } catch (error) { setMessage(friendlyError(error, 'Ошибка генерации')); } finally { setBusy(''); } }
  async function save() { setBusy('save'); try { const reference = await ensureSaved(); const completed = isGuest ? { ...reference, image_path: imageUrl || null } : reference; if (isGuest) saveGuestReference(completed); onCreated(completed); } catch (error) { setMessage(friendlyError(error, 'Ошибка сохранения')); setBusy(''); } }

  const hairOptions = active.gender === 'Парень' ? maleHairOptions : active.gender === 'Девушка' ? femaleHairOptions : allHairOptions;
  const options = step.key === 'hair' ? hairOptions : step.key === 'outfit' ? outfitOptionsFor(values.theme) : step.options;
  const allowedOptions = isGuest ? (step.key === 'hair' ? hairOptions : guestOptions[step.key] ?? options) : undefined;
  const shownStep = current.characterIndex === undefined || count === 1 ? step : { ...step, eyebrow: `ПЕРСОНАЖ ${current.characterIndex + 1}`, title: `${step.title} — персонаж ${current.characterIndex + 1}` };
  const charactersReady = current.characterIndex === undefined || characterKeys.every((key) => characters[current.characterIndex!][key]);
  const linkKey = step.link;
  const linkValue = linkKey ? active[linkKey] : '';
  const changeLink = (value: string) => { if (!linkKey) return; if (current.characterIndex === undefined) setValues((item) => ({ ...item, [linkKey]: value })); else setCharacters((all) => all.map((item, index) => index === current.characterIndex ? { ...item, [linkKey]: value } : item)); };
  const form = current.multi ? <MultiCharacterStep character={characters[current.characterIndex!]} theme={values.theme} index={current.characterIndex!} onChange={(key, value) => updateCharacter(current.characterIndex!, key, value)} onLink={(key, value) => updateLink(current.characterIndex!, key, value)} onComment={(value) => updateComment(current.characterIndex!, value)}/> : <><ChoiceStep step={{ ...shownStep, options }} value={active[step.key]} comment={active.comments[step.key]} link={linkValue} restricted={isGuest} allowedOptions={allowedOptions} hideCustom={step.key === 'peopleCount'} onValue={(value) => update(step.key, value)} onComment={(value) => update(step.key, value, true)} onLink={changeLink}/>{step.key === 'style' && !isGuest && <label className="style-upload"><span>Фото своей работы для похожего стиля</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setStyleExample(event.target.files?.[0])}/><small>{styleExample?.name ?? 'Необязательно'}</small></label>}</>;
  return <main className="page wizard-page"><div className="progress"><span style={{ width: `${((stepIndex + 1) / (flow.length + 1)) * 100}%` }}/></div>{!isSummary ? form : <section className="reference-result"><div className="eyebrow">РЕФЕРЕНС ГОТОВ</div><h1>Посмотри, что <em>получилось</em></h1><div className="result-layout"><div className="result-image">{imageUrl ? <img src={imageUrl} alt={draft.title}/> : <div><span>✦</span><p>Здесь появится генерация</p></div>}</div><div className="result-copy"><h2>{draft.title}</h2><p>{draft.details}</p><h3>Стиль</h3><p>{values.style} · {values.renderType}</p><h3>Промпт</h3><p className="result-prompt">{draft.prompt}</p></div></div><div className="result-actions"><button className="generate-large" disabled={Boolean(busy)} onClick={generate}>{busy === 'generate' ? 'Создаём…' : '✦ Создать генерацию'}</button><button className="primary" disabled={Boolean(busy)} onClick={save}>В мои референсы →</button></div></section>}{message && <p className="message wizard-message">{message}</p>}{!isSummary && <div className="wizard-navigation"><button className="back-button" disabled={!stepIndex} onClick={() => setStepIndex(stepIndex - 1)}>← Назад</button><span>{stepIndex + 1} / {flow.length}</span><button className="next-button" disabled={current.multi ? !charactersReady : !active[step.key]} onClick={() => setStepIndex(stepIndex + 1)}>{stepIndex === flow.length - 1 ? 'Создать референс →' : 'Далее →'}</button></div>}</main>;
}
