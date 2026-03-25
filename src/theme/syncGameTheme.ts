import type { GameMode } from "../game/types";

export type VisualTheme = "surface" | "anxiety" | "calm" | "finale";

/** Соответствие режима игры палитре из docs/COLOR_SYSTEM.md */
export function modeToVisualTheme(mode: GameMode): VisualTheme {
  switch (mode) {
    case "intro":
    case "choice":
    case "explore":
      return "surface";
    case "battle":
      return "anxiety";
    case "dialog":
    case "card":
    case "practice_view":
      return "calm";
    case "end":
    case "finale":
    case "credits":
      return "finale";
    default:
      return "surface";
  }
}

export function applyVisualTheme(theme: VisualTheme): void {
  document.documentElement.setAttribute("data-game-state", theme);
}

export function syncThemeFromGameMode(mode: GameMode): void {
  applyVisualTheme(modeToVisualTheme(mode));
}
