// AI-функция на бесплатном ключе Google Gemini.
// Вызов с фронта: supabase.functions.invoke('ai', { body: { prompt, system } })
//
// Запуск (один раз):
//   1) Возьми бесплатный ключ: https://aistudio.google.com/apikey
//   2) Положи его в секрет:  npm run ai:secret -- GEMINI_API_KEY=твой_ключ
//   3) Задеплой функцию:     npm run ai:deploy
//
// Модель можно поменять (gemini-2.0-flash — быстрая и бесплатная).

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const MODEL = 'gemini-3.5-flash';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type InlineImage = { data: string; mimeType: string };

function safeUrl(value: string) {
  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  if (!['http:', 'https:'].includes(url.protocol) || host === 'localhost' || host === '0.0.0.0' || host === '::1' || /^127\.|^10\.|^192\.168\.|^169\.254\.|^172\.(1[6-9]|2\d|3[01])\./.test(host)) throw new Error('Недопустимая ссылка на референс');
  return url;
}

async function fetchSafe(value: string, redirects = 0): Promise<Response> {
  if (redirects > 4) throw new Error('Слишком много перенаправлений в ссылке');
  const response = await fetch(safeUrl(value), { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0 Refri/1.0', Accept: 'image/*,text/html' } });
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    if (!location) throw new Error('Неверное перенаправление ссылки');
    return fetchSafe(new URL(location, value).toString(), redirects + 1);
  }
  if (!response.ok) throw new Error(`Не удалось открыть ссылку (${response.status})`);
  return response;
}

async function loadReferenceImage(value: string): Promise<InlineImage> {
  let response = await fetchSafe(value);
  let mimeType = response.headers.get('content-type')?.split(';')[0] ?? '';
  if (mimeType === 'text/html') {
    const html = (await response.text()).slice(0, 1_000_000);
    const match = html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)/i) ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i);
    if (!match?.[1]) throw new Error('На странице не найдено изображение. Попробуй прямую ссылку на картинку.');
    response = await fetchSafe(new URL(match[1].replaceAll('&amp;', '&'), value).toString());
    mimeType = response.headers.get('content-type')?.split(';')[0] ?? '';
  }
  if (!mimeType.startsWith('image/')) throw new Error('Ссылка должна вести на изображение');
  const size = Number(response.headers.get('content-length') ?? 0);
  if (size > 8_000_000) throw new Error('Изображение по ссылке слишком большое');
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length > 8_000_000) throw new Error('Изображение по ссылке слишком большое');
  let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
  return { data: btoa(binary), mimeType };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Нет GEMINI_API_KEY. Поставь секрет: npm run ai:secret -- GEMINI_API_KEY=...');
    }
    const { prompt, system, mode, styleImageBase64, styleImageMimeType, artworkBase64, artworkMimeType, referenceId, referenceUrls = [] } = await req.json();
    if (!prompt) throw new Error('Нужно поле prompt');

    const model = mode === 'image' ? 'gemini-3.1-flash-image' : MODEL;
    const verifyPrompt = `Проверь приложенный рисунок. Он должен достаточно соответствовать идее: ${prompt}. Определи готовность: sketch (набросок/лайн), color (простой покрас без полного рендера), full (полноценный арт с рендером, светом и тенями). Верни только JSON: {"similarity": число от 0 до 1, "detected":"sketch|color|full", "reason":"короткое объяснение по-русски"}.`;
    const linkedImages = mode === 'image' ? await Promise.all((referenceUrls as string[]).slice(0, 6).map(loadReferenceImage)) : [];
    const parts = mode === 'verify-art'
      ? [{ text: verifyPrompt }, { inlineData: { data: artworkBase64, mimeType: artworkMimeType } }]
      : [{ text: prompt }, ...linkedImages.map((inlineData) => ({ inlineData })), ...(linkedImages.length ? [{ text: 'Используй изображения по ссылкам как визуальные референсы причёски, одежды или позы. Точно сохрани их главные визуальные особенности.' }] : []), ...(styleImageBase64 ? [{ inlineData: { data: styleImageBase64, mimeType: styleImageMimeType } }, { text: 'Используй приложенную работу только как пример художественного стиля.' }] : [])];
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: system ? { parts: [{ text: system }] } : undefined,
          contents: [{ parts }],
          generationConfig: mode === 'image' ? { responseModalities: ['TEXT', 'IMAGE'] } : undefined,
        }),
      },
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message ?? 'Gemini request failed');
    const responseParts = data?.candidates?.[0]?.content?.parts ?? [];
    const image = responseParts.find((part: { inlineData?: { data: string; mimeType: string } }) => part.inlineData)?.inlineData;
    const text = responseParts.find((part: { text?: string }) => part.text)?.text ?? '';
    if (mode === 'verify-art') {
      const verdict = JSON.parse(text.replace(/```json|```/g, '').trim()) as { similarity: number; detected: string; reason: string };
      if (verdict.similarity < 0.55) return new Response(JSON.stringify({ accepted: false, reason: verdict.reason }), { headers: { ...cors, 'Content-Type': 'application/json' } });
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !referenceId) throw new Error('Не удалось начислить награду');
      const awardResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/award_verified_art`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: req.headers.get('Authorization') ?? '' },
        body: JSON.stringify({ ref_id: referenceId, detected: verdict.detected, similarity_score: verdict.similarity }),
      });
      if (!awardResponse.ok) throw new Error(await awardResponse.text());
      return new Response(JSON.stringify({ accepted: true, reason: verdict.reason, stars: await awardResponse.json() }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify(image ? { text, imageBase64: image.data, mimeType: image.mimeType } : { text }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
