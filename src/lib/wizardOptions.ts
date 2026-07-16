export type WizardKey = 'peopleCount' | 'theme' | 'style' | 'renderType' | 'gender' | 'hairColor' | 'hair' | 'face' | 'emotion' | 'build' | 'outfit' | 'pose';

export type WizardValues = Record<WizardKey, string> & {
  hairLink: string;
  outfitLink: string;
  poseLink: string;
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
  link?: 'hairLink' | 'outfitLink' | 'poseLink';
};

export const guestDefaults: WizardValues = {
  peopleCount: '1', theme: 'Повседневность', style: 'Манга', renderType: 'Скетч', gender: '', hairColor: '', hair: 'Хвост', face: 'Обычные', emotion: 'Спокойствие',
  build: 'Среднее', outfit: 'Уличный стиль', pose: 'Стоит прямо', hairLink: '', outfitLink: '', poseLink: '',
  comments: { peopleCount: '', theme: '', style: '', renderType: '', gender: '', hairColor: '', hair: '', face: '', emotion: '', build: '', outfit: '', pose: '' },
};

export const guestOptions: Partial<Record<WizardKey, string[]>> = {
  peopleCount: ['1'], theme: ['Повседневность'], hair: ['Хвост'], face: ['Обычные'], build: ['Среднее'], pose: ['Стоит прямо'],
};

export const maleHairOptions = ['Короткая стрижка', 'Андеркат', 'Квифф', 'Цезарь', 'Средние волосы', 'Длинные волосы'];

export const steps: WizardStep[] = [
  { key: 'peopleCount', eyebrow: 'ШАГ 1', title: 'Сколько будет персонажей?', hint: 'Можно создать сцену от одного до четырёх героев.', options: ['1', '2', '3', '4'], customPlaceholder: 'Количество', commentPlaceholder: '' },
  { key: 'theme', eyebrow: 'ШАГ 1', title: 'Выбери тематику', hint: 'С чего начнётся история персонажа?', options: ['Магия', 'Природа', 'Киберпанк', 'Средневековье', 'Космос', 'Повседневность'], customPlaceholder: 'Напиши сюда свою тематику', commentPlaceholder: 'Например: ночная атмосфера, вокруг светятся магические растения' },
  { key: 'style', eyebrow: 'ШАГ 2', title: 'Выбери стиль', hint: 'Как должен выглядеть будущий рисунок?', options: ['Манга', 'Комикс', 'Реализм', 'Мультфильм', 'Аниме', 'Концепт-арт'], customPlaceholder: 'Напиши свой стиль', commentPlaceholder: 'Например: мягкие линии и акварельные цвета' },
  { key: 'renderType', eyebrow: 'ШАГ 3', title: 'Как будет нарисовано?', hint: 'Это влияет на награду за готовую работу.', options: ['Скетч', 'Покрас', 'Полноценный арт'], customPlaceholder: 'Опиши уровень готовности', commentPlaceholder: 'Например: чистый лайн с простыми тенями' },
  { key: 'gender', eyebrow: 'ШАГ 2', title: 'Выбери персонажа', hint: 'Это поможет точнее подобрать образ и телосложение.', options: ['Девушка', 'Парень', 'Андрогинный образ', 'Не указывать'], customPlaceholder: 'Опиши свой вариант', commentPlaceholder: 'Например: молодой персонаж с немного андрогинной внешностью' },
  { key: 'hairColor', eyebrow: 'ПЕРСОНАЖ', title: 'Цвет волос', hint: 'Выбери цвет или напиши свой.', options: ['Чёрные', 'Каштановые', 'Русые', 'Светлые', 'Рыжие', 'Цветные'], customPlaceholder: 'Например: тёмно-синие', commentPlaceholder: 'Можно добавить пряди или градиент' },
  { key: 'hair', eyebrow: 'ШАГ 3', title: 'Какая будет причёска?', hint: 'Выбери основу или предложи свою.', options: ['Каскад', 'Косички', 'Каре', 'Длинные волны', 'Высокий хвост', 'Короткая стрижка'], customPlaceholder: 'Опиши причёску своими словами', commentPlaceholder: 'Например: тёмно-синие волосы, две тонкие пряди падают на лицо', link: 'hairLink' },
  { key: 'face', eyebrow: 'ШАГ 4', title: 'Черты лица', hint: 'Форма лица задаёт характер всему образу.', options: ['Обычные', 'Мягкие', 'Острые', 'Кукольные', 'Мужественные', 'Необычные'], customPlaceholder: 'Например: нос с горбинкой, заострённые уши, серьги', commentPlaceholder: 'Например: веснушки, нос с горбинкой и маленький шрам над бровью' },
  { key: 'emotion', eyebrow: 'ШАГ 5', title: 'Добавь эмоцию', hint: 'Что сейчас чувствует твой персонаж?', options: ['Радость', 'Грусть', 'Спокойствие', 'Злость', 'Удивление', 'Смущение'], customPlaceholder: 'Какую эмоцию для персонажа хочешь ты?', commentPlaceholder: 'Например: улыбается губами, а из глаз текут маленькие слёзы' },
  { key: 'build', eyebrow: 'ШАГ 6', title: 'Телосложение', hint: 'Варианты подойдут для выбранного образа.', options: ['Среднее', 'Стройное', 'Атлетичное', 'Крепкое', 'Хрупкое', 'Пышное', 'Высокое'], customPlaceholder: 'Опиши телосложение точнее', commentPlaceholder: 'Например: широкие плечи, длинные ноги и сильные руки' },
  { key: 'outfit', eyebrow: 'ШАГ 7', title: 'Подбери одежду', hint: 'Костюм рассказывает о мире и характере.', options: ['Длинный плащ', 'Лёгкое платье', 'Доспехи', 'Уличный стиль', 'Футуристический костюм', 'Классический образ'], customPlaceholder: 'Опиши свою идею одежды', commentPlaceholder: 'Например: потёртая кожа, серебряные застёжки и зелёная вышивка', link: 'outfitLink' },
  { key: 'pose', eyebrow: 'ПОСЛЕДНИЙ ШАГ', title: 'Поза и взаимодействие', hint: 'Опиши, как персонажи расположены относительно друг друга.', options: ['Стоит прямо', 'Вполоборота', 'Сидит', 'В движении', 'Боевая стойка', 'Смотрит через плечо'], customPlaceholder: 'Опиши свою позу', commentPlaceholder: 'Например: персонаж 1 приобнимает персонажа 2, а тот отстраняется', link: 'poseLink' },
];

export const emptyWizard: WizardValues = {
  peopleCount: '', theme: '', style: '', renderType: '', gender: '', hairColor: '', hair: '', face: '', emotion: '', build: '', outfit: '', pose: '',
  hairLink: '', outfitLink: '', poseLink: '',
  comments: { peopleCount: '', theme: '', style: '', renderType: '', gender: '', hairColor: '', hair: '', face: '', emotion: '', build: '', outfit: '', pose: '' },
};
