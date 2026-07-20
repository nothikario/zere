import { supabase } from './supabase';

export async function getAccountDetails() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const providers = data.user.identities?.map((identity) => identity.provider) ?? [];
  return {
    email: data.user.email ?? '',
    usesGoogle: providers.includes('google'),
    hasEmailPassword: providers.includes('email'),
  };
}

export async function requestEmailChange(email: string) {
  const { error } = await supabase.auth.updateUser({ email });
  if (error) throw error;
}

export async function changePasswordWithCurrent(currentPassword: string, password: string) {
  const { error } = await supabase.auth.updateUser({ password, current_password: currentPassword });
  if (error) throw error;
}

export async function sendPasswordCode() {
  const { error } = await supabase.auth.reauthenticate();
  if (error) throw error;
}

export async function changePasswordWithCode(nonce: string, password: string) {
  const { error } = await supabase.auth.updateUser({ password, nonce });
  if (error) throw error;
}
