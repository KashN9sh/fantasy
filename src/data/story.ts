import type { DialogLine, GameFlags } from "../game/types";

export const HERMIT_NAME = "Отшельник у тропы";

export function getHermitDialog(flags: GameFlags): {
  lines: DialogLine[];
  openCardAfter: boolean;
  openEndAfter: boolean;
} {
  if (!flags.metHermitClearing) {
    return {
      lines: [],
      openCardAfter: false,
      openEndAfter: false,
    };
  }

  if (flags.soothed && !flags.sawEnding) {
    return {
      lines: [
        {
          speaker: HERMIT_NAME,
          text: "Вот так… тише. Спасибо. Тропа снова дышит, как раньше.",
        },
        {
          speaker: HERMIT_NAME,
          text: "Иди с миром. И помни: большие истории начинаются с маленького шага и чашки тёплого чая.",
        },
      ],
      openCardAfter: false,
      openEndAfter: true,
    };
  }

  return {
    lines: [
      {
        speaker: HERMIT_NAME,
        text: "Садись, если устал. Здесь всегда есть место для отдыха.",
      },
    ],
    openCardAfter: false,
    openEndAfter: false,
  };
}

export function resolveCardPick(element: string): { success: boolean; text: string } {
  if (element === "noise") {
    return {
      success: false,
      text: "Звук оказывается слишком резким — тревога только вздрагивает. Попробуй что-нибудь потише.",
    };
  }
  if (element === "calm" || element === "light" || element === "ward") {
    return {
      success: true,
      text: "Тревога отступает. В груди становится свободнее — можно снова слышать птиц.",
    };
  }
  return {
    success: false,
    text: "Ничего не происходит. Может, другой выбор?",
  };
}
