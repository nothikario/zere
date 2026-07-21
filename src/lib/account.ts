import { supabase } from "./supabase";

export type RememberedAccount = {
  email: string;
  username: string;
  avatarUrl: string | null;
};

const ACCOUNTS_KEY = "refri-remembered-accounts";

export function loadRememberedAccounts(): RememberedAccount[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is RememberedAccount => {
      if (!item || typeof item !== "object") return false;
      const account = item as Record<string, unknown>;
      return typeof account.email === "string" && typeof account.username === "string" && (typeof account.avatarUrl === "string" || account.avatarUrl === null);
    });
  } catch {
    return [];
  }
}

export function rememberAccount(account: RememberedAccount) {
  const others = loadRememberedAccounts().filter((item) => item.email !== account.email);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([account, ...others].slice(0, 5)));
}

export async function getAccountDetails() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const providers = data.user.identities?.map((identity) => identity.provider) ?? [];
  return {
    email: data.user.email ?? "",
    usesGoogle: providers.includes("google"),
    hasEmailPassword: providers.includes("email") || data.user.user_metadata.has_password === true,
  };
}

export async function requestEmailChange(email: string) {
  const { error } = await supabase.auth.updateUser({ email });
  if (error) throw error;
}

export async function changePasswordWithCurrent(currentPassword: string, password: string) {
  const { error } = await supabase.auth.updateUser({
    password,
    current_password: currentPassword,
    data: { has_password: true },
  });
  if (error) throw error;
}

export async function sendPasswordCode() {
  const { error } = await supabase.auth.reauthenticate();
  if (error) throw error;
}

export async function changePasswordWithCode(nonce: string, password: string) {
  const { error } = await supabase.auth.updateUser({ password, nonce, data: { has_password: true } });
  if (error) throw error;
}
