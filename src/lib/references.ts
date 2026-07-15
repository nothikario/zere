import { supabase } from './supabase';

export type ReferenceDraft = {
  title: string; theme: string; pose: string; hair: string;
  build: string; outfit: string; details: string; prompt: string;
};

export type ArtReference = ReferenceDraft & {
  id: string; user_id: string; image_path: string | null; final_art_path: string | null; created_at: string;
};

export async function loadReferences() {
  const { data, error } = await supabase.from('references').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as ArtReference[];
}

export async function createReference(draft: ReferenceDraft) {
  const { data, error } = await supabase.from('references').insert(draft).select().single();
  if (error) throw error;
  return data as ArtReference;
}

export async function deleteReference(reference: ArtReference) {
  if (reference.image_path) await supabase.storage.from('reference-images').remove([reference.image_path]);
  const { error } = await supabase.from('references').delete().eq('id', reference.id);
  if (error) throw error;
}

export async function generateReferenceImage(reference: ArtReference) {
  const { data, error } = await supabase.functions.invoke('ai', {
    body: { mode: 'image', prompt: reference.prompt },
  });
  if (error || !data?.imageBase64) throw new Error(data?.error ?? error?.message ?? 'Не удалось создать изображение');
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user.id;
  if (!userId) throw new Error('Нужно войти в аккаунт');
  const bytes = Uint8Array.from(atob(data.imageBase64), (char) => char.charCodeAt(0));
  const path = `${userId}/${reference.id}.png`;
  const upload = await supabase.storage.from('reference-images').upload(path, bytes, { contentType: data.mimeType ?? 'image/png', upsert: true });
  if (upload.error) throw upload.error;
  const update = await supabase.from('references').update({ image_path: path }).eq('id', reference.id);
  if (update.error) throw update.error;
  return path;
}

export function getImageUrl(path: string) {
  return supabase.storage.from('reference-images').getPublicUrl(path).data.publicUrl;
}

export async function loadPublicReferences(userId: string) {
  const { data, error } = await supabase.from('references').select('*').eq('user_id', userId).eq('is_public', true).order('created_at', { ascending: false });
  if (error) throw error;
  return data as ArtReference[];
}

export async function uploadFinalArtwork(reference: ArtReference, file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${reference.user_id}/${reference.id}-final.${extension}`;
  const upload = await supabase.storage.from('reference-images').upload(path, file, { contentType: file.type, upsert: true });
  if (upload.error) throw upload.error;
  const update = await supabase.from('references').update({ final_art_path: path }).eq('id', reference.id);
  if (update.error) throw update.error;
  return path;
}

export function exportToGoogleDocs(references: ArtReference[]) {
  const text = references.map((item, index) => [
    `${index + 1}. ${item.title}`, `Тематика: ${item.theme}`, `Поза: ${item.pose}`,
    `Волосы: ${item.hair}`, `Телосложение: ${item.build}`, `Одежда: ${item.outfit}`,
    `Детали: ${item.details || '—'}`, `Промпт: ${item.prompt}`,
  ].join('\n')).join('\n\n');
  navigator.clipboard.writeText(text);
  window.open('https://docs.new', '_blank', 'noopener,noreferrer');
}
