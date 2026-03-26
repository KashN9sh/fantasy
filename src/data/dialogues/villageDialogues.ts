import { DialogueTree } from '../../systems/DialogueEngine';

export const milaVillage: DialogueTree = {
  id: 'mila-village',
  startNode: 'start',
  nodes: [
    {
      id: 'start',
      speaker: 'Мила',
      text: 'Здравствуй, путник. Ты выглядишь усталым. Не телом — чем-то глубже. Я — Мила, травница. Хочешь, соберу тебе сбор?',
      choices: [
        {
          text: 'Да, пожалуйста. Мне бы чего-нибудь успокоительного.',
          next: 'calming',
          effects: { care: 8 },
        },
        {
          text: 'А что помогает от тревоги?',
          next: 'question',
          effects: { selfKnowledge: 5 },
        },
      ],
    },
    {
      id: 'calming',
      speaker: 'Мила',
      text: 'Мята, мелисса, чабрец. Заваришь — и просто подержи чашку в руках. Тепло — тоже лекарство. Не от всего. Но от многого.',
      setFlag: 'mila-herbs',
      addItem: 'calming-herbs',
      diaryEntry: {
        id: 'mila-met',
        title: 'Мила-травница',
        text: 'Мила дала сбор трав: мята, мелисса, чабрец. Сказала: тепло чашки — тоже лекарство.',
      },
    },
    {
      id: 'question',
      speaker: 'Мила',
      text: 'От тревоги нет одного средства. Но есть ритуалы. Маленькие, повторяемые. Заварить чай. Полить цветы. Погладить кота. Они не лечат. Они — напоминают: ты здесь, ты жив, мир вокруг — настоящий.',
      setFlag: 'mila-herbs',
      diaryEntry: {
        id: 'mila-met',
        title: 'Мила-травница',
        text: 'Мила: от тревоги нет одного средства. Но есть ритуалы — маленькие, повторяемые. Они напоминают: ты здесь.',
      },
    },
  ],
};

export const yarikVillage: DialogueTree = {
  id: 'yarik-village',
  startNode: 'start',
  nodes: [
    {
      id: 'start',
      speaker: 'Кузнец Ярик',
      text: 'Подожди. Дай руки. ...Так. Я знаю, какой Якорь тебе нужен.',
      next: 'craft',
    },
    {
      id: 'craft',
      speaker: 'Кузнец Ярик',
      text: 'Якорь — это то, что держит на месте, когда внутри штормит. У каждого — свой. Твой будет маленький, но тяжёлый. Как хорошее слово, сказанное вовремя.',
      choices: [
        {
          text: 'Спасибо. Мне нужен такой якорь.',
          next: 'accept',
          effects: { trust: 10, acceptance: 5 },
        },
        {
          text: 'А без якоря нельзя?',
          next: 'without',
          effects: { selfKnowledge: 8 },
        },
      ],
    },
    {
      id: 'accept',
      speaker: 'Кузнец Ярик',
      text: 'Держи. Он маленький, но когда тревога — сожми его в кулаке. Почувствуешь тяжесть — и вспомнишь: ты на земле.',
      addItem: 'anchor',
      setFlag: 'yarik-anchor',
      diaryEntry: {
        id: 'yarik-anchor',
        title: 'Якорь от Ярика',
        text: 'Кузнец Ярик выковал Якорь — маленький, но тяжёлый. Говорит: сожми, когда штормит внутри.',
      },
    },
    {
      id: 'without',
      speaker: 'Кузнец Ярик',
      text: 'Можно. Но труднее. Якорь — не костыль. Это инструмент. Как молоток — не делает тебя слабым, просто помогает.',
      next: 'accept',
    },
  ],
};

export const tomVillage: DialogueTree = {
  id: 'tom-village',
  startNode: 'start',
  nodes: [
    {
      id: 'start',
      speaker: 'Том',
      text: '*настраивает гитару* ...Привет. Ты когда-нибудь замечал, что мелодия может сказать то, что словами не выходит?',
      next: 'play',
    },
    {
      id: 'play',
      speaker: 'Том',
      text: 'Я играю не для зрителей. Играю для тишины. Чтобы она стала не пустой, а наполненной. Хочешь послушать?',
      choices: [
        {
          text: 'Да, играй.',
          next: 'listen',
          effects: { care: 8, acceptance: 5 },
        },
        {
          text: 'А можно... просто помолчать вместе?',
          next: 'silence',
          effects: { trust: 8, selfKnowledge: 5 },
        },
      ],
    },
    {
      id: 'listen',
      speaker: 'Том',
      text: '...Том играет. Мелодия простая, тёплая, с лёгкой грустью — как закат в конце хорошего дня. Ты чувствуешь, как что-то внутри расслабляется.',
      setFlag: 'tom-played',
      diaryEntry: {
        id: 'tom-music',
        title: 'Мелодия Тома',
        text: 'Том играл в беседке. Мелодия простая, тёплая. Как закат после хорошего дня.',
      },
    },
    {
      id: 'silence',
      speaker: 'Том',
      text: '...Вы молчите вместе. Не неловко. Не тяжело. Просто — тихо. И в этой тишине — больше, чем в тысяче слов.',
      setFlag: 'tom-played',
      diaryEntry: {
        id: 'tom-music',
        title: 'Тишина с Томом',
        text: 'Сидели с Томом в беседке молча. Тишина не была пустой. Она была — наполненной.',
      },
    },
  ],
};
