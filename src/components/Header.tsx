export type Page = 'home' | 'create' | 'gallery' | 'discover' | 'profile';
type Props = { page: Page; username: string; onNavigate: (page: Page) => void; onSignOut: () => void };

export function Header({ page, username, onNavigate, onSignOut }: Props) {
  const createLabel = page === 'gallery' ? 'Создать новый' : 'Создать референс';
  return <header className="site-header"><button className="brand" onClick={() => onNavigate('home')}>Refri<span>.</span></button><nav><button className={page === 'home' ? 'nav-button active' : 'nav-button'} onClick={() => onNavigate('home')}>Дом</button><button className={page === 'create' ? 'nav-button active' : 'nav-button'} onClick={() => onNavigate('create')}>{createLabel}</button><button className={page === 'gallery' ? 'nav-button active' : 'nav-button'} onClick={() => onNavigate('gallery')}>Мои референсы</button><button className="user-pill" onClick={() => onNavigate('profile')}>@{username}</button><button className="icon-button" onClick={onSignOut} title="Выйти">↗</button></nav></header>;
}
