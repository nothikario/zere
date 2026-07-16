import { useEffect, useState } from 'react';
import { ArtReference, getImageUrl, loadPublicReferences } from '../lib/references';
import { Profile, searchProfiles } from '../lib/profiles';

export function Discover() {
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [references, setReferences] = useState<ArtReference[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { searchProfiles('').then(setPeople).finally(() => setLoading(false)); }, []);
  async function search(event: React.FormEvent) { event.preventDefault(); setLoading(true); setPeople(await searchProfiles(query)); setSelected(null); setLoading(false); }
  async function open(profile: Profile) { setSelected(profile); setReferences(await loadPublicReferences(profile.user_id)); }
  return <main className="page discover-page"><div className="eyebrow">СООБЩЕСТВО REFRI</div><h1>Найди <em>художника</em></h1><p className="lead">Все зарегистрированные художники собраны здесь.</p>
    <form className="people-search" onSubmit={search}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Никнейм или псевдоним"/><button>Найти</button></form>
    {selected ? <section><button className="back-button" onClick={() => setSelected(null)}>← К результатам</button><div className="public-profile"><div className="avatar">{selected.display_name[0]}</div><div><h2>{selected.display_name}</h2><p>@{selected.username}</p></div></div><div className="public-grid">{references.map((item) => <article key={item.id}><PublicImage path={item.final_art_path || item.image_path} title={item.title}/><div><h3>{item.title}</h3><p>{item.theme} · {item.pose}</p></div></article>)}</div>{!references.length && <p className="empty">У этого пользователя пока нет референсов.</p>}</section>
      : loading ? <p className="empty">Загружаем художников…</p> : <div className="people-list">{people.map((person) => <button key={person.user_id} onClick={() => open(person)}><span className="avatar">{person.display_name[0]}</span><span><b>{person.display_name}</b><small>@{person.username}</small></span><i>→</i></button>)}</div>}
  </main>;
}

function PublicImage({ path, title }: { path: string | null; title: string }) {
  const url = path ? getImageUrl(path) : '';
  return <div className="public-image">{url ? <img src={url} alt={title}/> : <span>✦</span>}</div>;
}
