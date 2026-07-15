import { useMemo, useState } from 'react';
import { Profile, updateProfile } from '../lib/profiles';

export function ProfileSettings({ profile, onUpdated }: { profile: Profile; onUpdated: (profile: Profile) => void }) {
  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const nextChange = useMemo(() => new Date(new Date(profile.username_changed_at).getTime() + 30 * 86400000), [profile]);
  const canChangeUsername = nextChange <= new Date();
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { onUpdated(await updateProfile(profile, username, displayName)); setMessage('Профиль сохранён'); }
    catch { setMessage('Не получилось сохранить. Возможно, никнейм уже занят.'); }
    finally { setBusy(false); }
  }
  return <main className="page settings-page"><div className="eyebrow">ТВОЙ ПРОФИЛЬ</div><h1>Настройки <em>аккаунта</em></h1><form className="settings-card form" onSubmit={save}><label><span>Уникальный никнейм</span><div className="username-input"><b>@</b><input value={username} disabled={!canChangeUsername} onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}/></div><small>{canChangeUsername ? 'Сейчас никнейм можно изменить' : `Можно изменить после ${nextChange.toLocaleDateString('ru-RU')}`}</small></label><label><span>Псевдоним</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={40}/><small>Псевдоним можно менять в любое время</small></label><button disabled={busy}>{busy ? 'Сохраняем…' : 'Сохранить изменения'}</button>{message && <p className="message">{message}</p>}</form></main>;
}
