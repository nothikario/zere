import { supabase } from './supabase';

export type Profile = {
  user_id: string;
  username: string;
  display_name: string;
  username_changed_at: string;
};

export async function loadMyProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function createProfile(userId: string, username: string, displayName: string) {
  const { data, error } = await supabase.from('profiles').insert({ user_id: userId, username: username.toLowerCase(), display_name: displayName }).select().single();
  if (error) throw error;
  return data as Profile;
}

export async function searchProfiles(query: string) {
  const clean = query.toLowerCase().replace(/^@/, '');
  const { data, error } = await supabase.from('profiles').select('*').ilike('username', `%${clean}%`).limit(12);
  if (error) throw error;
  return data as Profile[];
}

export async function updateProfile(profile: Profile, username: string, displayName: string) {
  const usernameChanged = username.toLowerCase() !== profile.username;
  const changes = { username: username.toLowerCase(), display_name: displayName, ...(usernameChanged ? { username_changed_at: new Date().toISOString() } : {}) };
  const { data, error } = await supabase.from('profiles').update(changes).eq('user_id', profile.user_id).select().single();
  if (error) throw error;
  return data as Profile;
}
