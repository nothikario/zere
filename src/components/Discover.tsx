import { useEffect, useState } from 'react';
import { loadPublicProfileStats, Profile, PublicProfileStats, searchProfiles } from '../lib/profiles';
import { ArtReference, getImageUrl, loadPublicReferences } from '../lib/references';
import { ImageLightbox } from './ImageLightbox';

export function Discover() {
  const [query, setQuery] = useState(''); const [people, setPeople] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null); const [references, setReferences] = useState<ArtReference[]>([]);
  const [stats, setStats] = useState<PublicProfileStats | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { searchProfiles('').then(setPeople).finally(() => setLoading(false)); }, []);
  async function search(event: React.FormEvent) { event.preventDefault(); setLoading(true); setPeople(await searchProfiles(query)); setSelected(null); setLoading(false); }
  async function open(profile: Profile) { setSelected(profile); const [items, profileStats] = await Promise.all([loadPublicReferences(profile.user_id), loadPublicProfileStats(profile.user_id)]); setReferences(items); setStats(profileStats); }
  return <main className="page discover-page"><div className="eyebrow">СООБЩЕСТВО REFRI</div><h1>Найди <em>художника</em></h1><p className="lead">Все зарегистрированные художники собраны здесь.</p>
    <form className="people-search" onSubmit={search}><input name="people-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Никнейм или псевдоним"/><button>Найти</button></form>
    {selected ? <SelectedProfile profile={selected} references={references} stats={stats} onBack={() => setSelected(null)}/>
      : loading ? <p className="empty">Загружаем художников…</p> : <div className="people-list">{people.map((person) => <button key={person.user_id} onClick={() => open(person)}><ProfileAvatar profile={person}/><span><b>{person.display_name}</b><small>@{person.username}</small></span><i>→</i></button>)}</div>}
  </main>;
}

function SelectedProfile({ profile, references, stats, onBack }: { profile: Profile; references: ArtReference[]; stats: PublicProfileStats | null; onBack: () => void }) {
  return <section className="selected-public-profile"><button className="back-button" onClick={onBack}>← К результатам</button><div className="public-profile"><ProfileAvatar profile={profile} preview/><div><h2>{profile.display_name}</h2><p>@{profile.username}</p></div></div>
    {stats && <div className="streak-card">🔥 Сейчас: <b>{stats.streak} дн.</b><span>🏆 Рекорд: {stats.max_streak} дн. · Референсы: {stats.references_count}/{stats.references_limit} · В день: {stats.daily_limit}</span></div>}
    <div className="public-grid">{references.map((item) => <article key={item.id}><PublicImage path={item.final_art_path || item.image_path} title={item.title}/><div><h3>{item.title}</h3><p>{item.theme} · {item.pose}</p></div></article>)}</div>{!references.length && <p className="empty">У этого пользователя пока нет референсов.</p>}
  </section>;
}

function ProfileAvatar({ profile, preview = false }: { profile: Profile; preview?: boolean }) {
  const [open, setOpen] = useState(false);
  const show = (event: React.MouseEvent | React.KeyboardEvent) => { event.stopPropagation(); setOpen(true); };
  const avatar = profile.avatar_url
    ? <img className="avatar" src={profile.avatar_url} alt="" style={{ objectFit: 'cover' }}/>
    : <span className="avatar">{profile.display_name[0]}</span>;
  if (!preview || !profile.avatar_url) return avatar;
  return <><button type="button" className="avatar-view-button" aria-label={`Открыть аватар ${profile.display_name}`} onClick={show}>{avatar}</button>{open && <ImageLightbox src={profile.avatar_url} alt={profile.display_name} onClose={() => setOpen(false)}/>}</>;
}
function PublicImage({ path, title }: { path: string | null; title: string }) { const url = path ? getImageUrl(path) : ''; const [open, setOpen] = useState(false); return <><div className="public-image" onClick={() => url && setOpen(true)}>{url ? <img src={url} alt={title}/> : <span>✦</span>}</div>{open && <ImageLightbox src={url} alt={title} onClose={() => setOpen(false)}/>}</>; }
