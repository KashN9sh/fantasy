/**
 * Сцены по [SCENARIO.md](docs/SCENARIO.md) — части 1–4 (опушка, мост, поляна, роща).
 * Источник истины для рантайма; при расхождении обновлять docs или код.
 */
import type { DialogLine, StoryChoiceOption } from "../game/types";

export const HERMIT_NAME = "Отшельник у тропы";
export const VERA_NAME = "Вера";
export const LIN_NAME = "Лин";
export const IRA_NAME = "Ира";

/** Встреча 1.2 — до вопроса «победить или понять» */
export const HERMIT_FIRST_INTRO: DialogLine[] = [
  {
    speaker: HERMIT_NAME,
    text: "Опять ты. Или впервые? Неважно. Вопрос один и тот же.",
  },
  {
    speaker: HERMIT_NAME,
    text: "Ты слышишь гул? Его не выключить силой — только тем, что тише колокола. У тебя в сумке есть обычные вещи. Что ты протянешь тревоге?",
  },
];

/** Вопрос отшельника (после карточной сцены — см. main) */
export const HERMIT_DEFEAT_OR_UNDERSTAND_PROMPT =
  "Ты здесь, чтобы победить? Или чтобы понять?";

export const HERMIT_DEFEAT_OR_UNDERSTAND_OPTIONS: StoryChoiceOption[] = [
  {
    id: "hermit_defeat",
    label: "Победить. Хочу, чтобы это закончилось.",
    acceptanceDelta: 0,
    absorptionDelta: 1,
    nextSceneId: "hermit_defeat",
  },
  {
    id: "hermit_understand",
    label: "Понять. Хочу узнать, что это такое.",
    acceptanceDelta: 1,
    absorptionDelta: 0,
    nextSceneId: "hermit_understand",
  },
  {
    id: "hermit_neutral",
    label: "Не знаю. Просто иду.",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "hermit_neutral",
  },
];

export const HERMIT_REACTION_THEN_OUTRO: Record<string, DialogLine[]> = {
  hermit_defeat: [
    {
      speaker: HERMIT_NAME,
      text: "Многие хотят. Редко кто доходит.",
    },
  ],
  hermit_understand: [
    {
      speaker: HERMIT_NAME,
      text: "Это уже начало. Иди.",
    },
  ],
  hermit_neutral: [
    {
      speaker: HERMIT_NAME,
      text: "Честно. Это тоже путь.",
    },
  ],
};

export const HERMIT_FIRST_OUTRO: DialogLine[] = [
  {
    speaker: HERMIT_NAME,
    text: "Ладно. Иди. Тропа сама покажет.",
  },
];

/** Встреча 1.3 — Вера */
export const VERA_FIRST_INTRO: DialogLine[] = [
  {
    speaker: VERA_NAME,
    text: "А, живая душа. Давно тут никого не было.",
  },
  {
    speaker: VERA_NAME,
    text: "Я когда-то всё тут знала. А теперь — только то, что было в начале. Дальше — как в тумане.",
  },
  {
    speaker: VERA_NAME,
    text: "Может, поможешь старой картографке? Пройдёшь немного — расскажешь, что видишь. Мне для карты. Не сокровища нужны, а… как оно там.",
  },
];

export const VERA_QUEST_PROMPT = "Что отвечаешь Вере?";

export const VERA_QUEST_OPTIONS: StoryChoiceOption[] = [
  {
    id: "vera_accept",
    label: "Хорошо. Я расскажу.",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "vera_accept",
  },
  {
    id: "vera_later",
    label: "Может, потом.",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "vera_later",
  },
];

export const VERA_QUEST_RESOLUTION: Record<string, DialogLine[]> = {
  vera_accept: [
    {
      speaker: VERA_NAME,
      text: "Спасибо. Первое место — мост через ручей. Недалеко. Иди, я подожду.",
    },
  ],
  vera_later: [
    {
      speaker: VERA_NAME,
      text: "Как хочешь. Я буду здесь.",
    },
  ],
};

export const VERA_SHORT_RETURN: DialogLine[] = [
  {
    speaker: VERA_NAME,
    text: "Я всё ещё на камне. Если передумаешь — я здесь.",
  },
];

export const VERA_THANKS_UPDATED_MAP: DialogLine[] = [
  {
    speaker: VERA_NAME,
    text: "Спасибо. Карта дышит чуть ровнее. Иди к соснам, если ещё не был.",
  },
];

export const VERA_AFTER_BRIDGE: DialogLine[] = [
  {
    speaker: VERA_NAME,
    text: "Ну? Как там мост?",
  },
];

export const VERA_BRIDGE_PROMPT = "Как опишешь мост?";

export const VERA_BRIDGE_OPTIONS: StoryChoiceOption[] = [
  {
    id: "bridge_honest",
    label: "Старый, шаткий. Но стоит.",
    acceptanceDelta: 1,
    absorptionDelta: 0,
    nextSceneId: "bridge_honest",
  },
  {
    id: "bridge_pretty_lie",
    label: "Красивый. Крепкий. Надёжный.",
    acceptanceDelta: 0,
    absorptionDelta: 1,
    nextSceneId: "bridge_pretty_lie",
  },
];

export const VERA_BRIDGE_RESOLUTION: Record<string, DialogLine[]> = {
  bridge_honest: [
    {
      speaker: VERA_NAME,
      text: "Так и запишем. Правда — она крепче, чем красивая ложь.",
    },
    {
      speaker: VERA_NAME,
      text: "Дальше будет поляна с тремя соснами. Там, говорят, голоса слышны. Будь осторожен.",
    },
  ],
  bridge_pretty_lie: [
    {
      speaker: VERA_NAME,
      text: "Хорошо. Красивая карта — это важно.",
    },
    {
      speaker: VERA_NAME,
      text: "Дальше будет поляна с тремя соснами. Там, говорят, голоса слышны. Будь осторожен.",
    },
  ],
};

/** Встреча 3.1 — Лин */
export const LIN_FIRST_INTRO: DialogLine[] = [
  {
    speaker: LIN_NAME,
    text: "Я знаю, что оно не оживёт. Но если я перестану поливать — кто я тогда?",
  },
  {
    speaker: "Ты",
    text: "Это дерево посадил кто-то важный для тебя?",
  },
  {
    speaker: LIN_NAME,
    text: "Да. Уже нет. А дерево осталось. И привычка.",
  },
];

export const LIN_CHOICE_PROMPT = "Что скажешь Лину?";

export const LIN_CHOICE_OPTIONS: StoryChoiceOption[] = [
  {
    id: "lin_stop",
    label: "Может, хватит?",
    acceptanceDelta: 0,
    absorptionDelta: 1,
    nextSceneId: "lin_stop",
  },
  {
    id: "lin_accept",
    label: "Делай, что чувствуешь. Я не судья.",
    acceptanceDelta: 1,
    absorptionDelta: 0,
    nextSceneId: "lin_accept",
  },
];

export const LIN_REACTION: Record<string, DialogLine[]> = {
  lin_stop: [
    {
      speaker: LIN_NAME,
      text: "Ты думаешь? Может, ты прав.",
    },
  ],
  lin_accept: [
    {
      speaker: LIN_NAME,
      text: "Спасибо. Не судья — это… редкость.",
    },
  ],
};

export const LIN_OUTRO: DialogLine[] = [
  {
    speaker: LIN_NAME,
    text: "Я подумаю. Приходи ещё, если захочешь.",
  },
];

export const LIN_REPEAT: DialogLine[] = [
  {
    speaker: LIN_NAME,
    text: "Дерево как было. Я как был. Если захочешь поговорить — я здесь.",
  },
];

/** Встреча 4.1 — Ира */
export const IRA_FIRST_INTRO: DialogLine[] = [
  {
    speaker: IRA_NAME,
    text: "Я собираю то, что люди бросают. Эхо остаётся, даже если человек ушёл.",
  },
  {
    speaker: IRA_NAME,
    text: "Ты дерёшься с тем, что внутри. Расскажешь потом? Не для меня — для кувшина. Эхо хранит.",
  },
];

export const IRA_QUEST_PROMPT = "Что ответишь?";

export const IRA_QUEST_OPTIONS: StoryChoiceOption[] = [
  {
    id: "ira_accept",
    label: "Хорошо. Расскажу.",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "ira_accept",
  },
  {
    id: "ira_later",
    label: "Не сейчас.",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "ira_later",
  },
];

export const IRA_QUEST_RESOLUTION: Record<string, DialogLine[]> = {
  ira_accept: [
    {
      speaker: IRA_NAME,
      text: "Приходи после каждого боя. Кувшин всё помнит.",
    },
  ],
  ira_later: [
    {
      speaker: IRA_NAME,
      text: "Как хочешь. Эхо подождёт.",
    },
  ],
};

export const IRA_SHORT_RETURN: DialogLine[] = [
  {
    speaker: IRA_NAME,
    text: "Кувшин всё ещё пуст или нет — зависит от тебя. Я здесь.",
  },
];
