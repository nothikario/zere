import { FormEvent, useEffect, useState } from 'react';
import { changePasswordWithCode, changePasswordWithCurrent, getAccountDetails, requestEmailChange, sendPasswordCode } from '../lib/account';
import { useLanguage } from '../lib/language';

export function AccountSecurity() {
  const en = useLanguage().language === 'en';
  const [email, setEmail] = useState(''); const [newEmail, setNewEmail] = useState('');
  const [oldPassword, setOldPassword] = useState(''); const [newPassword, setNewPassword] = useState('');
  const [code, setCode] = useState(''); const [codeMode, setCodeMode] = useState(false);
  const [googleOnly, setGoogleOnly] = useState(false);
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { getAccountDetails().then((account) => { setEmail(account.email); setNewEmail(account.email); setGoogleOnly(account.usesGoogle && !account.hasEmailPassword); }); }, []);

  async function changeEmail(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { await requestEmailChange(newEmail); setMessage(en ? 'Check your current and new inboxes to confirm the change.' : 'Проверь старую и новую почту и подтверди смену.'); }
    catch { setMessage(en ? 'Could not request the email change.' : 'Не удалось запросить смену почты.'); }
    finally { setBusy(false); }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { if (codeMode) await changePasswordWithCode(code, newPassword); else await changePasswordWithCurrent(oldPassword, newPassword); setMessage(en ? 'Password set. You can now sign in with Google or email.' : 'Пароль установлен. Теперь можно входить через Google или email.'); setGoogleOnly(false); setCodeMode(false); setOldPassword(''); setNewPassword(''); setCode(''); }
    catch { setMessage(en ? 'Check the old password/code and the new password.' : 'Проверь старый пароль/код и новый пароль.'); }
    finally { setBusy(false); }
  }

  async function forgotPassword() {
    setBusy(true); setMessage('');
    try { await sendPasswordCode(); setCodeMode(true); setMessage(en ? `A code was sent to ${email}.` : `Код отправлен на ${email}.`); }
    catch { setMessage(en ? 'Could not send the code. Try again later.' : 'Не удалось отправить код. Попробуй позже.'); }
    finally { setBusy(false); }
  }

  return <section className="security-grid"><form className="settings-card form" onSubmit={changeEmail}><h2>{en ? 'Email' : 'Электронная почта'}</h2><label><span>{en ? 'Registered email' : 'Почта аккаунта'}</span><input name="account-email" type="email" autoComplete="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} required/></label><small>{en ? 'Confirmation emails will protect the change.' : 'Смену нужно будет подтвердить по почте.'}</small><button disabled={busy || newEmail === email}>{en ? 'Change email' : 'Изменить почту'}</button></form>
    <form className="settings-card form" onSubmit={changePassword}><h2>{en ? 'Password' : 'Пароль'}</h2>{googleOnly && !codeMode && <small>{en ? 'Google accounts do not have a separate password here. You can keep signing in with Google or create one using an email code.' : 'У аккаунта Google нет отдельного пароля на этом сайте. Можно продолжать входить через Google или создать пароль с помощью кода из письма.'}</small>}{codeMode ? <label><span>{en ? 'Code from email' : 'Код из письма'}</span><input name="password-reset-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} required/></label> : !googleOnly && <label><span>{en ? 'Current password' : 'Старый пароль'}</span><input name="current-password" type="password" autoComplete="current-password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} required/></label>}{(!googleOnly || codeMode) && <label><span>{en ? 'New password' : 'Новый пароль'}</span><input name="new-password" type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required/></label>}{(!googleOnly || codeMode) && <button disabled={busy}>{en ? 'Set new password' : 'Установить новый пароль'}</button>}<button type="button" className="text-button" disabled={busy} onClick={() => void (codeMode ? setCodeMode(false) : forgotPassword())}>{codeMode ? (en ? 'Cancel' : 'Отмена') : googleOnly ? (en ? 'Create a password via email' : 'Создать пароль через email') : (en ? 'I forgot my password' : 'Я не помню пароль')}</button></form>{message && <p className="settings-message security-message">{message}</p>}</section>;
}
