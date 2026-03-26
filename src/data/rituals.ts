import { RitualDef } from '../systems/RitualEngine';

export const rituals: Record<string, RitualDef> = {
  breathing: {
    id: 'breathing',
    name: 'Дыхание у ручья',
    instruction: 'Сядь на скамейку. Прислушайся к воде. Дыши.',
    steps: [
      { text: 'Закрой глаза... (подожди)', action: 'wait', duration: 2000 },
      { text: 'Вдох... (нажми E)', action: 'press-e' },
      { text: 'Задержи... (подожди)', action: 'wait', duration: 1500 },
      { text: 'Выдох... (нажми E)', action: 'press-e' },
      { text: 'Ещё раз. Вдох... (нажми E)', action: 'press-e' },
      { text: 'И выдох... (нажми E)', action: 'press-e' },
      { text: 'Тишина. Ты слышишь ручей.', action: 'wait', duration: 2000 },
    ],
    reward: {
      effects: { care: 10, acceptance: 5 },
      setFlag: 'ritual-breathing-done',
      diaryEntry: {
        id: 'ritual-breathing',
        title: 'Дыхание у ручья',
        text: 'Сел у ручья и просто дышал. Вода журчит, воздух прохладный. Стало спокойнее.',
      },
    },
  },

  watering: {
    id: 'watering',
    name: 'Полив увядшего цветка',
    instruction: 'Цветок поник. Может, ему нужна вода?',
    steps: [
      { text: 'Ты набираешь воды из ручья...', action: 'wait', duration: 1500 },
      { text: 'Аккуратно поливаешь корни... (нажми E)', action: 'press-e' },
      { text: 'Ждёшь...', action: 'wait', duration: 2000 },
      { text: 'Лепестки медленно расправляются.', action: 'wait', duration: 1500 },
      { text: 'Цветок снова живой. Забота работает.', action: 'press-e' },
    ],
    reward: {
      effects: { care: 15 },
      setFlag: 'ritual-watering-done',
      addItem: 'revived-petal',
      diaryEntry: {
        id: 'ritual-watering',
        title: 'Увядший цветок',
        text: 'Полил цветок у тропы. Он ожил. Маленькое, но настоящее чудо.',
      },
    },
  },

  'flower-gathering': {
    id: 'flower-gathering',
    name: 'Сбор полевых цветов',
    instruction: 'Поляна полна цветов. Собери небольшой букет — не торопись.',
    steps: [
      { text: 'Ты наклоняешься к цветам...', action: 'wait', duration: 1500 },
      { text: 'Первый цветок — голубой, как утреннее небо. (нажми E)', action: 'press-e' },
      { text: 'Второй — жёлтый, тёплый. (нажми E)', action: 'press-e' },
      { text: 'Третий — белый, почти прозрачный. (нажми E)', action: 'press-e' },
      { text: 'Букет в руках. Простой, но красивый.', action: 'wait', duration: 2000 },
    ],
    reward: {
      effects: { care: 8, selfKnowledge: 5 },
      setFlag: 'ritual-flowers-done',
      addItem: 'meadow-bouquet',
      diaryEntry: {
        id: 'ritual-flowers',
        title: 'Букет с луга',
        text: 'Собрал букет на лугу: голубой, жёлтый, белый. Три цветка — три настроения.',
      },
    },
  },

  'firefly-wait': {
    id: 'firefly-wait',
    name: 'Ожидание светлячков',
    instruction: 'Сядь на поляне и подожди. Светлячки придут.',
    steps: [
      { text: 'Ты садишься на мягкую траву...', action: 'wait', duration: 2000 },
      { text: 'Тишина. Только капли с листьев.', action: 'wait', duration: 2000 },
      { text: 'Первый огонёк... (подожди)', action: 'wait', duration: 1500 },
      { text: 'Ещё один. И ещё. Светлячки подлетают ближе.', action: 'wait', duration: 2000 },
      { text: 'Туман отступает на шаг. Свет — тёплый.', action: 'press-e' },
    ],
    reward: {
      effects: { acceptance: 8, care: 5 },
      setFlag: 'ritual-firefly-done',
      diaryEntry: {
        id: 'ritual-firefly',
        title: 'Светлячки в тумане',
        text: 'Сидел на поляне в роще и ждал. Светлячки пришли. Туман отступил. Тёплый свет в холодном месте.',
      },
    },
  },

  'tea-silence': {
    id: 'tea-silence',
    name: 'Чай в тишине',
    instruction: 'Бабушка Глаша заварит то, что нужно. Просто держи чашку.',
    steps: [
      { text: 'Глаша смотрит на тебя и кивает...', action: 'wait', duration: 1500 },
      { text: 'Чайник закипает. Запах трав наполняет комнату.', action: 'wait', duration: 2000 },
      { text: 'Чашка в руках. Тёплая. (нажми E)', action: 'press-e' },
      { text: 'Первый глоток. Мята и что-то сладкое.', action: 'press-e' },
      { text: 'Тишина. Потрескивание дров. Чашка греет ладони.', action: 'wait', duration: 2500 },
      { text: 'Глаша улыбается. Не говорит ни слова.', action: 'press-e' },
    ],
    reward: {
      effects: { care: 12, trust: 5 },
      setFlag: 'ritual-tea-done',
      diaryEntry: {
        id: 'ritual-tea',
        title: 'Чай у Глаши',
        text: 'Пил чай у бабушки Глаши. Она не сказала ни слова. Но чашка грела руки, и стало спокойнее.',
      },
    },
  },

  'garden-care': {
    id: 'garden-care',
    name: 'Забота о саде',
    instruction: 'В общинном саду есть грядка, которая просит внимания.',
    steps: [
      { text: 'Ты находишь заросшую грядку...', action: 'wait', duration: 1500 },
      { text: 'Аккуратно убираешь сорняки... (нажми E)', action: 'press-e' },
      { text: 'Рыхлишь землю... (нажми E)', action: 'press-e' },
      { text: 'Поливаешь... (нажми E)', action: 'press-e' },
      { text: 'Грядка выглядит лучше. Маленькое, но честное дело.', action: 'wait', duration: 2000 },
    ],
    reward: {
      effects: { care: 10, acceptance: 5 },
      setFlag: 'ritual-garden-done',
      diaryEntry: {
        id: 'ritual-garden',
        title: 'Общинный сад',
        text: 'Прополол и полил грядку в общинном саду. Маленькое, но честное дело.',
      },
    },
  },

  'memory-stone': {
    id: 'memory-stone',
    name: 'Камень памяти',
    instruction: 'Напиши на камне то, что хочешь отпустить, и положи в воду.',
    steps: [
      { text: 'Ты берёшь гладкий камень...', action: 'wait', duration: 1500 },
      { text: 'Что ты хочешь отпустить? (подумай)', action: 'wait', duration: 3000 },
      { text: 'Прикасаешься к камню. Он тёплый. (нажми E)', action: 'press-e' },
      { text: 'Кладёшь камень в воду...', action: 'wait', duration: 2000 },
      { text: 'Река уносит. Не навсегда. Но далеко.', action: 'wait', duration: 2000 },
    ],
    reward: {
      effects: { acceptance: 12, selfKnowledge: 8 },
      setFlag: 'ritual-memory-done',
      diaryEntry: {
        id: 'ritual-memory',
        title: 'Камень в реке',
        text: 'Положил камень в реку. Река унесла то, что я хотел отпустить. Не навсегда. Но далеко.',
      },
    },
  },

  'wind-harp': {
    id: 'wind-harp',
    name: 'Ветряная арфа',
    instruction: 'Послушай мелодию ветра. Она меняется.',
    steps: [
      { text: 'Ветер играет на струнах...', action: 'wait', duration: 2000 },
      { text: 'Мелодия тихая. Колыбельная?', action: 'wait', duration: 2000 },
      { text: 'Ветер усиливается. Ноты становятся тревожнее.', action: 'wait', duration: 2000 },
      { text: 'Затихает. Снова — колыбельная. (нажми E)', action: 'press-e' },
      { text: 'Даже шум может быть музыкой, если слушать по-другому.', action: 'wait', duration: 2000 },
    ],
    reward: {
      effects: { acceptance: 8, selfKnowledge: 8 },
      setFlag: 'ritual-harp-done',
      diaryEntry: {
        id: 'ritual-harp',
        title: 'Ветряная арфа',
        text: 'Слушал ветряную арфу на холмах. Мелодия менялась. Даже шум может быть музыкой.',
      },
    },
  },

  'truth-puddle': {
    id: 'truth-puddle',
    name: 'Лужа правды',
    instruction: 'Подожди, пока вода успокоится. Увидишь себя.',
    steps: [
      { text: 'Ты наклоняешься к луже...', action: 'wait', duration: 1500 },
      { text: 'Отражение мутное, нечёткое.', action: 'wait', duration: 2000 },
      { text: 'Подожди... не двигайся... (подожди)', action: 'wait', duration: 3000 },
      { text: 'Вода успокаивается. Отражение проясняется. (нажми E)', action: 'press-e' },
      { text: 'Ты видишь себя. Не идеального. Настоящего. И это — достаточно.', action: 'wait', duration: 2500 },
    ],
    reward: {
      effects: { selfKnowledge: 15, acceptance: 8 },
      setFlag: 'ritual-truth-done',
      diaryEntry: {
        id: 'ritual-truth',
        title: 'Лужа правды',
        text: 'Увидел себя в Луже правды. Не идеального. Настоящего. И это — достаточно.',
      },
    },
  },

  'echo-cave': {
    id: 'echo-cave',
    name: 'Пещера эха',
    instruction: 'Скажи что-нибудь — и услышь себя трижды.',
    steps: [
      { text: 'Ты входишь в пещеру. Тихо.', action: 'wait', duration: 1500 },
      { text: '...Говоришь: «Я здесь.» (нажми E)', action: 'press-e' },
      { text: '...Я здесь... я здесь... я здесь...', action: 'wait', duration: 2500 },
      { text: 'Эхо затихает. Но слова остаются.', action: 'wait', duration: 2000 },
      { text: 'Ты слышал себя. И этого достаточно. (нажми E)', action: 'press-e' },
    ],
    reward: {
      effects: { selfKnowledge: 10, acceptance: 10 },
      setFlag: 'ritual-echo-done',
      diaryEntry: {
        id: 'ritual-echo',
        title: 'Пещера эха',
        text: 'Сказал в пещере: «Я здесь.» Услышал себя трижды. Эхо затихло. Слова остались.',
      },
    },
  },

  'plant-garden': {
    id: 'plant-garden',
    name: 'Посадить что-то в Саду',
    instruction: 'Пустой участок ждёт. Посади — или оставь пустым.',
    steps: [
      { text: 'Ты стоишь у пустого участка...', action: 'wait', duration: 2000 },
      { text: 'Земля мягкая, готовая принять.', action: 'wait', duration: 1500 },
      { text: 'Ты опускаешь руки в землю... (нажми E)', action: 'press-e' },
      { text: 'Сажаешь семя — не знаешь, что вырастет.', action: 'wait', duration: 2000 },
      { text: 'Поливаешь... (нажми E)', action: 'press-e' },
      { text: 'Готово. Теперь ждать. Как и всё на тропе.', action: 'wait', duration: 2000 },
    ],
    reward: {
      effects: { care: 15, acceptance: 10, selfKnowledge: 5, trust: 5 },
      setFlag: 'ritual-plant-done',
      diaryEntry: {
        id: 'ritual-plant',
        title: 'Мой участок в Саду',
        text: 'Посадил семя в Саду Тишины. Не знаю, что вырастет. Но посадил.',
      },
    },
  },
};

export function getRitual(id: string): RitualDef | null {
  return rituals[id] ?? null;
}
