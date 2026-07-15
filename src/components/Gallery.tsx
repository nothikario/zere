import { ArtReference, deleteReference, exportToGoogleDocs } from '../lib/references';
import { ReferenceCard } from './ReferenceCard';

type Props = { references: ArtReference[]; setReferences: React.Dispatch<React.SetStateAction<ArtReference[]>>; onCreate: () => void };
export function Gallery({ references, setReferences, onCreate }: Props) {
  async function remove(item: ArtReference) { await deleteReference(item); setReferences((current) => current.filter(({ id }) => id !== item.id)); }
  return <main className="page gallery-page"><div className="gallery-heading"><div><div className="eyebrow">ТВОЯ КОЛЛЕКЦИЯ</div><h1>Мои <em>референсы</em></h1><p className="lead">Персонажи, идеи и визуалы — всё в одном месте.</p></div><button className="docs-button" disabled={!references.length} onClick={() => exportToGoogleDocs(references)}>▤ Сохранить в Google Docs</button></div>{references.length ? <div className="gallery-grid">{references.map((item) => <ReferenceCard key={item.id} reference={item} onDelete={() => remove(item)} onGenerated={(path, field) => setReferences((all) => all.map((ref) => ref.id === item.id ? { ...ref, [field]: path } : ref))} />)}</div> : <section className="empty-state"><span>✦</span><h2>Здесь пока пусто</h2><p>Создай первый референс персонажа.</p><button className="primary" onClick={onCreate}>Создать референс</button></section>}<p className="docs-hint">Google Docs откроется в новой вкладке, а готовый текст будет скопирован — просто вставь его в документ.</p></main>;
}
