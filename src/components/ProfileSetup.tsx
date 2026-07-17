import { useState } from 'react';
import { createProfile, Profile } from '../lib/profiles';

export function ProfileSetup({ userId, onReady }: { userId: string; onReady: (profile: Profile) => void }) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { onReady(await createProfile(userId, username, displayName)); }
    catch (error) { setMessage(error instanceof Error && error.message.includes('duplicate') ? 'Этот никнейм уже занят' : 'Проверь никнейм: 3–20 латинских букв, цифр или _'); }
    finally { setBusy(false); }
  }
  return <main className="profile-setup"><div className="brand-static">Refri<span>.</span></div><section className="card"><div className="eyebrow">ПОСЛЕДНИЙ ШАГ</div><h1>Как тебя называть?</h1><p>Никнейм уникальный — по нему тебя найдут другие художники.</p><form className="form" onSubmit={submit}><label><span>Никнейм</span><div className="username-input"><b>@</b><input name="username" value={username} onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="art_name" minLength={3} maxLength={20} required /></div><small>Его можно изменить один раз в 30 дней</small></label><label><span>Псевдоним</span><input name="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Например, Лунный художник" maxLength={40} required /><small>Он может повторяться и меняться свободно</small></label><button disabled={busy}>{busy ? 'Создаём…' : 'Перейти в Refri →'}</button></form>{message && <p className="message">{message}</p>}</section></main>;
}
