import type { DialogueTree } from '../../systems/DialogueEngine';

export const glashaTeahouse: DialogueTree = {
  id: 'glasha-teahouse',
  startNode: 'greeting',
  nodes: [
    {
      id: 'greeting',
      speaker: 'Бабушка Глаша',
      text: 'Глаша смотрит на тебя поверх чайника. Не удивляется. Кивает — медленно, как будто знала, что придёшь.',
      next: 'offer',
    },
    {
      id: 'offer',
      speaker: 'Бабушка Глаша',
      text: '«Чай?» — Одно слово. Не вопрос — скорее, предложение, которое не нуждается в ответе.',
      choices: [
        {
          text: 'Сесть и выпить чай',
          next: 'accept',
          setFlag: 'glasha-tea-accepted',
        },
        {
          text: 'Спасибо, не сейчас',
          next: 'decline',
        },
      ],
    },
    {
      id: 'accept',
      speaker: 'Бабушка Глаша',
      text: 'Глаша снова кивает. Ставит чашку на стол — мягко, без стука. Запах трав наполняет комнату. «Посиди.»',
      diaryEntry: {
        id: 'glasha-met',
        title: 'Бабушка Глаша',
        text: 'Зашёл в чайную. Глаша не спрашивает — просто ставит чашку. Чай именно тот, который нужен.',
      },
      setFlag: 'glasha-met',
    },
    {
      id: 'decline',
      speaker: 'Бабушка Глаша',
      text: 'Глаша чуть улыбается. «Чай будет. Когда захочешь.» Отворачивается к чайнику.',
      setFlag: 'glasha-met',
    },
  ],
};

export const glashaReturn: DialogueTree = {
  id: 'glasha-return',
  startNode: 'welcome-back',
  nodes: [
    {
      id: 'welcome-back',
      speaker: 'Бабушка Глаша',
      text: 'Глаша уже наливает. «Ты вернулся.» Не вопрос. Чашка — на столе.',
      choices: [
        {
          text: 'Выпить чай',
          next: 'tea-again',
          setFlag: 'glasha-tea-accepted',
        },
        {
          text: 'Просто посидеть',
          next: 'sit',
        },
      ],
    },
    {
      id: 'tea-again',
      speaker: 'Бабушка Глаша',
      text: 'Глаша садится напротив. Молчит. Чай — горячий, с мятой и чем-то сладким.',
      effects: { care: 2 },
    },
    {
      id: 'sit',
      speaker: 'Бабушка Глаша',
      text: 'Глаша кивает. Тишина — тёплая, не тяжёлая. Дрова потрескивают.',
      effects: { care: 1 },
    },
  ],
};
