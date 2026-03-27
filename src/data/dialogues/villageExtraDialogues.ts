import { DialogueTree } from '../../systems/DialogueEngine';

export const kostyaVillage: DialogueTree = {
  id: 'kostya-village',
  startNode: 'start',
  nodes: [
    {
      id: 'start',
      speaker: 'Пекарь Костя',
      text: 'А, путник! Хлеб сегодня удался. Тёплый, с корочкой. Вот, возьми буханку.',
      next: 'offer',
    },
    {
      id: 'offer',
      speaker: 'Пекарь Костя',
      text: 'Отнеси кому-нибудь. Кому, по-твоему, нужно. Только не тяни — хлеб чёрствеет.',
      choices: [
        {
          text: 'Спасибо, отнесу.',
          next: 'accept',
          effects: { care: 3 },
        },
        {
          text: 'А можно мне?',
          next: 'for-self',
          effects: { acceptance: 3 },
        },
      ],
    },
    {
      id: 'accept',
      speaker: 'Пекарь Костя',
      text: 'Вот и хорошо. Хлеб сам знает, кого найти. Ты — только ноги.',
      setFlag: 'kostya-bread-given',
      addItem: 'fresh-bread',
      diaryEntry: {
        id: 'kostya-met',
        title: 'Хлеб Кости',
        text: 'Костя дал тёплую буханку: «Отнеси кому-нибудь. Только не тяни.»',
      },
    },
    {
      id: 'for-self',
      speaker: 'Пекарь Костя',
      text: 'Себе? Тоже нормально. Но вот что я заметил: хлеб, который отдаёшь — вкуснее. Парадокс, да?',
      next: 'accept',
    },
  ],
};

export const polinaVillage: DialogueTree = {
  id: 'polina-village',
  startNode: 'start',
  nodes: [
    {
      id: 'start',
      speaker: 'Полина',
      text: 'Тише, тише. Здесь — библиотека. Книги не любят шума. Зато любят — внимание.',
      next: 'quest',
    },
    {
      id: 'quest',
      speaker: 'Полина',
      text: 'Одна книга потерялась. Но не беспокойся — она найдёт тебя сама. Так устроены книги. Просто будь внимателен на тропе.',
      choices: [
        {
          text: 'Хорошо, буду искать.',
          next: 'accept',
          effects: { selfKnowledge: 3 },
        },
        {
          text: 'А как она выглядит?',
          next: 'describe',
        },
      ],
    },
    {
      id: 'describe',
      speaker: 'Полина',
      text: 'Маленькая, потёртая, с загнутыми углами. Пахнет дождём и мятой. Но не ищи глазами — ищи ощущением.',
      next: 'accept',
    },
    {
      id: 'accept',
      speaker: 'Полина',
      text: 'Когда найдёшь — можешь вернуть. Или оставить себе. Книги не обижаются. Они просто ждут.',
      setFlag: 'polina-quest-given',
      diaryEntry: {
        id: 'polina-met',
        title: 'Забытая книга',
        text: 'Полина: «Книга потерялась. Она найдёт тебя сама. Просто будь внимателен.»',
      },
    },
  ],
};

export const rayaVillage: DialogueTree = {
  id: 'raya-village',
  startNode: 'start',
  nodes: [
    {
      id: 'start',
      speaker: 'Рая',
      text: 'Привет! Видишь этот сад? Общий. Каждый может посадить что-нибудь. Хочешь?',
      choices: [
        {
          text: 'Хочу. Что есть?',
          next: 'choose',
          effects: { care: 3 },
        },
        {
          text: 'Может, позже.',
          next: 'later',
        },
      ],
    },
    {
      id: 'choose',
      speaker: 'Рая',
      text: 'Вот семена. Цветок, мята или шиповник. Что хочешь вырастить? Впрочем, для посадки — сходи к грядке.',
      setFlag: 'raya-offered',
      diaryEntry: {
        id: 'raya-met',
        title: 'Общий сад',
        text: 'Рая предложила посадить что-нибудь в общинном саду.',
      },
    },
    {
      id: 'later',
      speaker: 'Рая',
      text: 'Конечно. Сад никуда не денется. Земля терпеливая.',
      diaryEntry: {
        id: 'raya-met',
        title: 'Общий сад',
        text: 'Рая: «Сад никуда не денется. Земля терпеливая.»',
      },
    },
  ],
};
