import { Profile } from '../lib/profiles';

type Props = { profile: Profile; onCreate: () => void; onGallery: () => void; onDiscover: () => void };
export function Home({ profile, onCreate, onGallery, onDiscover }: Props) {
  return <main className="home-page"><div className="home-welcome"><div className="eyebrow">ДОБРО ПОЖАЛОВАТЬ, @{profile.username}</div><h1>Что создадим <em>сегодня?</em></h1><p>Собери нового персонажа или вернись к своей коллекции.</p><div className="home-actions"><button onClick={onCreate}><span>✦</span><b>Создать референс</b><small>Пошаговый конструктор образа</small></button><button onClick={onGallery}><span>▦</span><b>Мои референсы</b><small>Твоя коллекция и рисунки</small></button></div><button className="people-search-link" onClick={onDiscover}>⌕ Найти других художников по никнейму</button></div></main>;
}
