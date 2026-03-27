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
      setFlag: 'mila-met',
      diaryEntry: {
        id: 'mila-met',
        title: 'Мила-травница',
        text: 'Мила не спит. Ей нужны дикий шалфей, лаванда и мята для чая спокойствия.',
      },
    },
    {
      id: 'question',
      speaker: 'Мила',
      text: 'От тревоги нет одного средства. Но есть ритуалы. Маленькие, повторяемые. Заварить чай. Полить цветы. Погладить кота. Они не лечат. Они — напоминают: ты здесь, ты жив, мир вокруг — настоящий.',
      setFlag: 'mila-met',
      diaryEntry: {
        id: 'mila-met',
        title: 'Мила-травница',
        text: 'Мила: от тревоги нет одного средства. Но есть ритуалы — маленькие, повторяемые. Ей нужны травы для чая.',
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
      addItem: 'yarik-anchor',
      setFlag: 'anchor-forged',
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
          text: 'Сыграй для ветра. На холмах есть арфа.',
          next: 'wind',
          effects: { trust: 5 },
        },
        {
          text: 'Сыграй для костра. Огонь не критик.',
          next: 'fire',
          effects: { care: 5 },
        },
        {
          text: 'Просто тронь струны. Один звук.',
          next: 'note',
          effects: { acceptance: 5 },
        },
      ],
    },
    {
      id: 'wind',
      speaker: 'Том',
      text: 'Для ветра... Ветер не оценит и не осудит. Может, ты прав. Пойду на холмы, послушаю арфу.',
      setFlag: 'tom-try-wind',
      diaryEntry: {
        id: 'tom-music',
        title: 'Тихая мелодия',
        text: 'Том боится играть. Предложил ему сыграть для ветра — он согласился попробовать.',
      },
    },
    {
      id: 'fire',
      speaker: 'Том',
      text: 'Для огня... Да. Огонь просто греет. Сегодня вечером — у костра. Попробую.',
      setFlag: 'tom-try-fire',
      diaryEntry: {
        id: 'tom-music',
        title: 'Тихая мелодия',
        text: 'Том не может играть от страха. Предложил ему сыграть для костра — огонь не критик.',
      },
    },
    {
      id: 'note',
      speaker: 'Том',
      text: '...Том трогает струну. Одна нота. Тишина. Слёзы. «Вот. Хоть что-то.»',
      setFlag: 'tom-try-note',
      effects: { acceptance: 3 },
      diaryEntry: {
        id: 'tom-music',
        title: 'Одна нота',
        text: 'Том тронул струну. Одна нота. Потом — слёзы. «Вот. Хоть что-то.»',
      },
    },
  ],
};
