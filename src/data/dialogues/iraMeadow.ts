import { DialogueTree } from '../../systems/DialogueEngine';

export const iraMeadow: DialogueTree = {
  id: 'ira-meadow',
  startNode: 'start',
  nodes: [
    {
      id: 'start',
      speaker: 'Ира',
      text: 'Эй! Ты видел, какие здесь облака? Вон то похоже на кита. А то — на чашку чая.',
      next: 'sky',
    },
    {
      id: 'sky',
      speaker: 'Ира',
      text: 'Я Ира. Люблю смотреть вверх. Когда смотришь на небо, тревога становится меньше. Проверено!',
      choices: [
        {
          text: 'Правда? Я попробую.',
          next: 'try',
          effects: { care: 5, acceptance: 3 },
        },
        {
          text: 'У меня не получается отвлечься от тревоги.',
          next: 'cantDistract',
          effects: { selfKnowledge: 5 },
        },
        {
          text: 'Какой кит? Я вижу только серое.',
          next: 'grey',
          effects: { acceptance: 3 },
        },
      ],
    },
    {
      id: 'try',
      speaker: 'Ира',
      text: 'Вот! Видишь — уже легче. Не надо искать формы. Просто смотри, как они плывут. Облака никуда не торопятся.',
      diaryEntry: {
        id: 'ira-met',
        title: 'Ира и облака',
        text: 'Ира учит смотреть на облака. Говорит: они никуда не торопятся. И нам не надо.',
      },
    },
    {
      id: 'cantDistract',
      speaker: 'Ира',
      text: 'Не надо отвлекаться. Просто — добавь ещё что-то рядом с тревогой. Пусть она будет, но рядом будет и небо.',
      effects: { acceptance: 5 },
      diaryEntry: {
        id: 'ira-met',
        title: 'Ира и облака',
        text: 'Ира: не надо отвлекаться от тревоги. Просто добавь рядом что-то ещё. Например, небо.',
      },
    },
    {
      id: 'grey',
      speaker: 'Ира',
      text: 'Серое — тоже красивое. Знаешь, сколько оттенков у серого? Больше, чем кажется. Как и у тебя.',
      effects: { selfKnowledge: 5 },
      diaryEntry: {
        id: 'ira-met',
        title: 'Ира и облака',
        text: 'Ира говорит: серое тоже красивое. Сколько оттенков у серого — больше, чем кажется.',
      },
    },
  ],
};
