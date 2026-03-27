import { DialogueTree } from '../../systems/DialogueEngine';

export const hermitMountain: DialogueTree = {
  id: 'hermit-mountain',
  startNode: 'start',
  nodes: [
    {
      id: 'start',
      speaker: 'Отшельник',
      text: 'Ты поднялся. Вода здесь ледяная и чистая. Как правда — обжигает, но освежает.',
      next: 'summit',
    },
    {
      id: 'summit',
      speaker: 'Отшельник',
      text: 'Знаешь, зачем люди поднимаются на горы? Не за видом. За ясностью. На высоте шум тише. Не потому, что исчез — потому, что ты выше.',
      choices: [
        {
          text: 'Мне было трудно подниматься.',
          next: 'hard',
          effects: { acceptance: 10 },
        },
        {
          text: 'Здесь действительно тише.',
          next: 'quiet',
          effects: { selfKnowledge: 8 },
        },
      ],
    },
    {
      id: 'hard',
      speaker: 'Отшельник',
      text: 'Конечно трудно. Лёгкий подъём — не подъём. Но ты поднялся. Запомни это ощущение: «было трудно, и я смог». Оно пригодится.',
      setFlag: 'hermit-q3-done',
      diaryEntry: {
        id: 'hermit-mountain',
        title: 'Отшельник у источника',
        text: 'Отшельник: лёгкий подъём — не подъём. Запомни: «было трудно, и я смог». Это пригодится.',
      },
    },
    {
      id: 'quiet',
      speaker: 'Отшельник',
      text: 'Тише — но не тихо. И не станет. Тишина — не цель. Цель — научиться слышать себя сквозь шум. И ты учишься.',
      setFlag: 'hermit-q3-done',
      diaryEntry: {
        id: 'hermit-mountain',
        title: 'Отшельник у источника',
        text: 'Тишина — не цель. Цель — слышать себя сквозь шум. И я учусь.',
      },
    },
  ],
};
