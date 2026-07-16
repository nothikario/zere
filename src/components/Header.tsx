export type Page = 'home' | 'create' | 'gallery' | 'shop' | 'discover' | 'profile';
type Props = { page: Page; username?: string; onNavigate: (page: Page) => void; onSignOut: () => void };

export function Header({ page, username, onNavigate, onSignOut }: Props) {
  const navClass = (target: Page) => page === target ? 'nav-button active' : 'nav-button';
  return <header className="site-header"><button className="brand" onClick={() => onNavigate('home')}>Refri<span>.</span></button><nav><button className={navClass('home')} onClick={() => onNavigate('home')}>Дом</button><button className={navClass('create')} onClick={() => onNavigate('create')}>Создать референс</button>{username && <><button className={navClass('gallery')} onClick={() => onNavigate('gallery')}>Мои референсы</button><button className={navClass('shop')} onClick={() => onNavigate('shop')}>Магазин</button><button className="user-pill" onClick={() => onNavigate('profile')}>@{username}</button></>}<button className="icon-button" onClick={onSignOut}>↗</button></nav></header>;
}
