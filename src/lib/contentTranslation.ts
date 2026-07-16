import { Language } from './language';
import { supabase } from './supabase';

const cache = new Map<string, string>();

function needsTranslation(text: string, language: Language) {
  return language === 'en' ? /[А-Яа-яЁё]/.test(text) : /[A-Za-z]/.test(text);
}

export async function translateUserContent(text: string, language: Language) {
  if (!text.trim() || !needsTranslation(text, language)) return text;
  const key = `${language}:${text}`;
  const saved = cache.get(key);
  if (saved) return saved;
  const target = language === 'en' ? 'English' : 'Russian';
  const { data, error } = await supabase.functions.invoke('ai', {
    body: { prompt: text, system: `Translate the user's character description into ${target}. Preserve names, numbers, links and meaning. Return only the translated text without notes or quotation marks.` },
  });
  if (error || typeof data?.text !== 'string' || !data.text.trim()) return text;
  const result = data.text.trim();
  cache.set(key, result);
  return result;
}
