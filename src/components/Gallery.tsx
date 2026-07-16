import { useState } from 'react';
import { ArtReference, deleteReference, exportToGoogleDocs, setReferenceHidden } from '../lib/references';
import { removeGuestReference } from '../lib/usage';
import { ReferenceCard } from './ReferenceCard';

type Props = { references: ArtReference[]; setReferences: React.Dispatch<React.SetStateAction<ArtReference[]>>; onCreate: () => void; onReward: () => void; isGuest?: boolean };

export function Gallery({ references, setReferences, onCreate, onReward, isGuest = false }: Props) {
  const [showHidden, setShowHidden] = useState(false);
  const visible = references.filter((item) => Boolean(item.is_hidden) === showHidden);
  const hiddenCount = references.filter((item) => item.is_hidden).length;
  async function remove(item: ArtReference) { if (!window.confirm('Удалить референс навсегда?')) return; if (isGuest) removeGuestReference(); else await deleteReference(item); setReferences((all) => all.filter(({ id }) => id !== item.id)); onReward(); }
  async function toggleHidden(item: ArtReference) { if (isGuest) return; await setReferenceHidden(item.id, !item.is_hidden); setReferences((all) => all.map((ref) => ref.id === item.id ? { ...ref, is_hidden: !ref.is_hidden } : ref)); }
  return <main className="page gallery-page"><div className="gallery-heading"><div><div className="eyebrow">ТВОЯ КОЛЛЕКЦИЯ</div><h1>{showHidden ? 'Скрытые' : 'Мои'} <em>референсы</em></h1><p className="lead">{isGuest ? 'В гостевом режиме доступен только один референс.' : showHidden ? 'Они занимают место, и их всегда можно вернуть.' : 'Удаление освобождает место, скрытие — нет.'}</p></div><div className="gallery-actions">{!isGuest && <button className="docs-button" onClick={() => setShowHidden(!showHidden)}>{showHidden ? '← Основная галерея' : `Скрытые (${hiddenCount})`}</button>}<button className="docs-button" disabled={!references.length} onClick={() => exportToGoogleDocs(references)}>▤ Google Docs</button></div></div>
    {visible.length ? <div className="gallery-grid">{visible.map((item) => <ReferenceCard key={item.id} reference={item} isGuest={isGuest} onDelete={() => remove(item)} onHide={() => toggleHidden(item)} onReward={onReward} onGenerated={(path, field) => setReferences((all) => all.map((ref) => ref.id === item.id ? { ...ref, [field]: path } : ref))}/>)}</div> : <section className="empty-state"><span>✦</span><h2>{showHidden ? 'Скрытых референсов нет' : 'Здесь пока пусто'}</h2>{!isGuest && !showHidden && <button className="primary" onClick={onCreate}>Создать референс</button>}</section>}
  </main>;
}
