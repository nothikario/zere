import { supabase } from './supabase';

export async function getAccountEmail() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user.email ?? '';
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
