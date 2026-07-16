import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const inspirationWords = ['вдохновляйся', 'идеи на выбор', 'куча тематик!'];

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [wordIndex, setWordIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const duration = Math.min(8000, 5000 + inspirationWords[wordIndex].length * 150);
    const timer = window.setTimeout(
      () => setWordIndex((current) => (current + 1) % inspirationWords.length),
      duration,
    );
    return () => window.clearTimeout(timer);
  }, [wordIndex]);

  function selectMode(nextMode: 'signin' | 'signup') {
    setMode(nextMode);
    setMessage('');
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const result = mode === 'signup'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) setMessage(result.error.message);
      else if (mode === 'signup') setMessage('Готово! Проверь почту для подтверждения аккаунта.');
    } catch {
      setMessage('Что-то пошло не так. Попробуй ещё раз.');
    } finally {
      setBusy(false);
    }
  }

  async function continueWithGoogle() {
    setMessage('');
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) {
      setMessage('Не получилось открыть вход через Google. Попробуй ещё раз.');
      setBusy(false);
    }
  }

  return <section className="card auth-card">
    <div className="inspiration" aria-live="polite" key={wordIndex}>{inspirationWords[wordIndex]}</div>
    <div className="auth-tabs" aria-label="Регистрация или вход">
      <button type="button" className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => selectMode('signup')}>Регистрация</button>
      <button type="button" className={`auth-tab signin-tab ${mode === 'signin' ? 'active' : ''}`} onClick={() => selectMode('signin')}>Вход</button>
    </div>
    <p className="auth-caption">{mode === 'signup' ? 'Создай аккаунт и сохраняй свои референсы' : 'Продолжи работу со своей коллекцией'}</p>
    <button type="button" className="google-auth-button" disabled={busy} onClick={continueWithGoogle}><span className="google-mark">G</span>Продолжить через Google</button>
    <div className="auth-divider"><span>или через email</span></div>
    <form onSubmit={handleSubmit} className="form">
      <input type="email" placeholder="Твой email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <input type="password" placeholder="Пароль — минимум 6 символов" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
      <button type="submit" disabled={busy}>{busy ? 'Подожди…' : mode === 'signin' ? 'Войти' : 'Создать аккаунт'}</button>
    </form>
    {message && <p className="message">{message}</p>}
  </section>;
}
