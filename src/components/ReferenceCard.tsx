import { useEffect, useState } from 'react';
import { ArtReference, generateReferenceImage, getImageUrl, uploadFinalArtwork } from '../lib/references';

type Props = { reference: ArtReference; onDelete: () => void; onGenerated: (path: string, field: 'image_path' | 'final_art_path') => void };

export function ReferenceCard({ reference, onDelete, onGenerated }: Props) {
  const [imageUrl, setImageUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDrawingText, setShowDrawingText] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { const path = reference.final_art_path || reference.image_path; if (path) setImageUrl(getImageUrl(path)); }, [reference.image_path, reference.final_art_path]);
  async function generate() {
    setBusy(true); setError('');
    try { const path = await generateReferenceImage(reference); onGenerated(path, 'image_path'); setImageUrl(getImageUrl(path)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Ошибка генерации'); }
    finally { setBusy(false); }
  }
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    setUploading(true); setError('');
    try { const path = await uploadFinalArtwork(reference, file); setImageUrl(getImageUrl(path)); onGenerated(path, 'final_art_path'); }
    catch { setError('Не получилось загрузить рисунок'); }
    finally { setUploading(false); }
  }
  async function copyPrompt() {
    await navigator.clipboard.writeText(reference.prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }
  return <article className="reference-card"><div className="artwork">{imageUrl ? <img src={imageUrl} alt={reference.title} /> : <div className="artwork-empty"><span>✦</span><small>Здесь появится визуал</small></div>}{reference.final_art_path && <span className="final-badge">Итоговый рисунок</span>}</div><div className="card-body"><div className="card-title"><h2>{reference.title}</h2><button className="delete" onClick={onDelete} title="Удалить">×</button></div><div className="tags"><span>{reference.theme}</span><span>{reference.pose}</span></div><dl><div><dt>Волосы</dt><dd>{reference.hair}</dd></div><div><dt>Телосложение</dt><dd>{reference.build}</dd></div><div><dt>Одежда</dt><dd>{reference.outfit}</dd></div></dl><button className="drawing-text-button" onClick={() => setShowDrawingText((visible) => !visible)}>✎ {showDrawingText ? 'Скрыть описание' : 'Рисовать по тексту'}</button>{showDrawingText && <section className="drawing-description"><h3>Как нарисовать персонажа</h3><p><b>Образ:</b> персонаж в тематике «{reference.theme}».</p><p><b>Внешность:</b> причёска — {reference.hair}; телосложение — {reference.build}.</p><p><b>Одежда:</b> {reference.outfit}.</p><p><b>Поза:</b> {reference.pose}.</p><p><b>Важные детали:</b> {reference.details || 'Дополнительных деталей нет.'}</p><details><summary>Полный текст для рисунка</summary><p>{reference.prompt}</p></details><div className="free-generation"><button onClick={copyPrompt}>{copied ? '✓ Промпт скопирован' : '▣ Скопировать промпт'}</button><a href="https://aistudio.google.com/" target="_blank" rel="noreferrer">Открыть Google AI Studio ↗</a><small>Вставь скопированный текст в AI Studio, создай картинку и прикрепи её ниже.</small></div></section>}<button className="generate" disabled={busy} onClick={generate}>{busy ? 'Создаём изображение…' : reference.image_path ? '↻ Сгенерировать заново' : '✦ Сгенерировать картинку'}</button><label className="upload-art">{uploading ? 'Загружаем…' : '＋ Прикрепить итоговый рисунок'}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} disabled={uploading}/></label>{error && <p className="message">{error}</p>}</div></article>;
}
