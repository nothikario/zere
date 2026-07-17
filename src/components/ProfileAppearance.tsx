import { FormEvent, useMemo, useState } from 'react';
import { Profile, updateProfile, uploadAvatar } from '../lib/profiles';
import { applyTheme, themes, ThemeKey } from '../lib/themes';
import { useLanguage } from '../lib/language';

export function ProfileAppearance({ profile, onUpdated }: { profile: Profile; onUpdated: (profile: Profile) => void }) {
  const en = useLanguage().language === 'en';
  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [theme, setTheme] = useState<ThemeKey>(profile.theme_key);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const nextChange = useMemo(() => new Date(new Date(profile.username_changed_at).getTime() + 30 * 86400000), [profile]);
  const canChangeUsername = nextChange <= new Date();

  async function chooseAvatar(file?: File) {
    if (!file) return;
    setBusy(true); setMessage('');
    try { setAvatarUrl(await uploadAvatar(profile.user_id, file)); }
    catch { setMessage(en ? 'Use a JPG, PNG, or WebP image up to 5 MB.' : 'Выбери JPG, PNG или WebP до 5 МБ.'); }
    finally { setBusy(false); }
  }

  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { const updated = await updateProfile(profile, username, displayName, theme, avatarUrl); onUpdated(updated); applyTheme(theme); setMessage(en ? 'Profile saved.' : 'Профиль сохранён.'); }
    catch { setMessage(en ? 'Could not save. The username may already be taken.' : 'Не получилось сохранить. Возможно, никнейм уже занят.'); }
    finally { setBusy(false); }
  }

  return <form className="settings-card form" onSubmit={save}><h2>{en ? 'Profile and appearance' : 'Профиль и внешний вид'}</h2><div className="avatar-setting">{avatarUrl ? <img src={avatarUrl} alt=""/> : <span>{displayName[0]}</span>}<label className="avatar-upload">{en ? 'Choose avatar' : 'Выбрать аватар'}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void chooseAvatar(event.target.files?.[0])}/></label></div>
    <label><span>{en ? 'Unique username' : 'Уникальный никнейм'}</span><div className="username-input"><b>@</b><input value={username} disabled={!canChangeUsername} onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}/></div><small>{canChangeUsername ? (en ? 'You can change it now.' : 'Сейчас его можно изменить.') : `${en ? 'Available after' : 'Можно изменить после'} ${nextChange.toLocaleDateString(en ? 'en-US' : 'ru-RU')}`}</small></label>
    <label><span>{en ? 'Display name' : 'Псевдоним'}</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={40}/></label>
    <fieldset className="theme-picker"><legend>{en ? 'Main colors' : 'Основные цвета'}</legend>{themes.map((item) => <button type="button" key={item.key} className={theme === item.key ? 'selected' : ''} onClick={() => { setTheme(item.key); applyTheme(item.key); }}><i style={{ background: `linear-gradient(135deg,${item.colors[0]} 50%,${item.colors[1]} 50%)` }}/>{en ? item.en : item.ru}</button>)}</fieldset>
    <button disabled={busy}>{busy ? (en ? 'Saving…' : 'Сохраняем…') : (en ? 'Save profile' : 'Сохранить профиль')}</button>{message && <p className="settings-message">{message}</p>}</form>;
}
