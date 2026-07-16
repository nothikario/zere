import { useEffect } from 'react';
import { useLanguage } from './language';

const translations: [string, string][] = [
  ['ДОБРО ПОЖАЛОВАТЬ', 'WELCOME'], ['ГОСТЕВОЙ РЕЖИМ', 'GUEST MODE'], ['ТВОЯ КОЛЛЕКЦИЯ', 'YOUR COLLECTION'],
  ['СООБЩЕСТВО REFRI', 'REFRI COMMUNITY'], ['ТВОЙ ПРОФИЛЬ', 'YOUR PROFILE'], ['МАГАЗИН И ПОДАРКИ', 'SHOP AND GIFTS'],
  ['ЕЖЕДНЕВНЫЙ ПОДАРОК', 'DAILY GIFT'], ['ПОСЛЕДНИЙ ШАГ', 'FINAL STEP'], ['РЕФЕРЕНС ГОТОВ', 'REFERENCE READY'],
  ['ПЕРСОНАЖ', 'CHARACTER'], ['ШАГ', 'STEP'], ['Что создадим сегодня?', 'What will we create today?'],
  ['Создать референс', 'Create reference'], ['Мои референсы', 'My references'], ['Скрытые референсы', 'Hidden references'],
  ['Создать генерацию', 'Generate image'], ['Сгенерировать заново', 'Generate again'], ['Сгенерировать картинку', 'Generate image'],
  ['Здесь появится генерация', 'Your generated image will appear here'], ['Здесь появится визуал', 'The visual will appear here'],
  ['Посмотри, что получилось', 'See what we created'], ['В мои референсы', 'Add to my references'], ['Далее', 'Next'], ['Назад', 'Back'],
  ['Регистрация', 'Sign up'], ['Вход', 'Sign in'], ['Создать аккаунт', 'Create account'], ['Войти', 'Sign in'],
  ['Продолжить через Google', 'Continue with Google'], ['Продолжить без аккаунта', 'Continue without an account'], ['или через email', 'or use email'],
  ['Твой email', 'Your email'], ['Пароль — минимум 6 символов', 'Password — at least 6 characters'], ['Подожди', 'Please wait'],
  ['Код из письма', 'Email code'], ['Подтвердить почту', 'Confirm email'], ['Изменить email', 'Change email'], ['Проверяем', 'Checking'],
  ['Найди художника', 'Find an artist'], ['Найти', 'Search'], ['К результатам', 'Back to results'],
  ['Введи никнейм, например @art_name', 'Enter a username, for example @art_name'], ['У этого пользователя пока нет референсов.', 'This user has no references yet.'],
  ['Дом', 'Home'], ['Магазин', 'Shop'], ['Выйти', 'Sign out'], ['Настройки аккаунта', 'Account settings'],
  ['Уникальный никнейм', 'Unique username'], ['Псевдоним', 'Display name'], ['Сохранить изменения', 'Save changes'], ['Сохраняем', 'Saving'],
  ['Профиль сохранён', 'Profile saved'], ['Как тебя называть?', 'What should we call you?'], ['Никнейм', 'Username'], ['Перейти в Refri', 'Continue to Refri'],
  ['Твои звёздочки', 'Your stars'], ['твой баланс', 'your balance'], ['Купить место в галерее', 'Buy gallery space'],
  ['Одно постоянное место для хранения референса.', 'One permanent space for a reference.'], ['Купить количество созданных референсов', 'Increase creation limit'],
  ['Постоянный +1 к дневному лимиту создания.', 'Permanent +1 to the daily creation limit.'], ['Купить', 'Buy'], ['Забрать подарок', 'Claim gift'], ['Уже получено', 'Already claimed'],
  ['Стрик', 'Streak'], ['дней', 'days'], ['Сегодня', 'Today'], ['Референсы', 'References'],
  ['Скрыть описание', 'Hide description'], ['Рисовать по тексту', 'Draw from description'], ['Прикрепить свой рисунок', 'Upload your artwork'],
  ['Проверяем рисунок', 'Checking artwork'], ['Итоговый рисунок', 'Final artwork'], ['Вернуть', 'Restore'], ['Скрыть', 'Hide'], ['Удалить навсегда', 'Delete forever'],
  ['Волосы', 'Hair'], ['Телосложение', 'Build'], ['Одежда', 'Outfit'], ['Стиль', 'Style'], ['Промпт', 'Prompt'], ['Тематика', 'Theme'], ['Поза', 'Pose'],
  ['Сколько будет персонажей?', 'How many characters?'], ['Выбери тематику', 'Choose a theme'], ['Выбери стиль', 'Choose a style'],
  ['Как будет нарисовано?', 'How will it be drawn?'], ['Выбери персонажа', 'Choose a character'], ['Цвет волос', 'Hair color'],
  ['Какая будет причёска?', 'Choose a hairstyle'], ['Черты лица', 'Facial features'], ['Добавь эмоцию', 'Add an emotion'],
  ['Подбери одежду', 'Choose an outfit'], ['Поза и взаимодействие', 'Pose and interaction'], ['Свой вариант', 'Custom option'],
  ['Ссылка на пример', 'Example link'], ['Комментарий к выбору', 'Comment'], ['Дополнительное описание персонажа', 'Additional character description'],
  ['Фото своей работы для похожего стиля', 'Your artwork as a style example'], ['Необязательно', 'Optional'],
  ['Магия', 'Magic'], ['Природа', 'Nature'], ['Киберпанк', 'Cyberpunk'], ['Средневековье', 'Medieval'], ['Космос', 'Space'], ['Повседневность', 'Everyday life'],
  ['Манга', 'Manga'], ['Комикс', 'Comic'], ['Реализм', 'Realism'], ['Мультфильм', 'Cartoon'], ['Аниме', 'Anime'], ['Концепт-арт', 'Concept art'],
  ['Скетч', 'Sketch'], ['Покрас', 'Colored drawing'], ['Полноценный арт', 'Finished artwork'], ['Девушка', 'Girl'], ['Парень', 'Boy'],
  ['Андрогинный образ', 'Androgynous'], ['Не указывать', 'Not specified'], ['Чёрные', 'Black'], ['Каштановые', 'Brown'], ['Русые', 'Light brown'], ['Светлые', 'Blonde'], ['Рыжие', 'Red'], ['Цветные', 'Colorful'],
  ['Радость', 'Joy'], ['Грусть', 'Sadness'], ['Спокойствие', 'Calm'], ['Злость', 'Anger'], ['Удивление', 'Surprise'], ['Смущение', 'Shyness'],
  ['Стоит прямо', 'Standing straight'], ['Вполоборота', 'Three-quarter view'], ['Сидит', 'Sitting'], ['В движении', 'In motion'], ['Боевая стойка', 'Fighting stance'], ['Смотрит через плечо', 'Looking over shoulder'],
  ['Здесь пока пусто', 'Nothing here yet'], ['Основная галерея', 'Main gallery'], ['Скрытые', 'Hidden'], ['вдохновляйся', 'get inspired'], ['идеи на выбор', 'ideas to choose from'], ['куча тематик!', 'lots of themes!'],
  ['Можно создать сцену от одного до четырёх героев.', 'You can create a scene with one to four characters.'],
  ['С чего начнётся история персонажа?', 'Where does your character’s story begin?'], ['Как должен выглядеть будущий рисунок?', 'What should the finished artwork look like?'],
  ['Это влияет на награду за готовую работу.', 'This affects the reward for finished artwork.'], ['Это поможет точнее подобрать образ и телосложение.', 'This helps define the character’s look and build.'],
  ['Выбери цвет или напиши свой.', 'Choose a color or enter your own.'], ['Выбери основу или предложи свою.', 'Choose a base or add your own.'],
  ['Форма лица задаёт характер всему образу.', 'The face shape defines the whole character.'], ['Что сейчас чувствует твой персонаж?', 'What is your character feeling?'],
  ['Варианты подойдут для выбранного образа.', 'Choose the build that suits the character.'], ['Костюм рассказывает о мире и характере.', 'The outfit tells us about their world and personality.'],
  ['Опиши, как персонажи расположены относительно друг друга.', 'Describe how the characters are positioned and interact.'],
  ['Вся внешность героя собрана на одной странице.', 'Build the complete character appearance on one page.'], ['Создай образ', 'Create the look of'],
  ['Они занимают место, и их всегда можно вернуть.', 'They still use gallery space and can be restored anytime.'], ['Удаление освобождает место, скрытие — нет.', 'Deleting frees space; hiding does not.'],
  ['Мои', 'My'], ['референсы', 'references'], ['Твои', 'Your'], ['звёздочки', 'stars'], ['Найди', 'Find an'], ['художника', 'artist'],
  ['Настройки', 'Settings'], ['аккаунта', 'account'], ['Сейчас никнейм можно изменить', 'You can change your username now'],
  ['Можно изменить после', 'You can change it after'], ['Псевдоним можно менять в любое время', 'You can change your display name anytime'],
  ['Его можно изменить один раз в 30 дней', 'You can change it once every 30 days'], ['Он может повторяться и меняться свободно', 'It does not have to be unique and can be changed anytime'],
  ['Никнейм уникальный — по нему тебя найдут другие художники.', 'Your username is unique and helps other artists find you.'],
  ['Персонаж', 'Character'], ['персонажа', 'character'], ['персонажи', 'characters'], ['волосы', 'hair'], ['лицо', 'face'], ['эмоция', 'emotion'],
  ['телосложение', 'build'], ['образ', 'outfit'], ['детали', 'details'], ['Взаимодействие', 'Interaction'], ['Пример позы', 'Pose example'],
  ['Обычные', 'Regular'], ['Мягкие', 'Soft'], ['Острые', 'Sharp'], ['Кукольные', 'Doll-like'], ['Мужественные', 'Masculine'], ['Необычные', 'Unusual'],
  ['Среднее', 'Average'], ['Стройное', 'Slim'], ['Атлетичное', 'Athletic'], ['Крепкое', 'Strong'], ['Хрупкое', 'Delicate'], ['Пышное', 'Curvy'], ['Высокое', 'Tall'],
  ['Длинный плащ', 'Long coat'], ['Лёгкое платье', 'Light dress'], ['Доспехи', 'Armor'], ['Уличный стиль', 'Streetwear'], ['Футуристический костюм', 'Futuristic suit'], ['Классический образ', 'Classic look'],
  ['Каскад', 'Layered cut'], ['Косички', 'Braids'], ['Каре', 'Bob cut'], ['Длинные волны', 'Long waves'], ['Высокий хвост', 'High ponytail'], ['Короткая стрижка', 'Short haircut'],
  ['Количество', 'Number of characters'], ['Напиши сюда свою тематику', 'Enter your own theme'], ['Напиши свой стиль', 'Enter your own style'],
  ['Опиши уровень готовности', 'Describe the level of finish'], ['Опиши свой вариант', 'Describe your option'], ['Опиши причёску своими словами', 'Describe the hairstyle'],
  ['Какую эмоцию для персонажа хочешь ты?', 'Describe the emotion you want'], ['Опиши телосложение точнее', 'Describe the build'],
  ['Опиши свою идею одежды', 'Describe your outfit idea'], ['Опиши свою позу', 'Describe your pose'], ['Особые детали, аксессуары, характер', 'Special details, accessories, personality'],
  ['Например: ночная атмосфера, вокруг светятся магические растения', 'For example: a nighttime scene with glowing magical plants'],
  ['Например: мягкие линии и акварельные цвета', 'For example: soft lines and watercolor colors'], ['Например: чистый лайн с простыми тенями', 'For example: clean line art with simple shadows'],
  ['Например: молодой персонаж с немного андрогинной внешностью', 'For example: a young character with a slightly androgynous appearance'],
  ['Например: тёмно-синие волосы, две тонкие пряди падают на лицо', 'For example: dark blue hair with two thin strands framing the face'],
  ['Например: тёмно-синие', 'For example: dark blue'], ['Можно добавить пряди или градиент', 'You can add highlights or a gradient'],
  ['Например: нос с горбинкой, заострённые уши, серьги', 'For example: an aquiline nose, pointed ears, and earrings'],
  ['Например: веснушки, нос с горбинкой и маленький шрам над бровью', 'For example: freckles, an aquiline nose, and a small scar above the eyebrow'],
  ['Например: улыбается губами, а из глаз текут маленькие слёзы', 'For example: smiling while small tears run from their eyes'],
  ['Например: широкие плечи, длинные ноги и сильные руки', 'For example: broad shoulders, long legs, and strong arms'],
  ['Например: потёртая кожа, серебряные застёжки и зелёная вышивка', 'For example: worn leather, silver clasps, and green embroidery'],
  ['Например: персонаж 1 приобнимает персонажа 2, а тот отстраняется', 'For example: character 1 hugs character 2 while they pull away'],
];

function translate(value: string) { return translations.reduce((text, [ru, en]) => text.split(ru).join(en), value); }

export function usePageTranslation() {
  const { language } = useLanguage();
  useEffect(() => {
    if (language !== 'en') return;
    const apply = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE && root.nodeValue?.trim()) {
        const translated = translate(root.nodeValue);
        if (translated !== root.nodeValue) root.nodeValue = translated;
        return;
      }
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) if (node.nodeValue?.trim()) {
        const translated = translate(node.nodeValue);
        if (translated !== node.nodeValue) node.nodeValue = translated;
      }
      if (root instanceof Element) [root, ...root.querySelectorAll('*')].forEach((element) => {
        ['placeholder', 'title', 'aria-label'].forEach((name) => { const value = element.getAttribute(name); if (value) element.setAttribute(name, translate(value)); });
      });
    };
    apply(document.body);
    const observer = new MutationObserver((items) => items.forEach((item) => {
      if (item.type === 'characterData') apply(item.target);
      item.addedNodes.forEach(apply);
    }));
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);
}
