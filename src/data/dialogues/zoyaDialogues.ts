import type { DialogueTree } from '../../systems/DialogueEngine';

export const zoyaMirrors: DialogueTree = {
  id: 'zoya-mirrors',
  startNode: 'greeting',
  nodes: [
    {
      id: 'greeting',
      speaker: 'Аптекарь Зоя',
      text: 'Тихая женщина с корзиной трав наклоняется к зеркальному дереву. Замечает тебя — и выпрямляется. Не испугана. Просто ждёт.',
      next: 'explain',
    },
    {
      id: 'explain',
      speaker: 'Зоя',
      text: '«Зеркальная роса. Капли, в которых видно только небо — не чужие лица, не чужие успехи. Только свет.»',
      next: 'ask',
    },
    {
      id: 'ask',
      speaker: 'Зоя',
      text: '«Мне нужна помощь. Я собираю росу для снадобья спокойствия, но одна не справляюсь — нужны руки, которые не дрожат от чужих отражений.»',
      choices: [
        {
          text: 'Я помогу собрать',
          next: 'accept',
          setFlag: 'zoya-dew-started',
        },
        {
          text: 'Может быть, позже',
          next: 'decline',
        },
      ],
    },
    {
      id: 'accept',
      speaker: 'Зоя',
      text: '«Хорошо. Ищи капли на стволах — те, что ловят свет, а не тени. Только небо. Ничьё лицо.»',
      setFlag: 'zoya-met',
      diaryEntry: {
        id: 'zoya-dew-quest',
        title: 'Зеркальная роса',
        text: 'Зоя просит помочь собрать росу с зеркальных деревьев. Нужны капли, в которых видно только небо.',
      },
    },
    {
      id: 'decline',
      speaker: 'Зоя',
      text: '«Ничего. Роса терпелива. И я — тоже.»',
      setFlag: 'zoya-met',
    },
  ],
};

export const zoyaGathering: DialogueTree = {
  id: 'zoya-gathering',
  startNode: 'check',
  nodes: [
    {
      id: 'check',
      speaker: 'Зоя',
      text: '«Ты нашёл? Покажи...» Зоя заглядывает в пузырёк.',
      next: 'result',
    },
    {
      id: 'result',
      speaker: 'Зоя',
      text: '«Вот. Небо. Чистое. Без чужих лиц. Спасибо.» Зоя достаёт маленький пузырёк с мерцающей жидкостью.',
      effects: { selfKnowledge: 5, acceptance: 3 },
      setFlag: 'zoya-dew-delivered',
      diaryEntry: {
        id: 'zoya-dew-done',
        title: 'Роса собрана',
        text: 'Собрал зеркальную росу для Зои. Капли, в которых видно только небо — никаких чужих отражений.',
      },
    },
  ],
};

export const zoyaComplete: DialogueTree = {
  id: 'zoya-complete',
  startNode: 'thanks',
  nodes: [
    {
      id: 'thanks',
      speaker: 'Зоя',
      text: '«Снадобье почти готово. Ты помог — не только мне. Себе тоже. Ты смотрел на дерево и видел небо, а не чужие успехи.»',
      effects: { acceptance: 2 },
    },
  ],
};

export const zoyaExpired: DialogueTree = {
  id: 'zoya-expired',
  startNode: 'gone',
  nodes: [
    {
      id: 'gone',
      speaker: '',
      text: 'На месте, где стояла Зоя, — только пустой пузырёк и записка: «Собрала сама. Не обижаюсь. Роса терпелива — а люди нет.»',
      diaryEntry: {
        id: 'zoya-dew-missed',
        title: 'Зоя ушла',
        text: 'Зоя собрала росу сама. На месте — пузырёк и записка.',
      },
    },
  ],
};
