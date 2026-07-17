import { useState } from 'react';
import { useLanguage } from '../lib/language';

export type Page = 'home' | 'create' | 'gallery' | 'shop' | 'discover' | 'profile' | 'training';
type Props = { page: Page; username?: string; avatarUrl?: string | null; isGuest?: boolean; onNavigate: (page: Page) => void; onSignOut: () => void };

export function Header({ page, username, avatarUrl, isGuest = false, onNavigate, onSignOut }: Props) {
  const en = useLanguage().language === 'en';
  const [menuOpen, setMenuOpen] = useState(false);
  const navClass = (target: Page) => page === target ? 'nav-button active' : 'nav-button';
  const navigate = (target: Page) => { onNavigate(target); setMenuOpen(false); };
  const signOut = () => { setMenuOpen(false); onSignOut(); };
  return <header className="site-header"><button className="brand" onClick={() => navigate('home')}>Refri<span>.</span></button>
    <button className={menuOpen ? 'menu-toggle open' : 'menu-toggle'} aria-label={en ? 'Open menu' : 'Открыть меню'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><i/><i/><i/></button>
    <nav className={menuOpen ? 'open' : ''}>
      <button className={navClass('home')} onClick={() => navigate('home')}>{en ? 'Home' : 'Дом'}</button>
      <button className={navClass('training')} onClick={() => navigate('training')}>{en ? 'Start tutorial' : 'Пройти обучение'}</button>
      <button className={navClass('create')} onClick={() => navigate('create')}>{en ? 'Create reference' : 'Создать референс'}</button>
      {(username || isGuest) && <button className={navClass('gallery')} onClick={() => navigate('gallery')}>{en ? 'My references' : 'Мои референсы'}</button>}
      {username && <><button className={navClass('shop')} onClick={() => navigate('shop')}>{en ? 'Shop' : 'Магазин'}</button><button className={navClass('profile')} onClick={() => navigate('profile')}>{avatarUrl && <img src={avatarUrl} alt=""/>}<span className="desktop-profile">@{username}</span><span className="mobile-profile">{en ? 'Account settings' : 'Настройки аккаунта'}</span></button></>}
      <button className="icon-button sign-out" title={en ? 'Sign out' : 'Выйти'} onClick={signOut}><span className="desktop-sign-out">↗</span><span className="mobile-sign-out">{en ? 'Sign out' : 'Выйти'}</span></button>
    </nav>
  </header>;
}
