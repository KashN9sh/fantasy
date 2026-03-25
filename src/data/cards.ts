export type CardElement = "calm" | "light" | "ward" | "noise";

export interface CardDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  element: CardElement;
}

/** Ранние тихие жесты для сцены у отшельника; noise — намеренный промах */
export const CARDS: CardDef[] = [
  {
    id: "tea",
    name: "Тёплый чай",
    desc: "Пар поднимается медленно, как дыхание.",
    icon: "🫖",
    element: "calm",
  },
  {
    id: "lantern",
    name: "Фонарь",
    desc: "Мягкий круг света на тропе.",
    icon: "🏮",
    element: "light",
  },
  {
    id: "cloak",
    name: "Плащ от ветра",
    desc: "Тихая защита от холода.",
    icon: "🧥",
    element: "ward",
  },
  {
    id: "bell",
    name: "Колокольчик",
    desc: "Звонок слышен далеко — может, слишком далеко.",
    icon: "🔔",
    element: "noise",
  },
  {
    id: "star",
    name: "Упавшая звезда",
    desc: "На миг всё кажется возможным.",
    icon: "✨",
    element: "light",
  },
];

export const HAND_CARD_IDS = ["tea", "lantern", "cloak", "bell", "star"] as const;

export function getCardsByIds(ids: readonly string[]): CardDef[] {
  const map = new Map(CARDS.map((c) => [c.id, c]));
  return ids.map((id) => map.get(id)).filter((c): c is CardDef => c != null);
}
