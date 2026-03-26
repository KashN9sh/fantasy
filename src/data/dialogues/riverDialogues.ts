import { DialogueTree } from '../../systems/DialogueEngine';

export const linRiver: DialogueTree = {
  id: 'lin-river',
  startNode: 'start',
  nodes: [
    {
      id: 'start',
      speaker: 'Лин',
      text: 'Видишь это дерево? Оно сухое. Я поливаю его каждый день. Лин, кстати, если мы ещё не знакомы.',
      next: 'why',
    },
    {
      id: 'why',
      text: 'Почему поливаешь, если оно мёртвое? Потому что не знаю наверняка. А вдруг — нет?',
      speaker: 'Лин',
      choices: [
        {
          text: 'Это... красиво. Забота без гарантии результата.',
          next: 'beautiful',
          effects: { care: 10 },
        },
        {
          text: 'Может, стоит отпустить?',
          next: 'let-go',
          effects: { acceptance: 8 },
        },
      ],
    },
    {
      id: 'beautiful',
      speaker: 'Лин',
      text: 'Именно. Забота — не про результат. Она про процесс. Про то, что ты пришёл с лейкой, хотя мог не прийти.',
      setFlag: 'lin-river-met',
      diaryEntry: {
        id: 'lin-river',
        title: 'Лин и сухое дерево',
        text: 'Лин поливает сухое дерево каждый день. Говорит: забота — не про результат. Про то, что пришёл.',
      },
    },
    {
      id: 'let-go',
      speaker: 'Лин',
      text: 'Может. Но отпустить — не значит перестать любить. Я поливаю не потому, что оно оживёт. А потому, что помню, каким оно было.',
      setFlag: 'lin-river-met',
      effects: { selfKnowledge: 5 },
      diaryEntry: {
        id: 'lin-river',
        title: 'Лин и сухое дерево',
        text: 'Лин: отпустить — не значит перестать любить. Он поливает, потому что помнит.',
      },
    },
  ],
};

export const tikhonRiver: DialogueTree = {
  id: 'tikhon-river',
  startNode: 'start',
  nodes: [
    {
      id: 'start',
      speaker: 'Рыбак Тихон',
      text: '...Тише. Я ловлю. Не рыбу — отражения. Видишь — в воде небо другое. Больше облаков, больше глубины.',
      next: 'reflections',
    },
    {
      id: 'reflections',
      speaker: 'Рыбак Тихон',
      text: 'Я записываю, что вижу в воде. У каждого — своё отражение. Хочешь посмотреть?',
      choices: [
        {
          text: 'Хочу. Что ты видишь?',
          next: 'his-reflection',
          effects: { selfKnowledge: 5, trust: 5 },
        },
        {
          text: 'Боюсь увидеть своё.',
          next: 'afraid',
          effects: { acceptance: 8 },
        },
      ],
    },
    {
      id: 'his-reflection',
      speaker: 'Рыбак Тихон',
      text: 'Сегодня — лодку, которая плывёт без вёсел. Иногда — дом, которого у меня никогда не было. Вода показывает не то, что есть, а то, чего не хватает. Или то, что уже есть, но мы не замечаем.',
      diaryEntry: {
        id: 'tikhon-met',
        title: 'Рыбак Тихон',
        text: 'Тихон ловит отражения в реке. Говорит: вода показывает то, чего не хватает. Или то, что не замечаем.',
      },
    },
    {
      id: 'afraid',
      speaker: 'Рыбак Тихон',
      text: 'Нормально. Своё отражение — самое трудное. Но вода — терпеливая. Она подождёт, пока будешь готов.',
      effects: { selfKnowledge: 5 },
      diaryEntry: {
        id: 'tikhon-met',
        title: 'Рыбак Тихон',
        text: 'Тихон: своё отражение — самое трудное. Но вода терпеливая. Подождёт.',
      },
    },
  ],
};
