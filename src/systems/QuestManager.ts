import { GameState } from './GameState';

export interface QuestDef {
  id: string;
  title: string;
  description: string;
  steps: QuestStep[];
  reward?: {
    effects?: Partial<{ acceptance: number; care: number; selfKnowledge: number; trust: number }>;
    item?: string;
    diaryEntry?: { id: string; title: string; text: string };
  };
}

export interface QuestStep {
  description: string;
  conditionFlag: string;
}

const quests: Map<string, QuestDef> = new Map();

export const QuestManager = {
  register(quest: QuestDef): void {
    quests.set(quest.id, quest);
  },

  registerAll(defs: QuestDef[]): void {
    defs.forEach(q => quests.set(q.id, q));
  },

  activate(questId: string): void {
    GameState.setQuestState(questId, 'active');
  },

  checkProgress(questId: string): void {
    const quest = quests.get(questId);
    if (!quest) return;
    if (GameState.getQuestState(questId) !== 'active') return;

    const allDone = quest.steps.every(step => GameState.hasFlag(step.conditionFlag));
    if (allDone) {
      GameState.setQuestState(questId, 'completed');
      if (quest.reward) {
        if (quest.reward.effects) GameState.applyEffects(quest.reward.effects);
        if (quest.reward.item) GameState.addItem(quest.reward.item);
        if (quest.reward.diaryEntry) GameState.addDiaryEntry(quest.reward.diaryEntry);
      }
    }
  },

  getActiveQuests(): QuestDef[] {
    const result: QuestDef[] = [];
    quests.forEach((quest, id) => {
      if (GameState.getQuestState(id) === 'active') {
        result.push(quest);
      }
    });
    return result;
  },

  getQuest(id: string): QuestDef | undefined {
    return quests.get(id);
  },
};
