export type ThemeKey = 'sage' | 'ruby' | 'ocean' | 'violet';

export const themes: { key: ThemeKey; ru: string; en: string; colors: [string, string] }[] = [
  { key: 'sage', ru: 'Бежевый и зелёный', en: 'Beige & green', colors: ['#f6f4ef', '#68745c'] },
  { key: 'ruby', ru: 'Чёрный и красный', en: 'Black & red', colors: ['#171514', '#b8443d'] },
  { key: 'ocean', ru: 'Белый и синий', en: 'White & blue', colors: ['#f4f7fa', '#456f91'] },
  { key: 'violet', ru: 'Светлый и фиолетовый', en: 'Light & violet', colors: ['#f7f3f8', '#7b5b83'] },
];

export function applyTheme(theme: ThemeKey) {
  document.documentElement.dataset.theme = theme;
}
