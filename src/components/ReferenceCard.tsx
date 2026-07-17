import { useEffect, useState } from 'react';
import { translateUserContent } from '../lib/contentTranslation';
import { useLanguage } from '../lib/language';
import { ArtReference, generateReferenceImage, getImageUrl, uploadFinalArtwork } from '../lib/references';
import { ImageLightbox } from './ImageLightbox';

type Props = { reference: ArtReference; onDelete: () => void; onHide: () => void; onGenerated: (path: string, field: 'image_path' | 'final_art_path') => void; onReward: () => void; isGuest?: boolean };

export function ReferenceCard({ reference, onDelete, onHide, onGenerated, onReward, isGuest = false }: Props) {
  const { language } = useLanguage();
  const [imageUrl, setImageUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showText, setShowText] = useState(false);
  const [message, setMessage] = useState('');
  const [shownDetails, setShownDetails] = useState(reference.details);
  const [translating, setTranslating] = useState(false);
  const [fullImage, setFullImage] = useState(false);
  useEffect(() => { const path = reference.final_art_path || reference.image_path; if (path) setImageUrl(getImageUrl(path)); }, [reference.image_path, reference.final_art_path]);
  useEffect(() => {
    if (!showText) return;
    let active = true; setTranslating(true);
    translateUserContent(reference.details, language).then((text) => { if (active) setShownDetails(text); }).finally(() => { if (active) setTranslating(false); });
    return () => { active = false; };
  }, [language, reference.details, showText]);

  async function generate() {
    setBusy(true); setMessage('');
    try { const path = await generateReferenceImage(reference); onGenerated(path, 'image_path'); setImageUrl(getImageUrl(path)); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Ошибка генерации'); }
    finally { setBusy(false); }
  }

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    setUploading(true); setMessage('Проверяем, похож ли рисунок на идею…');
    try { const result = await uploadFinalArtwork(reference, file); setImageUrl(getImageUrl(result.path)); onGenerated(result.path, 'final_art_path'); setMessage(`Принято! Начислено ${result.stars} ⭐`); onReward(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Рисунок не прошёл проверку'); }
    finally { setUploading(false); event.target.value = ''; }
  }

  return <article className="reference-card">
    <div className="artwork" onClick={() => imageUrl && setFullImage(true)}>{imageUrl ? <img src={imageUrl} alt={reference.title}/> : <div className="artwork-empty"><span>✦</span><small>Здесь появится визуал</small></div>}{reference.final_art_path && <span className="final-badge">Итоговый рисунок</span>}</div>
    <div className="card-body"><div className="card-title"><h2>{reference.title}</h2><div className="card-controls">{!isGuest && <button className="hide-reference" onClick={onHide}>{reference.is_hidden ? 'Вернуть' : 'Скрыть'}</button>}<button className="delete" onClick={onDelete} title="Удалить навсегда">×</button></div></div>
      <div className="tags"><span>{reference.theme}</span><span>{reference.art_style}</span><span>{reference.render_type}</span><span>{reference.pose}</span></div>
      <dl><div><dt>Волосы</dt><dd>{reference.hair}</dd></div><div><dt>Телосложение</dt><dd>{reference.build}</dd></div><div><dt>Одежда</dt><dd>{reference.outfit}</dd></div></dl>
      <button className="drawing-text-button" onClick={() => setShowText(!showText)}>✎ {showText ? 'Скрыть описание' : 'Рисовать по тексту'}</button>
      {showText && <section className="drawing-description"><p>{translating ? (language === 'en' ? 'Translating…' : 'Переводим…') : shownDetails}</p><p>{reference.prompt}</p></section>}
      {!isGuest && <><button className="generate" disabled={busy} onClick={generate}>{busy ? 'Создаём…' : reference.image_path ? '↻ Сгенерировать заново' : '✦ Сгенерировать картинку'}</button><label className="upload-art">{uploading ? 'Проверяем рисунок…' : '＋ Прикрепить свой рисунок'}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} disabled={uploading}/></label></>}{message && <p className="message">{message}</p>}
    </div>
    {fullImage && imageUrl && <ImageLightbox src={imageUrl} alt={reference.title} onClose={() => setFullImage(false)}/>}</article>;
}
