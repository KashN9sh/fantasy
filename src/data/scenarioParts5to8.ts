/**
 * Сцены [SCENARIO.md](docs/SCENARIO.md) — части 5–8 (балка, сумерки, перекрёсток, привал).
 */
import type { DialogLine, GameState, StoryChoiceOption } from "../game/types";

export type StoryNpcKind =
  | "hermit_ravine"
  | "lin_dusk_second"
  | "vera_cross_second"
  | "ira_cross_second"
  | "vera_camp_final"
  | "lin_camp_final"
  | "ira_camp_final"
  | "hermit_camp_third"
  | "figure_camp";

export const HERMIT_NAME = "Отшельник у тропы";
export const VERA_NAME = "Вера";
export const LIN_NAME = "Лин";
export const IRA_NAME = "Ира";

/** Ч.5.1 — отшельник в балке */
export const HERMIT_RAVINE_INTRO: DialogLine[] = [
  { speaker: HERMIT_NAME, text: "Опять встретились. Значит, ты всё ещё идёшь." },
];

export const HERMIT_RAVINE_QUESTION = "Что ты чувствуешь к тому, кем был в начале?";

export const HERMIT_RAVINE_OPTIONS: StoryChoiceOption[] = [
  {
    id: "ravine_shame",
    label: "Стыд. Был слабым.",
    acceptanceDelta: 0,
    absorptionDelta: 1,
    nextSceneId: "ravine_shame",
  },
  {
    id: "ravine_warm",
    label: "Тепло. Тот, кто был в начале, решился пойти.",
    acceptanceDelta: 1,
    absorptionDelta: 0,
    nextSceneId: "ravine_warm",
  },
  {
    id: "ravine_idk",
    label: "Не знаю. Я — это я.",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "ravine_idk",
  },
];

export const HERMIT_RAVINE_REACTION: Record<string, DialogLine[]> = {
  ravine_shame: [{ speaker: HERMIT_NAME, text: "Стыд тоже дорога. Только не застревай в ней." }],
  ravine_warm: [{ speaker: HERMIT_NAME, text: "Тепло — редкость. Береги её." }],
  ravine_idk: [{ speaker: HERMIT_NAME, text: "Честный ответ. Так и живут." }],
};

export const HERMIT_RAVINE_OUTRO: DialogLine[] = [
  { speaker: HERMIT_NAME, text: "Хорошо. Иди. Скоро будет темнеть." },
];

/** Ч.6.1 — Лин во второй раз */
export const LIN_DUSK_INTRO: DialogLine[] = [
  {
    speaker: LIN_NAME,
    text: "Я перестал поливать. Как ты сказал… ну, не ты сказал, я сам решил. Но теперь не знаю, что делать. Стою и смотрю.",
  },
];

export const LIN_DUSK_PROMPT = "Что ответишь?";

export const LIN_DUSK_OPTIONS: StoryChoiceOption[] = [
  {
    id: "lin_new",
    label: "Посади что-то новое.",
    acceptanceDelta: 1,
    absorptionDelta: 0,
    nextSceneId: "lin_new",
  },
  {
    id: "lin_flowers",
    label: "Скорбеть тоже важно. Оставь как есть, посади цветы у корней.",
    acceptanceDelta: 1,
    absorptionDelta: 0,
    nextSceneId: "lin_flowers",
  },
  {
    id: "lin_neutral",
    label: "Я не знаю. Это твоё дерево.",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "lin_neutral",
  },
  {
    id: "lin_push",
    label: "Может, хватит смотреть? Идём.",
    acceptanceDelta: 0,
    absorptionDelta: 1,
    nextSceneId: "lin_push",
  },
];

export const LIN_DUSK_RESOLUTION: Record<string, DialogLine[]> = {
  lin_new: [{ speaker: LIN_NAME, text: "Новое… страшно. Но может, пора." }],
  lin_flowers: [{ speaker: LIN_NAME, text: "Не убирать, а… помнить. Да. Это можно." }],
  lin_neutral: [{ speaker: LIN_NAME, text: "Понятно. Я сам как-нибудь." }],
  lin_push: [{ speaker: LIN_NAME, text: "…" }],
};

export const LIN_DUSK_OUTRO: DialogLine[] = [
  { speaker: LIN_NAME, text: "Я подумаю. Приходи ещё, если успеешь до темноты." },
];

/** Ч.7.1 — Вера, если лгали о мосту */
export const VERA_CROSS_INTRO: DialogLine[] = [
  {
    speaker: VERA_NAME,
    text: "Я пыталась идти по твоим описаниям. Но карта… она ведёт не туда. Ты сказал, что мост крепкий. А он гнилой. Я чуть не упала.",
  },
  { speaker: VERA_NAME, text: "Зачем ты сказал неправду?" },
];

export const VERA_CROSS_PROMPT = "Что ответишь?";

export const VERA_CROSS_OPTIONS: StoryChoiceOption[] = [
  {
    id: "vera_excuse_soft",
    label: "Хотел тебя не расстраивать.",
    acceptanceDelta: 0,
    absorptionDelta: 1,
    nextSceneId: "vera_excuse_soft",
  },
  {
    id: "vera_excuse_fear",
    label: "Боялся, что ты не поймёшь правду.",
    acceptanceDelta: 0,
    absorptionDelta: 1,
    nextSceneId: "vera_excuse_fear",
  },
  {
    id: "vera_apology",
    label: "Прости. Я ошибся. Правда такая: мост старый, но он есть.",
    acceptanceDelta: 1,
    absorptionDelta: 0,
    nextSceneId: "vera_apology",
  },
];

export const VERA_CROSS_REACTION: Record<string, DialogLine[]> = {
  vera_excuse_soft: [{ speaker: VERA_NAME, text: "…Ладно. Но в следующий раз — правда. Иначе я снова упрусь в пустоту." }],
  vera_excuse_fear: [{ speaker: VERA_NAME, text: "Понимаю. Но я не хрупкая стеклянная. Скажи как есть." }],
  vera_apology: [{ speaker: VERA_NAME, text: "Спасибо. Так я могу доверять линиям." }],
};

export const VERA_CROSS_OUTRO: DialogLine[] = [
  {
    speaker: VERA_NAME,
    text: "Дальше — последняя точка. Там, где тропа раздваивается. Расскажешь — и карта будет готова.",
  },
];

/** Ч.7.2 — Ира на перекрёстке (упрощённо) */
export const IRA_CROSS_INTRO: DialogLine[] = [
  {
    speaker: IRA_NAME,
    text: "Ты не приходил рассказывать. Я не тороплю. Но эхо затихает, если его не ловить.",
  },
  {
    speaker: IRA_NAME,
    text: "Расскажи хоть одно — как звучал твой первый враг: шумом или ветром?",
  },
];

export const IRA_CROSS_PROMPT = "Как звучал гул?";

export const IRA_CROSS_OPTIONS: StoryChoiceOption[] = [
  {
    id: "ira_noise",
    label: "Шумом. Противным, липким.",
    acceptanceDelta: 0,
    absorptionDelta: 1,
    nextSceneId: "ira_noise",
  },
  {
    id: "ira_wind",
    label: "Ветром. Просто ветром.",
    acceptanceDelta: 1,
    absorptionDelta: 0,
    nextSceneId: "ira_wind",
  },
];

export const IRA_CROSS_OUTRO: DialogLine[] = [
  { speaker: IRA_NAME, text: "Эхо хранит. Придёшь ещё — я буду здесь." },
];

/** Ч.8.1 — Вера, финал карты */
export const VERA_CAMP_INTRO: DialogLine[] = [
  {
    speaker: VERA_NAME,
    text: "Последняя точка. Две дороги. Куда ведёт каждая — не знаю. Ты выберешь сам. А я нарисую ту, которую опишешь.",
  },
];

export const VERA_CAMP_PROMPT = "Какую тропу опишешь?";

export const VERA_CAMP_OPTIONS: StoryChoiceOption[] = [
  {
    id: "path_left",
    label: "Левая — узкая, уходит в темноту.",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "path_left",
  },
  {
    id: "path_right",
    label: "Правая — широкая, светлая.",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "path_right",
  },
];

export const VERA_CAMP_HONESTY_PROMPT = "Ты описал(а) так, как есть?";

export const VERA_CAMP_HONESTY_OPTIONS: StoryChoiceOption[] = [
  {
    id: "camp_truth",
    label: "Да. Как вижу.",
    acceptanceDelta: 1,
    absorptionDelta: 0,
    nextSceneId: "camp_truth",
  },
  {
    id: "camp_soft_lie",
    label: "Смягчил(а), чтобы не пугать.",
    acceptanceDelta: 0,
    absorptionDelta: 1,
    nextSceneId: "camp_soft_lie",
  },
];

export const VERA_CAMP_RESOLUTION_HONEST: DialogLine[] = [
  { speaker: VERA_NAME, text: "Теперь я снова её вижу. Спасибо." },
  {
    speaker: VERA_NAME,
    text: "Пойду. Может, встретимся ещё. А может, нет. Тропа большая.",
  },
];

export const VERA_CAMP_RESOLUTION_LIE: DialogLine[] = [
  { speaker: VERA_NAME, text: "Хорошо… Хотя линии снова плывут. Буду перерисовывать." },
  {
    speaker: VERA_NAME,
    text: "Пойду. Может, вернусь к камню. Тропа большая.",
  },
];

/** Ч.8.2 — Лин на привале */
export const LIN_CAMP_NEW: DialogLine[] = [
  {
    speaker: LIN_NAME,
    text: "Дерево спилено. На его месте — маленький саженец. Я не заменил старое. Просто разрешил себе новое. Спасибо, что пришёл.",
  },
];

export const LIN_CAMP_FLOWERS: DialogLine[] = [
  {
    speaker: LIN_NAME,
    text: "Ствол остался, сухие ветви обрезаны. У корней — цветы. Теперь это место памяти. Не больно, а тепло. Спасибо.",
  },
];

export const LIN_CAMP_NEUTRAL: DialogLine[] = [
  { speaker: LIN_NAME, text: "Я ещё думаю. Но рад, что ты зашёл." },
];

export const LIN_CAMP_GONE: DialogLine[] = [
  {
    speaker: "Поляна",
    text: "Пусто. Только сухое дерево и старая лейка на земле. Лина нет.",
  },
];

/** Ч.8.3 — Ира финал */
export const IRA_CAMP_FULL: DialogLine[] = [
  {
    speaker: IRA_NAME,
    text: "Спасибо. Теперь это не только твоё. Оно будет жить здесь, в эхе. Когда захочешь вспомнить — ручей всё помнит.",
  },
];

export const IRA_CAMP_HALF: DialogLine[] = [
  {
    speaker: IRA_NAME,
    text: "Может, в следующий раз. Твои истории — они твои. Я не забираю то, что не готовы отдать.",
  },
];

/** Ч.8.4 — отшельник третий */
export const HERMIT_CAMP_INTRO: DialogLine[] = [
  { speaker: HERMIT_NAME, text: "Ты почти дошёл. Я не скажу, что там. Но спрошу: зачем тебе это?" },
];

export const HERMIT_CAMP_QUESTION = "Чего ты боишься больше?";

export const HERMIT_CAMP_OPTIONS: StoryChoiceOption[] = [
  {
    id: "fear_with",
    label: "Остаться с тревогой. Она меня съедает.",
    acceptanceDelta: 0,
    absorptionDelta: 1,
    nextSceneId: "fear_with",
  },
  {
    id: "fear_without",
    label: "Остаться без неё. Кто я тогда?",
    acceptanceDelta: 1,
    absorptionDelta: 0,
    nextSceneId: "fear_without",
  },
  {
    id: "fear_idk",
    label: "Не знаю. Ещё не решил.",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "fear_idk",
  },
];

export const HERMIT_CAMP_REACTION: Record<string, DialogLine[]> = {
  fear_with: [{ speaker: HERMIT_NAME, text: "Тогда ты уже несёшь её с собой. Вопрос — куда." }],
  fear_without: [{ speaker: HERMIT_NAME, text: "Пустота пугает. Но в ней тоже можно дышать." }],
  fear_idk: [{ speaker: HERMIT_NAME, text: "Нормально. Корень не сгорит, пока ты думаешь." }],
};

export const HERMIT_CAMP_OUTRO: DialogLine[] = [
  { speaker: HERMIT_NAME, text: "Иди. Там — твой ответ. Не мой." },
];

/** Ч.8.5 — Фигура */
export const FIGURE_INTRO: DialogLine[] = [
  { speaker: "Фигура", text: "Вдали, на границе тумана, кто-то стоит спиной. Не двигается." },
];

export const FIGURE_PROMPT = "Что сделаешь?";

export const FIGURE_OPTIONS: StoryChoiceOption[] = [
  {
    id: "fig_who",
    label: "Кто ты?",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "fig_who",
  },
  {
    id: "fig_closer",
    label: "Подойти ближе.",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "fig_closer",
  },
  {
    id: "fig_pass",
    label: "Пройти мимо.",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "fig_pass",
  },
];

export const FIGURE_RESOLUTION: Record<string, DialogLine[]> = {
  fig_who: [
    {
      speaker: "Фигура",
      text: "Тот, кто не смог. Тот, кто смог. Это одно и то же.",
    },
  ],
  fig_closer: [{ speaker: "Тропа", text: "Фигура тает. Остаётся только след на земле." }],
  fig_pass: [{ speaker: "Тропа", text: "Ты идёшь дальше. Кажется, кто-то смотрит вслед." }],
};

/** Перед Корнем — развилка (SCENARIO перед ч.9) */
export const LAST_CAMP_FORK_PROMPT =
  "Ты можешь повернуть назад. Никто не осудит. Ты можешь выбрать любую тропу. Или просто стоять. Время здесь не торопится.";

export const LAST_CAMP_FORK_OPTIONS: StoryChoiceOption[] = [
  {
    id: "fork_left",
    label: "Иду налево.",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "fork_left",
  },
  {
    id: "fork_right",
    label: "Иду направо.",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "fork_right",
  },
  {
    id: "fork_back",
    label: "Возвращаюсь. Не сейчас.",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "fork_back",
  },
  {
    id: "fork_stand",
    label: "Стою. Ещё минуту.",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "fork_stand",
  },
];

export function isStoryNpcVisible(state: GameState, kind: StoryNpcKind): boolean {
  const f = state.flags;
  switch (kind) {
    case "hermit_ravine":
      return !f.hermitSecondMeetingDone;
    case "lin_dusk_second":
      return f.linFirstMeetingDone && !f.linSecondMeetingDone;
    case "vera_cross_second":
      return f.veraBridgeWasPrettyLie && f.veraBridgeReported && !f.veraSecondMeetingDone;
    case "ira_cross_second":
      return f.iraQuestActive && !f.iraCrossroadsDone && state.defeatedEnemyIds.length >= 1;
    case "vera_camp_final":
      return f.veraBridgeReported && !f.veraLastCampDone;
    case "lin_camp_final":
      return Boolean(f.linSecondMeetingDone && f.linFinaleChoice && !f.linLastCampDone);
    case "ira_camp_final":
      return f.iraQuestActive && !f.iraLastCampDone;
    case "hermit_camp_third":
      return f.hermitSecondMeetingDone && !f.hermitThirdMeetingDone;
    case "figure_camp":
      return (
        !f.metFigure &&
        (state.acceptance >= 6 ||
          state.absorption >= 6 ||
          (f.veraHasSpoken && f.linFirstMeetingDone && f.iraHasSpoken))
      );
    default:
      return false;
  }
}
