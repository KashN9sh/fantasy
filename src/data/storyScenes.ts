import type { DialogLine, StoryChoiceOption } from "../game/types";

/** Экраны чёрного пролога (сцена 0, SCENARIO) */
export const INTRO_SCREENS: { text: string }[] = [
  {
    text: "Внутри — привычный гул. Ты уже знаешь, как обычно отвечаешь на него.",
  },
  {
    text: "Сегодня ты идёшь. Не знаешь зачем. Просто — идёшь.",
  },
];

/** Развилка на опушке — событие 1.1 */
export const CHOICE_FORK_CLEARING: {
  id: string;
  prompt: string;
  options: StoryChoiceOption[];
} = {
  id: "fork_clearing",
  prompt: "Перед тобой развилка. Одна тропа уходит в лес, другая петляет вдоль опушки.",
  options: [
    {
      id: "into_forest",
      label: "Пойду через лес. Посмотрю, что там.",
      acceptanceDelta: 1,
      absorptionDelta: 0,
      nextSceneId: "after_fork_forest",
    },
    {
      id: "along_edge",
      label: "Пойду по опушке. Так спокойнее.",
      acceptanceDelta: 0,
      absorptionDelta: 1,
      nextSceneId: "after_fork_edge",
    },
  ],
};

/** Короткие последствия выбора (нарратив) */
export const AFTER_FORK_LINES: Record<string, DialogLine[]> = {
  after_fork_forest: [
    {
      speaker: "Тропа",
      text: "Ветви смыкаются над головой. Света меньше — шаг за шагом лес принимает тебя.",
    },
  ],
  after_fork_edge: [
    {
      speaker: "Тропа",
      text: "Трава мягкая, тропа ровная. Вдоль опушки чуть легче дышать.",
    },
  ],
};

