/**
 * Цвета тайлов и фигур на канвасе — в той же гамме, что «На поверхности» / «Шум» в docs/COLOR_SYSTEM.md.
 */
export const surfaceWorld = {
  water: "#8AB3B3",
  grass: "#8A9A6E",
  path: "#AA9A8A",
  tree: "#5A6548",
  gridLine: "rgba(47, 62, 70, 0.12)",
  player: "#2D3E5A",
  playerFace: "#D4DDE8",
  npcBody: "#C49A6E",
  npcHair: "#5A4A3A",
  /** «Тень» у тренера — холоднее, ближе к тревоге */
  trainerBody: "#4A5B6E",
  trainerAccent: "#B76E6E",
  hintBg: "rgba(47, 62, 70, 0.55)",
  hintText: "#EADBC6",
} as const;
