import { supabase } from './supabase';

export type ReferenceDraft = {
  title: string; theme: string; pose: string; hair: string;
  build: string; outfit: string; details: string; prompt: string; art_style: string; render_type: string; people_count: number;
};

export type ArtReference = ReferenceDraft & {
  id: string; user_id: string; image_path: string | null; final_art_path: string | null; created_at: string; is_hidden: boolean;
};

export async function loadReferences() {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return [];
  const { data, error } = await supabase
    .from('references')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as ArtReference[];
}

export async function createReference(draft: ReferenceDraft) {
  const claim = await supabase.rpc('claim_generation_slot');
  if (claim.error) throw claim.error;
  const { data, error } = await supabase.from('references').insert(draft).select().single();
  if (error) throw error;
  return data as ArtReference;
}

export async function deleteReference(reference: ArtReference) {
  const { data, error } = await supabase
    .from('references')
    .delete()
    .eq('id', reference.id)
    .eq('user_id', reference.user_id)
    .select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('Референс не удалён. Обнови страницу и попробуй снова.');
  const paths = [reference.image_path, reference.final_art_path].filter((path): path is string => Boolean(path));
  if (paths.length) {
    const { error: storageError } = await supabase.storage.from('reference-images').remove(paths);
    if (storageError) console.warn('Reference files could not be removed:', storageError.message);
  }
}

export async function setReferenceHidden(referenceId: string, isHidden: boolean) {
  const { error } = await supabase.from('references').update({ is_hidden: isHidden }).eq('id', referenceId);
  if (error) throw error;
}

async function fileToBase64(file: File) {
  const url = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file); });
  return url.split(',')[1];
}

export async function generateReferenceImage(reference: ArtReference, styleExample?: File) {
  const variationId = crypto.randomUUID();
  const generationPrompt = `${reference.prompt}\nCreate a fresh alternative image with a noticeably different composition, camera angle, and small visual details while preserving the requested character. Variation ID: ${variationId}.`;
  const { data, error } = await supabase.functions.invoke('ai', {
    body: { mode: 'image', prompt: generationPrompt, styleImageBase64: styleExample ? await fileToBase64(styleExample) : undefined, styleImageMimeType: styleExample?.type },
  });
  if (error || !data?.imageBase64) throw new Error(data?.error ?? error?.message ?? 'Не удалось создать изображение');
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user.id;
  if (!userId) throw new Error('Нужно войти в аккаунт');
  const bytes = Uint8Array.from(atob(data.imageBase64), (char) => char.charCodeAt(0));
  const path = `${userId}/${reference.id}-${variationId}.png`;
  const upload = await supabase.storage.from('reference-images').upload(path, bytes, { contentType: data.mimeType ?? 'image/png' });
  if (upload.error) throw upload.error;
  const update = await supabase
    .from('references')
    .update({ image_path: path })
    .eq('id', reference.id)
    .eq('user_id', userId)
    .select('image_path')
    .single();
  if (update.error || update.data?.image_path !== path) {
    await supabase.storage.from('reference-images').remove([path]);
    throw update.error ?? new Error('Новая картинка не сохранилась. Попробуй войти в аккаунт заново.');
  }
  if (reference.image_path && reference.image_path !== path) {
    await supabase.storage.from('reference-images').remove([reference.image_path]);
  }
  return path;
}

export async function generateGuestImage(prompt: string) {
  const { data, error } = await supabase.functions.invoke('ai', { body: { mode: 'image', prompt } });
  if (error || !data?.imageBase64) throw new Error(data?.error ?? error?.message ?? 'Не удалось создать изображение');
  return `data:${data.mimeType ?? 'image/png'};base64,${data.imageBase64}`;
}

export function getImageUrl(path: string, cacheKey?: number) {
  if (path.startsWith('data:') || path.startsWith('http')) return path;
  const publicUrl = supabase.storage.from('reference-images').getPublicUrl(path).data.publicUrl;
  return cacheKey ? `${publicUrl}?v=${cacheKey}` : publicUrl;
}

export async function loadPublicReferences(userId: string) {
  const { data, error } = await supabase.from('references').select('*').eq('user_id', userId).eq('is_public', true).eq('is_hidden', false).order('created_at', { ascending: false });
  if (error) throw error;
  return data as ArtReference[];
}

export async function uploadFinalArtwork(reference: ArtReference, file: File) {
  const verification = await supabase.functions.invoke('ai', {
    body: { mode: 'verify-art', referenceId: reference.id, prompt: reference.prompt, artworkBase64: await fileToBase64(file), artworkMimeType: file.type },
  });
  if (verification.error || !verification.data?.accepted) throw new Error(verification.data?.reason ?? verification.error?.message ?? 'Рисунок не прошёл проверку');
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${reference.user_id}/${reference.id}-final.${extension}`;
  const upload = await supabase.storage.from('reference-images').upload(path, file, { contentType: file.type, upsert: true });
  if (upload.error) throw upload.error;
  const update = await supabase.from('references').update({ final_art_path: path }).eq('id', reference.id);
  if (update.error) throw update.error;
  return { path, stars: Number(verification.data.stars) };
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
