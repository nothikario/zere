import { Profile } from '../lib/profiles';
import { Usage } from '../lib/usage';

type Props = { profile?: Profile; usage?: Usage; onUsageChange?: () => void; onCreate: () => void; onGallery: () => void; onDiscover: () => void };

export function Home({ profile, usage, onCreate, onGallery, onDiscover }: Props) {
  return <main className="home-page"><div className="home-welcome"><div className="eyebrow">{profile ? `ДОБРО ПОЖАЛОВАТЬ, @${profile.username}` : 'ГОСТЕВОЙ РЕЖИМ'}</div><h1>Что создадим <em>сегодня?</em></h1><p>{profile ? 'Собери нового персонажа или вернись к своей коллекции.' : 'Можно создать 1 референс с базовыми вариантами.'}</p>{usage && <div className="streak-card">🔥 Стрик: <b>{usage.streak} дн.</b><span>Сегодня: {usage.used_today}/{usage.daily_limit} · Референсы: {usage.references_count}/{usage.references_limit} · ⭐ {usage.stars}</span></div>}<div className="home-actions"><button onClick={onCreate}><span>✦</span><b>Создать референс</b><small>От 1 до 4 персонажей</small></button>{profile && <button onClick={onGallery}><span>▦</span><b>Мои референсы</b><small>Твоя коллекция и рисунки</small></button>}</div>{profile && <button className="people-search-link" onClick={onDiscover}>⌕ Найти других художников по никнейму</button>}</div></main>;
}
