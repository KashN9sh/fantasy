import { DialogueTree } from '../../systems/DialogueEngine';

export const veraThreshold: DialogueTree = {
  id: 'vera-threshold',
  startNode: 'start',
  nodes: [
    {
      id: 'start',
      speaker: 'Вера',
      text: 'О, привет! Ты тоже идёшь по тропе? Я уже давно здесь. Не потому что заблудилась — просто... нравится быть рядом.',
      next: 'question',
    },
    {
      id: 'question',
      speaker: 'Вера',
      text: 'Знаешь, я заметила: когда идёшь не один, тропа кажется короче. Хочешь — пойдём вместе?',
      choices: [
        {
          text: 'Конечно. Вместе веселее.',
          next: 'together',
          effects: { trust: 10, care: 5 },
          setFlag: 'vera-companion',
        },
        {
          text: 'Мне нужно побыть одному. Но спасибо.',
          next: 'alone',
          effects: { selfKnowledge: 5 },
        },
        {
          text: 'А что если я тебя задержу?',
          next: 'doubt',
          effects: { acceptance: 5 },
        },
      ],
    },
    {
      id: 'together',
      speaker: 'Вера',
      text: 'Здорово! Я буду рядом. Не обязательно разговаривать — иногда просто молчать вместе тоже хорошо.',
      diaryEntry: {
        id: 'vera-met',
        title: 'Вера',
        text: 'Встретил Веру на Пороге. Она предложила идти вместе. В её голосе — тепло, как у старого друга.',
      },
    },
    {
      id: 'alone',
      speaker: 'Вера',
      text: 'Понимаю. Иногда нужно послушать себя в тишине. Я буду здесь, если передумаешь. Тропа длинная.',
      diaryEntry: {
        id: 'vera-met',
        title: 'Вера',
        text: 'Вера предложила идти вместе, но я выбрал одиночество. Она не обиделась — только улыбнулась.',
      },
    },
    {
      id: 'doubt',
      speaker: 'Вера',
      text: 'Задержишь? Нет. На этой тропе нет «быстро» и «медленно». Есть только — вместе или порознь. Оба варианта нормальны.',
      next: 'doubt-choice',
      effects: { acceptance: 3 },
    },
    {
      id: 'doubt-choice',
      speaker: 'Вера',
      text: 'Так что скажешь?',
      choices: [
        {
          text: 'Тогда пойдём.',
          next: 'together',
          effects: { trust: 8 },
          setFlag: 'vera-companion',
        },
        {
          text: 'Пока — один. Но я рад, что ты рядом.',
          next: 'alone',
          effects: { selfKnowledge: 3 },
        },
      ],
    },
  ],
};
