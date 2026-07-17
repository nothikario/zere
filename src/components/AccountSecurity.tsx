import { FormEvent, useEffect, useState } from 'react';
import { changePasswordWithCode, changePasswordWithCurrent, getAccountEmail, requestEmailChange, sendPasswordCode } from '../lib/account';
import { useLanguage } from '../lib/language';

export function AccountSecurity() {
  const en = useLanguage().language === 'en';
  const [email, setEmail] = useState(''); const [newEmail, setNewEmail] = useState('');
  const [oldPassword, setOldPassword] = useState(''); const [newPassword, setNewPassword] = useState('');
  const [code, setCode] = useState(''); const [codeMode, setCodeMode] = useState(false);
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { getAccountEmail().then((value) => { setEmail(value); setNewEmail(value); }); }, []);

  async function changeEmail(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { await requestEmailChange(newEmail); setMessage(en ? 'Check your current and new inboxes to confirm the change.' : 'Проверь старую и новую почту и подтверди смену.'); }
    catch { setMessage(en ? 'Could not request the email change.' : 'Не удалось запросить смену почты.'); }
    finally { setBusy(false); }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { if (codeMode) await changePasswordWithCode(code, newPassword); else await changePasswordWithCurrent(oldPassword, newPassword); setMessage(en ? 'Password changed.' : 'Пароль изменён.'); setOldPassword(''); setNewPassword(''); setCode(''); }
    catch { setMessage(en ? 'Check the old password/code and the new password.' : 'Проверь старый пароль/код и новый пароль.'); }
    finally { setBusy(false); }
  }

  async function forgotPassword() {
    setBusy(true); setMessage('');
    try { await sendPasswordCode(); setCodeMode(true); setMessage(en ? `A code was sent to ${email}.` : `Код отправлен на ${email}.`); }
    catch { setMessage(en ? 'Could not send the code. Try again later.' : 'Не удалось отправить код. Попробуй позже.'); }
    finally { setBusy(false); }
  }

  return <section className="security-grid"><form className="settings-card form" onSubmit={changeEmail}><h2>{en ? 'Email' : 'Электронная почта'}</h2><label><span>{en ? 'Registered email' : 'Почта аккаунта'}</span><input type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} required/></label><small>{en ? 'Confirmation emails will protect the change.' : 'Смену нужно будет подтвердить по почте.'}</small><button disabled={busy || newEmail === email}>{en ? 'Change email' : 'Изменить почту'}</button></form>
    <form className="settings-card form" onSubmit={changePassword}><h2>{en ? 'Password' : 'Пароль'}</h2>{codeMode ? <label><span>{en ? 'Code from email' : 'Код из письма'}</span><input inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} required/></label> : <label><span>{en ? 'Current password' : 'Старый пароль'}</span><input type="password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} required/></label>}<label><span>{en ? 'New password' : 'Новый пароль'}</span><input type="password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required/></label><button disabled={busy}>{en ? 'Set new password' : 'Установить новый пароль'}</button><button type="button" className="text-button" disabled={busy} onClick={() => void (codeMode ? setCodeMode(false) : forgotPassword())}>{codeMode ? (en ? 'Use current password' : 'Использовать старый пароль') : (en ? 'I forgot my password' : 'Я не помню пароль')}</button></form>{message && <p className="settings-message security-message">{message}</p>}</section>;
}
