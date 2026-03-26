import { DialogueTree } from '../../systems/DialogueEngine';

export const veraGrove: DialogueTree = {
  id: 'vera-grove',
  startNode: 'start',
  nodes: [
    {
      id: 'start',
      speaker: 'Вера',
      text: 'О, ты тоже здесь! Я рисую карту этой рощи. Знаешь, что интересно? Каждый раз маршрут получается другим.',
      next: 'map',
    },
    {
      id: 'map',
      speaker: 'Вера',
      text: 'Туман путает. Но я заметила: если не пытаться запомнить дорогу, а просто идти — всегда выходишь куда нужно.',
      choices: [
        {
          text: 'А как не бояться заблудиться?',
          next: 'fear',
          effects: { acceptance: 5 },
        },
        {
          text: 'Может, покажешь свою карту?',
          next: 'show-map',
          effects: { trust: 5 },
        },
      ],
    },
    {
      id: 'fear',
      speaker: 'Вера',
      text: 'Бояться — нормально. Я тоже боюсь. Но заблудиться — это не конец. Это просто... ещё не нашёл. Находить — интереснее, чем знать заранее.',
      effects: { selfKnowledge: 5 },
      diaryEntry: {
        id: 'vera-grove-met',
        title: 'Вера в тумане',
        text: 'Вера рисует карту рощи. Говорит: заблудиться — не конец. Это просто «ещё не нашёл».',
      },
    },
    {
      id: 'show-map',
      speaker: 'Вера',
      text: 'Вот, смотри. Видишь — тут линии обрываются? Это не ошибки. Это места, где я ещё не была. Белые пятна — самое интересное на карте.',
      effects: { selfKnowledge: 3 },
      diaryEntry: {
        id: 'vera-grove-met',
        title: 'Вера в тумане',
        text: 'Вера показала карту. Белые пятна — не ошибки. Это места, где она ещё не была. Самое интересное.',
      },
    },
  ],
};
