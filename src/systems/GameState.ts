export interface GameStateData {
  acceptance: number;
  care: number;
  selfKnowledge: number;
  trust: number;
  currentLevel: string;
  flags: Record<string, boolean>;
  diaryEntries: DiaryEntry[];
  inventory: string[];
  questStates: Record<string, QuestState>;
}

export interface DiaryEntry {
  id: string;
  title: string;
  text: string;
  timestamp: number;
}

export type QuestState = 'unknown' | 'active' | 'completed';

function createDefault(): GameStateData {
  return {
    acceptance: 0,
    care: 0,
    selfKnowledge: 0,
    trust: 0,
    currentLevel: 'threshold',
    flags: {},
    diaryEntries: [],
    inventory: [],
    questStates: {},
  };
}

let state: GameStateData = createDefault();

export const GameState = {
  get(): GameStateData {
    return state;
  },

  reset(): void {
    state = createDefault();
  },

  setFlag(key: string, value = true): void {
    state.flags[key] = value;
  },

  hasFlag(key: string): boolean {
    return state.flags[key] === true;
  },

  adjust(param: 'acceptance' | 'care' | 'selfKnowledge' | 'trust', delta: number): void {
    state[param] = Math.max(0, Math.min(100, state[param] + delta));
  },

  addDiaryEntry(entry: Omit<DiaryEntry, 'timestamp'>): void {
    if (state.diaryEntries.some(e => e.id === entry.id)) return;
    state.diaryEntries.push({ ...entry, timestamp: Date.now() });
  },

  addItem(itemId: string): void {
    if (!state.inventory.includes(itemId)) {
      state.inventory.push(itemId);
    }
  },

  hasItem(itemId: string): boolean {
    return state.inventory.includes(itemId);
  },

  setQuestState(questId: string, qs: QuestState): void {
    state.questStates[questId] = qs;
  },

  getQuestState(questId: string): QuestState {
    return state.questStates[questId] ?? 'unknown';
  },

  applyEffects(effects: Partial<GameStateData>): void {
    if (effects.acceptance !== undefined) state.acceptance = Math.max(0, Math.min(100, state.acceptance + effects.acceptance));
    if (effects.care !== undefined) state.care = Math.max(0, Math.min(100, state.care + effects.care));
    if (effects.selfKnowledge !== undefined) state.selfKnowledge = Math.max(0, Math.min(100, state.selfKnowledge + effects.selfKnowledge));
    if (effects.trust !== undefined) state.trust = Math.max(0, Math.min(100, state.trust + effects.trust));
  },
};
