export type GameMode = "explore" | "dialog" | "card" | "battle" | "end";

export interface DialogLine {
  speaker: string;
  text: string;
}

export interface GameFlags {
  soothed: boolean;
  sawEnding: boolean;
}

export interface AfterDialog {
  openCard: boolean;
  openEnd: boolean;
}

export interface GameState {
  mode: GameMode;
  flags: GameFlags;
  playerTileX: number;
  playerTileY: number;
  pendingAfterDialog: AfterDialog | null;
}

export function createInitialState(): GameState {
  return {
    mode: "explore",
    flags: { soothed: false, sawEnding: false },
    playerTileX: 10,
    playerTileY: 11,
    pendingAfterDialog: null,
  };
}
