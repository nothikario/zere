import { useLanguage } from '../lib/language';
import { Profile } from '../lib/profiles';
import { Usage } from '../lib/usage';
type Props = { profile?: Profile; usage?: Usage; onUsageChange?: () => void; onCreate: () => void; onGallery: () => void; onDiscover: () => void };
export function Home({ profile, usage, onCreate, onGallery, onDiscover }: Props) {
  const en = useLanguage().language === 'en';
  return <main className="home-page"><div className="home-welcome"><div className="eyebrow">{profile ? (en ? `WELCOME, @${profile.username}` : `ДОБРО ПОЖАЛОВАТЬ, @${profile.username}`) : (en ? 'GUEST MODE' : 'ГОСТЕВОЙ РЕЖИМ')}</div><h1>{en ? <>What will we create <em>today?</em></> : <>Что создадим <em>сегодня?</em></>}</h1><p>{profile ? (en ? 'Create a new character or return to your collection.' : 'Собери нового персонажа или вернись к своей коллекции.') : (en ? 'You can create 1 reference with basic options.' : 'Можно создать 1 референс с базовыми вариантами.')}</p>
    {usage && <div className="streak-card">🔥 {en ? 'Current' : 'Сейчас'}: <b>{usage.streak} {en ? 'days' : 'дн.'}</b><span>🏆 {en ? 'Best' : 'Рекорд'}: {usage.max_streak} · {en ? 'Today' : 'Сегодня'}: {usage.used_today}/{usage.daily_limit} · {en ? 'References' : 'Референсы'}: {usage.references_count}/{usage.references_limit} · ⭐ {usage.stars}</span></div>}
    <div className={profile ? 'home-actions with-discover' : 'home-actions'}><button onClick={onCreate}><span>✦</span><b>{en ? 'Create reference' : 'Создать референс'}</b><small>{en ? 'From 1 to 4 characters' : 'От 1 до 4 персонажей'}</small></button><button onClick={onGallery}><span>▦</span><b>{en ? 'My references' : 'Мои референсы'}</b><small>{en ? 'Your collection and artwork' : 'Твоя коллекция и рисунки'}</small></button>{profile && <button className="discover-action" onClick={onDiscover}><span>⌕</span><b>{en ? 'Find an artist' : 'Найти художника'}</b><small>{en ? 'Search the Refri community' : 'Поиск в сообществе Refri'}</small></button>}</div>
  </div></main>;
}
