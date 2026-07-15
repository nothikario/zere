export type WizardKey = 'theme' | 'gender' | 'hair' | 'face' | 'emotion' | 'build' | 'outfit' | 'pose';

export type WizardValues = Record<WizardKey, string> & {
  hairLink: string;
  outfitLink: string;
  comments: Record<WizardKey, string>;
};

export type WizardStep = {
  key: WizardKey;
  eyebrow: string;
  title: string;
  hint: string;
  options: string[];
  customPlaceholder: string;
  commentPlaceholder: string;
  link?: 'hairLink' | 'outfitLink';
};

export const steps: WizardStep[] = [
  { key: 'theme', eyebrow: 'ШАГ 1', title: 'Выбери тематику', hint: 'С чего начнётся история персонажа?', options: ['Магия', 'Природа', 'Киберпанк', 'Средневековье', 'Космос', 'Повседневность'], customPlaceholder: 'Напиши сюда свою тематику', commentPlaceholder: 'Например: ночная атмосфера, вокруг светятся магические растения' },
  { key: 'gender', eyebrow: 'ШАГ 2', title: 'Выбери персонажа', hint: 'Это поможет точнее подобрать образ и телосложение.', options: ['Девушка', 'Парень', 'Андрогинный образ', 'Не указывать'], customPlaceholder: 'Опиши свой вариант', commentPlaceholder: 'Например: молодой персонаж с немного андрогинной внешностью' },
  { key: 'hair', eyebrow: 'ШАГ 3', title: 'Какая будет причёска?', hint: 'Выбери основу или предложи свою.', options: ['Каскад', 'Косички', 'Каре', 'Длинные волны', 'Высокий хвост', 'Короткая стрижка'], customPlaceholder: 'Опиши причёску своими словами', commentPlaceholder: 'Например: тёмно-синие волосы, две тонкие пряди падают на лицо', link: 'hairLink' },
  { key: 'face', eyebrow: 'ШАГ 4', title: 'Черты лица', hint: 'Форма лица задаёт характер всему образу.', options: ['Мягкие', 'Острые', 'Кукольные', 'Мужественные', 'Необычные'], customPlaceholder: 'Например: нос с горбинкой, заострённые уши, серьги', commentPlaceholder: 'Например: веснушки, нос с горбинкой и маленький шрам над бровью' },
  { key: 'emotion', eyebrow: 'ШАГ 5', title: 'Добавь эмоцию', hint: 'Что сейчас чувствует твой персонаж?', options: ['Радость', 'Грусть', 'Спокойствие', 'Злость', 'Удивление', 'Смущение'], customPlaceholder: 'Какую эмоцию для персонажа хочешь ты?', commentPlaceholder: 'Например: улыбается губами, а из глаз текут маленькие слёзы' },
  { key: 'build', eyebrow: 'ШАГ 6', title: 'Телосложение', hint: 'Варианты подойдут для выбранного образа.', options: ['Стройное', 'Атлетичное', 'Крепкое', 'Хрупкое', 'Пышное', 'Высокое'], customPlaceholder: 'Опиши телосложение точнее', commentPlaceholder: 'Например: широкие плечи, длинные ноги и сильные руки' },
  { key: 'outfit', eyebrow: 'ШАГ 7', title: 'Подбери одежду', hint: 'Костюм рассказывает о мире и характере.', options: ['Длинный плащ', 'Лёгкое платье', 'Доспехи', 'Уличный стиль', 'Футуристический костюм', 'Классический образ'], customPlaceholder: 'Опиши свою идею одежды', commentPlaceholder: 'Например: потёртая кожа, серебряные застёжки и зелёная вышивка', link: 'outfitLink' },
  { key: 'pose', eyebrow: 'ШАГ 8', title: 'Последний штрих — поза', hint: 'Выбери положение тела и добавь важные мелочи.', options: ['Стоит прямо', 'Вполоборота', 'Сидит', 'В движении', 'Боевая стойка', 'Смотрит через плечо'], customPlaceholder: 'Опиши свою позу', commentPlaceholder: 'Например: левая рука на поясе, правая поднята, голова немного наклонена' },
];

export const emptyWizard: WizardValues = {
  theme: '', gender: '', hair: '', face: '', emotion: '', build: '', outfit: '', pose: '',
  hairLink: '', outfitLink: '',
  comments: { theme: '', gender: '', hair: '', face: '', emotion: '', build: '', outfit: '', pose: '' },
};
