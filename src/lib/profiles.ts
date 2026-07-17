import { supabase } from './supabase';
import { ThemeKey } from './themes';

export type Profile = {
  user_id: string;
  username: string;
  display_name: string;
  username_changed_at: string;
  avatar_url: string | null;
  theme_key: ThemeKey;
};

export type PublicProfileStats = { streak: number; daily_limit: number; references_count: number; references_limit: number };

export async function loadPublicProfileStats(userId: string) {
  const { data, error } = await supabase.rpc('get_public_profile_stats', { target_user: userId });
  if (error) throw error;
  return (data?.[0] ?? null) as PublicProfileStats | null;
}

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
  let request = supabase.from('profiles').select('*').order('display_name').limit(200);
  if (clean) request = request.or(`username.ilike.%${clean}%,display_name.ilike.%${clean}%`);
  const { data, error } = await request;
  if (error) throw error;
  return data as Profile[];
}

export async function updateProfile(profile: Profile, username: string, displayName: string, themeKey: ThemeKey, avatarUrl: string | null) {
  const usernameChanged = username.toLowerCase() !== profile.username;
  const changes = { username: username.toLowerCase(), display_name: displayName, theme_key: themeKey, avatar_url: avatarUrl, ...(usernameChanged ? { username_changed_at: new Date().toISOString() } : {}) };
  const { data, error } = await supabase.from('profiles').update(changes).eq('user_id', profile.user_id).select().single();
  if (error) throw error;
  return data as Profile;
}

export async function uploadAvatar(userId: string, file: File) {
  if (file.size > 5 * 1024 * 1024) throw new Error('Avatar is too large');
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/avatar.${extension}`;
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return `${supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
}
