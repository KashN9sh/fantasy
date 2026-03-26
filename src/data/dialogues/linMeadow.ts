import { DialogueTree } from '../../systems/DialogueEngine';

export const linMeadow: DialogueTree = {
  id: 'lin-meadow',
  startNode: 'start',
  nodes: [
    {
      id: 'start',
      speaker: 'Лин',
      text: '...Тише. Слышишь? Трава шумит. Если замереть — можно услышать, как дышит луг.',
      next: 'listen',
    },
    {
      id: 'listen',
      speaker: 'Лин',
      text: 'Меня зовут Лин. Я собираю звуки. У каждого места — свой голос. У этого луга — шёпот.',
      choices: [
        {
          text: 'Какой красивый подход. Научишь слушать?',
          next: 'teach',
          effects: { selfKnowledge: 8, care: 3 },
        },
        {
          text: 'Звуки? Я слышу только свои мысли...',
          next: 'thoughts',
          effects: { acceptance: 5 },
        },
      ],
    },
    {
      id: 'teach',
      speaker: 'Лин',
      text: 'Закрой глаза. Первый звук, который придёт — не отбрасывай его. Он и есть твой. У тебя получится.',
      setFlag: 'lin-lesson',
      diaryEntry: {
        id: 'lin-met',
        title: 'Лин — собиратель звуков',
        text: 'Лин на лугу учит слушать тишину. Говорит: первый звук, который придёт — не отбрасывай.',
      },
    },
    {
      id: 'thoughts',
      speaker: 'Лин',
      text: 'Мысли — тоже звук. Не самый тихий, правда? Но если дать им место, они становятся мягче. Как далёкий гром, который уже прошёл.',
      setFlag: 'lin-lesson',
      diaryEntry: {
        id: 'lin-met',
        title: 'Лин — собиратель звуков',
        text: 'Лин говорит: мысли — тоже звук. Если дать им место, они становятся мягче.',
      },
    },
  ],
};
