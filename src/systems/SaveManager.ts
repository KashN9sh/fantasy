import { GameState, GameStateData } from './GameState';

const SAVE_KEY = 'quiet-path-save';

export const SaveManager = {
  save(): void {
    try {
      const data = JSON.stringify(GameState.get());
      localStorage.setItem(SAVE_KEY, data);
    } catch {
      // localStorage may be unavailable
    }
  },

  load(): boolean {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data: GameStateData = JSON.parse(raw);
      Object.assign(GameState.get(), data);
      return true;
    } catch {
      return false;
    }
  },

  hasSave(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  },

  deleteSave(): void {
    localStorage.removeItem(SAVE_KEY);
  },
};
