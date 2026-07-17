import { Language } from './language';
import { supabase } from './supabase';

const appGuide = `You are the friendly in-app tutor for Refri, an art reference application.
Only answer questions about Refri, drawing, and using art references. If unsure, say so instead of inventing features.
Facts about Refri:
- A user creates a reference by choosing 1-4 characters, theme, style, finish level, appearance, background, and pose.
- The generated reference can be saved in My References. Gemini can generate its preview image.
- Users earn stars by uploading their own finished drawing. AI checks that it matches the reference.
- With a background, rewards for 1/2/3/4 characters are: sketch 5/10/18/25, color 10/20/30/40, full art 15/30/45/60 stars. Without a background rewards are lower.
- Daily gifts contain only 1-2 stars or one extra reference creation for 24 hours.
- Stars can buy permanent gallery capacity or a permanent daily creation slot in the Shop.
- References can be hidden, restored, deleted, or shared publicly.
Keep answers warm, clear, and short enough for a teenager.`;

export async function askTrainingAssistant(question: string, language: Language) {
  const languageRule = language === 'en'
    ? 'Always answer in English.'
    : 'Всегда отвечай на русском языке.';
  const { data, error } = await supabase.functions.invoke('ai', {
    body: { prompt: question, system: `${appGuide}\n${languageRule}` },
  });
  if (error || !data?.text) throw new Error(error?.message ?? 'ИИ не смог ответить');
  return String(data.text);
}
