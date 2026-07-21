import { useState } from "react";
import { loadRememberedAccounts } from "../lib/account";
import { useLanguage } from "../lib/language";

type Props = {
  currentEmail: string;
  onChooseAccount: (email?: string) => void;
};

export function AccountSwitcher({ currentEmail, onChooseAccount }: Props) {
  const en = useLanguage().language === "en";
  const [open, setOpen] = useState(false);
  const accounts = loadRememberedAccounts();

  return (
    <section className="settings-card account-switcher">
      <h2>{en ? "Switch accounts" : "Переключить аккаунт"}</h2>
      <p className="settings-help">{en ? "Choose an account or add another one." : "Выбери аккаунт или добавь другой."}</p>
      <button type="button" className="account-switch-button" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="account-avatar">{currentEmail[0]?.toUpperCase() ?? "?"}</span>
        <span>
          <strong>{currentEmail}</strong>
          <small>{en ? "Current account" : "Текущий аккаунт"}</small>
        </span>
        <i>{open ? "▲" : "▼"}</i>
      </button>
      {open && (
        <div className="account-switch-menu">
          {accounts
            .filter((account) => account.email !== currentEmail)
            .map((account) => (
              <button type="button" key={account.email} onClick={() => onChooseAccount(account.email)}>
                {account.avatarUrl ? <img src={account.avatarUrl} alt="" /> : <span className="account-avatar">{account.username[0]?.toUpperCase()}</span>}
                <span>
                  <strong>@{account.username}</strong>
                  <small>{account.email}</small>
                </span>
              </button>
            ))}
          <button type="button" className="add-account-button" onClick={() => onChooseAccount()}>
            <span className="account-avatar">＋</span>
            <span>
              <strong>{en ? "Add account" : "Добавить аккаунт"}</strong>
              <small>{en ? "Sign in or create a new one" : "Войти или создать новый"}</small>
            </span>
          </button>
        </div>
      )}
    </section>
  );
}
