import { QuestDef } from '../../systems/QuestManager';

export const mainQuests: QuestDef[] = [
  {
    id: 'chapter-1-threshold',
    title: 'Глава 1: Порог',
    description: 'Первые шаги по тропе. Познакомиться с миром, встретить Отшельника.',
    steps: [
      { description: 'Поговорить с Отшельником', conditionFlag: 'hermit-intro-done' },
      { description: 'Выполнить ритуал у ручья', conditionFlag: 'ritual-breathing-done' },
    ],
    reward: {
      effects: { acceptance: 5 },
      diaryEntry: {
        id: 'ch1-complete',
        title: 'Первые шаги',
        text: 'Порог пройден. Тропа только начинается, но первый шаг — самый важный.',
      },
    },
  },
  {
    id: 'chapter-2-meadow',
    title: 'Глава 2: Тихий Луг',
    description: 'Исследовать луг, познакомиться с Лин и Ирой.',
    steps: [
      { description: 'Поговорить с Лин', conditionFlag: 'lin-lesson' },
      { description: 'Поговорить с Ирой', conditionFlag: 'ira-met' },
      { description: 'Собрать букет', conditionFlag: 'ritual-flowers-done' },
    ],
    reward: {
      effects: { care: 5, selfKnowledge: 5 },
      diaryEntry: {
        id: 'ch2-complete',
        title: 'Луг позади',
        text: 'Тихий Луг подарил встречи и тишину. Лин и Ира — каждый по-своему учит быть.',
      },
    },
  },
  {
    id: 'chapter-3-grove',
    title: 'Глава 2: Голоса в тумане',
    description: 'Пройти Туманную рощу, найти дорогу, встретить Веру.',
    steps: [
      { description: 'Встретить Веру в роще', conditionFlag: 'vera-grove-met' },
      { description: 'Дождаться светлячков', conditionFlag: 'ritual-firefly-done' },
    ],
    reward: {
      effects: { acceptance: 8 },
      diaryEntry: {
        id: 'ch3-complete',
        title: 'Сквозь туман',
        text: 'Роща научила: можно идти, даже когда не видно далеко. Достаточно видеть следующий шаг.',
      },
    },
  },
  {
    id: 'chapter-4-village',
    title: 'Глава 3: Тёплые огни',
    description: 'Деревня Огоньков. Познакомиться с жителями, найти тепло.',
    steps: [
      { description: 'Поговорить с Милой', conditionFlag: 'mila-herbs' },
      { description: 'Послушать Тома', conditionFlag: 'tom-played' },
      { description: 'Выпить чай у Глаши', conditionFlag: 'ritual-tea-done' },
    ],
    reward: {
      effects: { care: 8, trust: 5 },
      diaryEntry: {
        id: 'ch4-complete',
        title: 'Деревня',
        text: 'Деревня Огоньков — место, где можно согреться. Тепло — ресурс, а не убежище.',
      },
    },
  },
  {
    id: 'chapter-5-river',
    title: 'Глава 4: Течение',
    description: 'Берег Тихой реки. Отпустить, вспомнить, послушать воду.',
    steps: [
      { description: 'Отпустить камень в реку', conditionFlag: 'ritual-memory-done' },
      { description: 'Поговорить с Лин у дерева', conditionFlag: 'lin-river-met' },
    ],
    reward: {
      effects: { acceptance: 10 },
      diaryEntry: {
        id: 'ch5-complete',
        title: 'Река',
        text: 'Река уносит то, что мы готовы отпустить. Не навсегда, но далеко.',
      },
    },
  },
  {
    id: 'chapter-6-hills',
    title: 'Глава 5: Эхо внутри',
    description: 'Холмы Шёпота. Различить свои мысли от чужих.',
    steps: [
      { description: 'Поговорить с Отшельником в пещере', conditionFlag: 'hermit-hills-met' },
      { description: 'Зажечь фонарик у Сола', conditionFlag: 'sol-lantern' },
    ],
    reward: {
      effects: { selfKnowledge: 10 },
      diaryEntry: {
        id: 'ch6-complete',
        title: 'Холмы',
        text: 'Свои мысли — тёплые. Чужие — холодные. Теперь я слышу разницу.',
      },
    },
  },
  {
    id: 'chapter-7-mirrors',
    title: 'Глава 6: Отражения',
    description: 'Роща Зеркал. Перестать сравнивать, увидеть себя.',
    steps: [
      { description: 'Увидеть себя в Луже правды', conditionFlag: 'ritual-truth-done' },
      { description: 'Поговорить с Ниной', conditionFlag: 'nina-met' },
    ],
    reward: {
      effects: { selfKnowledge: 10, acceptance: 5 },
      diaryEntry: {
        id: 'ch7-complete',
        title: 'Зеркала',
        text: 'Чужой путь — только фрагмент. Мой узор — в том, что делаю каждый день.',
      },
    },
  },
  {
    id: 'chapter-8-mountain',
    title: 'Глава 7: Подъём',
    description: 'Горная тропа. Принять трудное, подняться.',
    steps: [
      { description: 'Поговорить с Отшельником у источника', conditionFlag: 'hermit-mountain-met' },
      { description: 'Послушать эхо в пещере', conditionFlag: 'ritual-echo-done' },
    ],
    reward: {
      effects: { acceptance: 10, selfKnowledge: 5 },
      diaryEntry: {
        id: 'ch8-complete',
        title: 'Вершина',
        text: 'Было трудно. И я смог. Тишина — не цель. Цель — слышать себя сквозь шум.',
      },
    },
  },
];
