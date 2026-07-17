import { useLanguage } from '../lib/language';

export type Page = 'home' | 'create' | 'gallery' | 'shop' | 'discover' | 'profile' | 'training';
type Props = { page: Page; username?: string; avatarUrl?: string | null; isGuest?: boolean; onNavigate: (page: Page) => void; onSignOut: () => void };

export function Header({ page, username, avatarUrl, isGuest = false, onNavigate, onSignOut }: Props) {
  const en = useLanguage().language === 'en';
  const navClass = (target: Page) => page === target ? 'nav-button active' : 'nav-button';
  return <header className="site-header"><button className="brand" onClick={() => onNavigate('home')}>Refri<span>.</span></button><nav>
    <button className={navClass('home')} onClick={() => onNavigate('home')}>{en ? 'Home' : 'Дом'}</button>
    <button className={navClass('training')} onClick={() => onNavigate('training')}>{en ? 'Start tutorial' : 'Пройти обучение'}</button>
    <button className={navClass('create')} onClick={() => onNavigate('create')}>{en ? 'Create reference' : 'Создать референс'}</button>
    {(username || isGuest) && <button className={navClass('gallery')} onClick={() => onNavigate('gallery')}>{en ? 'My references' : 'Мои референсы'}</button>}
    {username && <><button className={navClass('shop')} onClick={() => onNavigate('shop')}>{en ? 'Shop' : 'Магазин'}</button><button className="user-pill" onClick={() => onNavigate('profile')}>{avatarUrl && <img src={avatarUrl} alt="" style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: '50%', verticalAlign: 'middle', marginRight: 7 }}/>}@{username}</button></>}
    <button className="icon-button" title={en ? 'Sign out' : 'Выйти'} onClick={onSignOut}>↗</button>
  </nav></header>;
}
