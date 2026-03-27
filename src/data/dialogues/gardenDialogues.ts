import { DialogueTree } from '../../systems/DialogueEngine';

export const veraGarden: DialogueTree = {
  id: 'vera-garden',
  startNode: 'start',
  nodes: [
    {
      id: 'start',
      speaker: 'Вера',
      text: 'Ты дошёл до Сада. Знаешь, я знала, что ты дойдёшь. Не потому что ты сильный. Потому что ты — упрямый. В хорошем смысле.',
      next: 'garden-talk',
    },
    {
      id: 'garden-talk',
      speaker: 'Вера',
      text: 'Видишь мой участок? Карта, выложенная камнями. Все места, где мы были. Тропа — на карте. А значит — не потеряна.',
      diaryEntry: {
        id: 'vera-garden',
        title: 'Вера в Саду',
        text: 'Вера в Саду Тишины. У неё участок с картой из камней — все места тропы. Тропа не потеряна.',
      },
    },
  ],
};

export const linGarden: DialogueTree = {
  id: 'lin-garden',
  startNode: 'start',
  nodes: [
    {
      id: 'start',
      speaker: 'Лин',
      text: '...Слышишь? Здесь все звуки тропы вместе. Шелест, вода, ветер, птицы. Как оркестр, который наконец играет вместе.',
      next: 'garden-sound',
    },
    {
      id: 'garden-sound',
      speaker: 'Лин',
      text: 'Мой участок — саженец. Может, вырастет. Может, нет. Но я поливаю. Ты же знаешь.',
      diaryEntry: {
        id: 'lin-garden',
        title: 'Лин в Саду',
        text: 'Лин посадил саженец в Саду. Поливает. Может, вырастет. Может, нет. Но он поливает.',
      },
    },
  ],
};

export const hermitGarden: DialogueTree = {
  id: 'hermit-garden',
  startNode: 'start',
  nodes: [
    {
      id: 'start',
      speaker: 'Отшельник',
      text: 'Вот и Сад. Последняя встреча? Нет. Просто — другая. Тропа не кончается. Она меняется.',
      next: 'final',
    },
    {
      id: 'final',
      speaker: 'Отшельник',
      text: 'Ты пришёл сюда с тревогой. Она всё ещё здесь? Наверное. Но рядом с ней теперь — что-то ещё. Покой? Принятие? Или просто... усталость, которая больше не пугает.',
      choices: [
        {
          text: 'Тревога осталась. Но я научился с ней дышать.',
          next: 'breathe',
          effects: { acceptance: 15 },
          setFlag: 'ending-acceptance',
        },
        {
          text: 'Я не уверен, что нашёл ответ.',
          next: 'no-answer',
          effects: { selfKnowledge: 15 },
          setFlag: 'ending-seeking',
        },
        {
          text: 'Спасибо, что был на тропе.',
          next: 'thanks',
          effects: { trust: 15, care: 10 },
          setFlag: 'ending-connection',
        },
      ],
    },
    {
      id: 'breathe',
      speaker: 'Отшельник',
      text: 'Дышать с тревогой — это и есть ответ. Не победа, не проигрыш. Просто — жизнь. И она стоит того, чтобы продолжать.',
      setFlag: 'hermit-q4-done',
      diaryEntry: {
        id: 'hermit-final',
        title: 'Последний разговор',
        text: 'Отшельник в Саду: дышать с тревогой — это и есть ответ. Не победа. Просто жизнь.',
      },
    },
    {
      id: 'no-answer',
      speaker: 'Отшельник',
      text: 'Ответ — не обязательно слово. Иногда ответ — это то, что ты здесь стоишь и задаёшь вопрос. Это уже — много.',
      setFlag: 'hermit-q4-done',
      diaryEntry: {
        id: 'hermit-final',
        title: 'Последний разговор',
        text: 'Ответа нет. Но стоять здесь и спрашивать — уже ответ. Отшельник улыбнулся.',
      },
    },
    {
      id: 'thanks',
      speaker: 'Отшельник',
      text: 'Я не был на тропе. Я — часть тропы. Как ты теперь. Как все, кто прошёл. Тропа — это мы.',
      setFlag: 'hermit-q4-done',
      diaryEntry: {
        id: 'hermit-final',
        title: 'Последний разговор',
        text: 'Отшельник: я — часть тропы. Как ты теперь. Тропа — это мы.',
      },
    },
  ],
};
