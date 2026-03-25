/**
 * [SCENARIO.md](docs/SCENARIO.md) — часть 9 «Корень»: фазы 1–3, отшельник перед титрами.
 */
import type { DialogLine, LinFinaleChoice, StoryChoiceOption } from "../game/types";
import type { FinaleTrack } from "../game/finaleTrack";

export const ROOT_SPEAKER = "Корень";
export const HERMIT_NAME = "Отшельник у тропы";

/** Вступление локации по треку */
export const ROOT_LOCATION_INTRO: Record<FinaleTrack, DialogLine[]> = {
  acceptance: [
    {
      speaker: "Место",
      text: "Тёплый свет, янтарный. Будто комната с окнами в лес — или поляна, где всё уже знакомо.",
    },
  ],
  absorption: [
    {
      speaker: "Место",
      text: "Коридор из теней и зеркал. Пустота, в которой шепчут чужие голоса. Холодно.",
    },
  ],
  neutral: [
    {
      speaker: "Место",
      text: "Развилка. Обе тропы уходят в туман — ни тепло, ни ледяно.",
    },
  ],
};

export const ROOT_ASSEMBLY_HERMIT: DialogLine[] = [
  {
    speaker: HERMIT_NAME,
    text: "Сидит в центре. «Все здесь. Кроме одного. Того, кто решает.»",
  },
];

export const ROOT_ASSEMBLY_VERA_GOOD: DialogLine[] = [
  {
    speaker: "Вера",
    text: "Стоит у воображаемой карты. «Я здесь. Карта готова. Куда идти — решать тебе. Но теперь ты знаешь дорогу.»",
  },
];

export const ROOT_ASSEMBLY_VERA_BAD: DialogLine[] = [
  {
    speaker: "Вера",
    text: "«Я… не могу помочь. Моя карта врёт. Прости.» Она отворачивается.",
  },
];

export const ROOT_ASSEMBLY_LIN: Record<LinFinaleChoice, DialogLine[]> = {
  new: [
    {
      speaker: "Лин",
      text: "У живого саженца. «Оно здесь. Твоё, моё — теперь общее. Дышит.»",
    },
  ],
  flowers: [
    {
      speaker: "Лин",
      text: "У сухого ствола с цветами у корней. «Я здесь. Не один. Ты тоже не один.»",
    },
  ],
  neutral: [
    {
      speaker: "Лин",
      text: "«Оно здесь. Твоё, моё — теперь общее.»",
    },
  ],
  gone: [{ speaker: "Лин", text: "…" }],
};

export const ROOT_ASSEMBLY_IRA: DialogLine[] = [
  {
    speaker: "Ира",
    text: "С кувшином. «Я всё помню. Твой шум, твой голос, твою тень.»",
  },
];

export const ROOT_ASSEMBLY_FIGURE: DialogLine[] = [
  {
    speaker: "Фигура",
    text: "Вдалеке. Не приближается. Но ты знаешь — она здесь.",
  },
];

/** Вариант А — начало столкновения */
export const ROOT_ACCEPTANCE_OPEN: DialogLine[] = [
  {
    speaker: ROOT_SPEAKER,
    text: "Говорит не голосом — смыслом. «Ты пришёл. Я ждал. Не чтобы драться — чтобы ты посмотрел.»",
  },
];

export const ROOT_ACCEPTANCE_Q1 = "Чего ты боялся больше всего?";
export const ROOT_ACCEPTANCE_Q2 = "Что ты чувствуешь сейчас?";
export const ROOT_ACCEPTANCE_Q3 = "Что теперь?";

/** Подписи выбора: к кому прислушаться (id = nextSceneId) */
export function rootAcceptanceCircle1Options(): StoryChoiceOption[] {
  return [
    {
      id: "listen_vera_c1",
      label: "Вера: «Заблудиться. Но я нашёл дорогу.»",
      acceptanceDelta: 0,
      absorptionDelta: 0,
      nextSceneId: "listen_vera_c1",
    },
    {
      id: "listen_lin_c1",
      label: "Лин: «Потерять себя. Но я вырос.»",
      acceptanceDelta: 0,
      absorptionDelta: 0,
      nextSceneId: "listen_lin_c1",
    },
    {
      id: "listen_ira_c1",
      label: "Ира: «Забыть. Но эхо осталось.»",
      acceptanceDelta: 0,
      absorptionDelta: 0,
      nextSceneId: "listen_ira_c1",
    },
    {
      id: "listen_hermit_c1",
      label: "Отшельник: «Не знать ответа. Но я здесь.»",
      acceptanceDelta: 0,
      absorptionDelta: 0,
      nextSceneId: "listen_hermit_c1",
    },
  ];
}

export function rootAcceptanceCircle2Options(): StoryChoiceOption[] {
  return [
    {
      id: "listen_vera_c2",
      label: "Вера: «Смотрю на карту. Впервые — не боюсь.»",
      acceptanceDelta: 0,
      absorptionDelta: 0,
      nextSceneId: "listen_vera_c2",
    },
    {
      id: "listen_lin_c2",
      label: "Лин: «Стою. Не бегу. Не поливаю. Просто — стою.»",
      acceptanceDelta: 0,
      absorptionDelta: 0,
      nextSceneId: "listen_lin_c2",
    },
    {
      id: "listen_ira_c2",
      label: "Ира: «Слушаю. Вода течёт. Эхо есть.»",
      acceptanceDelta: 0,
      absorptionDelta: 0,
      nextSceneId: "listen_ira_c2",
    },
    {
      id: "listen_hermit_c2",
      label: "Отшельник: «Дышу. Этого достаточно.»",
      acceptanceDelta: 0,
      absorptionDelta: 0,
      nextSceneId: "listen_hermit_c2",
    },
  ];
}

export function rootAcceptanceCircle3Options(): StoryChoiceOption[] {
  return [
    {
      id: "listen_vera_c3",
      label: "Вера: «Идти. Дорога есть.»",
      acceptanceDelta: 0,
      absorptionDelta: 0,
      nextSceneId: "listen_vera_c3",
    },
    {
      id: "listen_lin_c3",
      label: "Лин: «Растить. Медленно.»",
      acceptanceDelta: 0,
      absorptionDelta: 0,
      nextSceneId: "listen_lin_c3",
    },
    {
      id: "listen_ira_c3",
      label: "Ира: «Помнить. Не застревать.»",
      acceptanceDelta: 0,
      absorptionDelta: 0,
      nextSceneId: "listen_ira_c3",
    },
    {
      id: "listen_hermit_c3",
      label: "Отшельник: «Выбирать. Каждый день.»",
      acceptanceDelta: 0,
      absorptionDelta: 0,
      nextSceneId: "listen_hermit_c3",
    },
  ];
}

export const ROOT_ACCEPTANCE_ECHO: DialogLine[] = [
  { speaker: ROOT_SPEAKER, text: "Тишина принимает твой ответ — как воду." },
];

/** Вариант Б — бой */
export const ROOT_ABSORPTION_OPEN: DialogLine[] = [
  {
    speaker: ROOT_SPEAKER,
    text: "Корень встаёт. У него твоё лицо. Твои опоры. Твой шум. «Ты хотел победить? Попробуй.»",
  },
];

/** Вариант В — развилка */
export const ROOT_NEUTRAL_FORK_OPEN: DialogLine[] = [
  {
    speaker: ROOT_SPEAKER,
    text: "Перед тобой две тропы. Одна ведёт в темноту, другая — в свет. Ты не знаешь, что там.",
  },
];

export const ROOT_NEUTRAL_ADVICE_VERA: DialogLine[] = [
  {
    speaker: "Вера",
    text: "«Я нарисовала обе. Выбирай любую. Карта не врёт, если ты честен.»",
  },
];

export const ROOT_NEUTRAL_ADVICE_LIN: DialogLine[] = [
  {
    speaker: "Лин",
    text: "«Я выбирал новое. Но иногда старое — тоже выбор.»",
  },
];

export const ROOT_NEUTRAL_ADVICE_IRA: DialogLine[] = [
  {
    speaker: "Ира",
    text: "«Эхо не подскажет. Это только твой шаг.»",
  },
];

export const ROOT_NEUTRAL_ADVICE_HERMIT: DialogLine[] = [
  {
    speaker: HERMIT_NAME,
    text: "«Я не скажу, куда идти. Спрошу: что ты чувствуешь?»",
  },
];

export const ROOT_NEUTRAL_FORK_PROMPT = "Куда шагнёшь?";

export const ROOT_NEUTRAL_FORK_OPTIONS: StoryChoiceOption[] = [
  {
    id: "nf_light",
    label: "Иду в свет.",
    acceptanceDelta: 1,
    absorptionDelta: 0,
    nextSceneId: "nf_light",
  },
  {
    id: "nf_dark",
    label: "Иду в темноту.",
    acceptanceDelta: 0,
    absorptionDelta: 1,
    nextSceneId: "nf_dark",
  },
  {
    id: "nf_back",
    label: "Возвращаюсь.",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "nf_back",
  },
];

/** Фаза 3 — финал принятия */
export const ROOT_RESOLUTION_ACCEPTANCE_MAIN: DialogLine[] = [
  {
    speaker: ROOT_SPEAKER,
    text: "«Ты стоял перед тем, от чего бежал. Оказалось — это не враг. Это просто место, куда ты давно не заходил. Теперь ты знаешь, как сюда вернуться. Или не возвращаться. Выбор остаётся с тобой.»",
  },
];

/** Фаза 3 — финал поглощения */
export const ROOT_RESOLUTION_ABSORPTION_MAIN: DialogLine[] = [
  {
    speaker: ROOT_SPEAKER,
    text: "«Ты больше не слышишь себя. Только тишину. Ты победил тревогу. Но вместе с ней — часть себя. Кто-то другой пройдёт здесь завтра. Может быть, найдёт то, что ты потерял. А может быть, нет.»",
  },
];

/** Фаза 3 — нейтральный */
export const ROOT_RESOLUTION_NEUTRAL_MAIN: DialogLine[] = [
  {
    speaker: "Тропа",
    text: "«Ты решил, что сегодня — всё. Не сейчас. Может быть, когда-нибудь потом. Ты сворачиваешь с тропы и выходишь к знакомой двери. Шум всё ещё здесь. Но ты научился с ним жить. По крайней мере, сегодня.»",
  },
];

export const ROOT_EPILOG_ACCEPTANCE_VERA: DialogLine[] = [
  { speaker: "Эпилог", text: "Вера идёт по тропе с картой. Оборачивается, машет." },
];

export const ROOT_EPILOG_ACCEPTANCE_LIN: DialogLine[] = [
  { speaker: "Эпилог", text: "Лин сидит у живого дерева. Поливает саженец." },
];

export const ROOT_EPILOG_ACCEPTANCE_IRA: DialogLine[] = [
  { speaker: "Эпилог", text: "Ира стоит у ручья. Кувшин полон. Улыбается воде." },
];

export const ROOT_EPILOG_ACCEPTANCE_HERMIT: DialogLine[] = [
  { speaker: "Эпилог", text: "Отшельник сидит на камне. Смотрит на тропу. Ждёт следующего." },
];

export const ROOT_EPILOG_ACCEPTANCE_FIGURE: DialogLine[] = [
  { speaker: "Эпилог", text: "На тропе — след. Рядом второй. Твой." },
];

export const ROOT_EPILOG_ABSORPTION_VERA: DialogLine[] = [
  { speaker: "Эпилог", text: "Вера с картой не знает, куда идти. Карта чистая." },
];

export const ROOT_EPILOG_ABSORPTION_LIN: DialogLine[] = [
  { speaker: "Эпилог", text: "Дерево засохло. Лина нет. Осталась только лейка." },
];

export const ROOT_EPILOG_ABSORPTION_IRA: DialogLine[] = [
  { speaker: "Эпилог", text: "Кувшин разбит. Взгляд в пустоту." },
];

export const ROOT_EPILOG_ABSORPTION_HERMIT: DialogLine[] = [
  {
    speaker: HERMIT_NAME,
    text: "«Ты победил. Я не знаю, радоваться или нет.»",
  },
];

export const ROOT_EPILOG_ABSORPTION_FIGURE: DialogLine[] = [
  { speaker: "Эпилог", text: "Фигура стоит спиной. Уходит в туман." },
];

export const ROOT_EPILOG_NEUTRAL_CLOSING: DialogLine[] = [
  {
    speaker: "Эпилог",
    text: "Каждый остаётся на своих местах. Мир почти не изменился. Кроме тебя — чуть-чуть.",
  },
];

/** Отшельник четвёртый раз — перед титрами */
export const ROOT_HERMIT_FOURTH_INTRO: DialogLine[] = [
  {
    speaker: HERMIT_NAME,
    text: "Сидит на своём камне. Смотрит на тропу. Не на тебя — вдаль.",
  },
  {
    speaker: HERMIT_NAME,
    text: "«Если бы ты мог сказать что-то тому, кто только входит на тропу — что бы это было?»",
  },
];

export const ROOT_HERMIT_FOURTH_PROMPT = "Что передашь следующему?";

export const ROOT_HERMIT_FOURTH_OPTIONS: StoryChoiceOption[] = [
  {
    id: "pass_breathe",
    label: "«Дыши. Один шаг — уже достаточно.»",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "pass_breathe",
  },
  {
    id: "pass_listen",
    label: "«Послушай, что шумит. Не обязательно чинить сразу.»",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "pass_listen",
  },
  {
    id: "pass_notion",
    label: "«Ты не обязан быть храбрым. Только честным с собой.»",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "pass_notion",
  },
  {
    id: "pass_silence",
    label: "«Молчание — тоже ответ.»",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "pass_silence",
  },
];

export const ROOT_HERMIT_FOURTH_OUTRO: DialogLine[] = [
  { speaker: HERMIT_NAME, text: "«Передам. Если встречу.»" },
];
