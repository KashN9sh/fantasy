import { GameState } from './GameState';

export interface QuestEffects {
  setFlags?: string[];
  removeFlags?: string[];
  addItems?: string[];
  removeItems?: string[];
  params?: Partial<{ acceptance: number; care: number; selfKnowledge: number; trust: number }>;
  diaryEntry?: { id: string; title: string; text: string };
}

export interface QuestCondition {
  type: 'flag' | 'item' | 'quest-phase' | 'param-gte' | 'all' | 'any';
  flag?: string;
  item?: string;
  questId?: string;
  phase?: string;
  param?: 'acceptance' | 'care' | 'selfKnowledge' | 'trust';
  value?: number;
  conditions?: QuestCondition[];
}

export interface QuestPhaseDef {
  id: string;
  description: string;
  enterEffects?: QuestEffects;
  advanceWhen?: QuestCondition;
  nextPhase?: string;
}

export interface InactivityRule {
  phase: string;
  limit: number;
  expiredPhase: string;
  effects?: QuestEffects;
}

export interface NpcDialogueRoute {
  npcId: string;
  routes: Record<string, string>;
}

export interface QuestDef {
  id: string;
  title: string;
  description: string;
  phases: QuestPhaseDef[];
  inactivity?: InactivityRule[];
  npcDialogues?: NpcDialogueRoute[];
}

export interface InteractableVisibility {
  questId: string;
  phases: string[];
}

const quests: Map<string, QuestDef> = new Map();

function checkCondition(cond: QuestCondition): boolean {
  switch (cond.type) {
    case 'flag':
      return cond.flag ? GameState.hasFlag(cond.flag) : false;
    case 'item':
      return cond.item ? GameState.hasItem(cond.item) : false;
    case 'quest-phase':
      return cond.questId && cond.phase
        ? GameState.getQuestPhase(cond.questId) === cond.phase
        : false;
    case 'param-gte': {
      if (!cond.param || cond.value === undefined) return false;
      const state = GameState.get();
      return state[cond.param] >= cond.value;
    }
    case 'all':
      return (cond.conditions ?? []).every(c => checkCondition(c));
    case 'any':
      return (cond.conditions ?? []).some(c => checkCondition(c));
    default:
      return false;
  }
}

function applyEffects(effects: QuestEffects): void {
  if (effects.setFlags) effects.setFlags.forEach(f => GameState.setFlag(f));
  if (effects.removeFlags) effects.removeFlags.forEach(f => GameState.removeFlag(f));
  if (effects.addItems) effects.addItems.forEach(i => GameState.addItem(i));
  if (effects.removeItems) effects.removeItems.forEach(i => GameState.removeItem(i));
  if (effects.params) GameState.applyEffects(effects.params);
  if (effects.diaryEntry) GameState.addDiaryEntry(effects.diaryEntry);
}

export const QuestManager = {
  register(quest: QuestDef): void {
    quests.set(quest.id, quest);
  },

  registerAll(defs: QuestDef[]): void {
    defs.forEach(q => quests.set(q.id, q));
  },

  activate(questId: string): void {
    const quest = quests.get(questId);
    if (!quest) return;
    if (GameState.getQuestPhase(questId) !== 'inactive') return;

    const firstPhase = quest.phases[0];
    if (!firstPhase) return;

    GameState.setQuestState(questId, 'active');
    this.enterPhase(questId, firstPhase.id);
  },

  enterPhase(questId: string, phaseId: string): void {
    const quest = quests.get(questId);
    if (!quest) return;

    const phaseDef = quest.phases.find(p => p.id === phaseId);
    if (!phaseDef) return;

    GameState.setQuestPhase(questId, phaseId);

    if (phaseId === 'completed') {
      GameState.setQuestState(questId, 'completed');
    }

    if (phaseDef.enterEffects) {
      applyEffects(phaseDef.enterEffects);
    }
  },

  checkProgress(questId: string): void {
    const quest = quests.get(questId);
    if (!quest) return;

    const currentPhase = GameState.getQuestPhase(questId);
    if (currentPhase === 'inactive' || currentPhase === 'completed' || currentPhase === 'expired') return;

    const phaseDef = quest.phases.find(p => p.id === currentPhase);
    if (!phaseDef) return;

    if (phaseDef.advanceWhen && phaseDef.nextPhase) {
      if (checkCondition(phaseDef.advanceWhen)) {
        this.enterPhase(questId, phaseDef.nextPhase);
        this.checkProgress(questId);
      }
    }
  },

  checkAllProgress(): void {
    quests.forEach((_, id) => {
      const phase = GameState.getQuestPhase(id);
      if (phase !== 'inactive' && phase !== 'completed' && phase !== 'expired') {
        this.checkProgress(id);
      }
    });
  },

  onTransition(): void {
    GameState.incrementTransitionCount();
    this.checkInactivity();
    this.checkAllProgress();
  },

  checkInactivity(): void {
    quests.forEach((quest, questId) => {
      if (!quest.inactivity) return;
      const currentPhase = GameState.getQuestPhase(questId);
      if (currentPhase === 'completed' || currentPhase === 'expired' || currentPhase === 'inactive') return;

      for (const rule of quest.inactivity) {
        if (rule.phase === currentPhase) {
          const age = GameState.getQuestPhaseAge(questId);
          if (age >= rule.limit) {
            this.enterPhase(questId, rule.expiredPhase);
            if (rule.effects) applyEffects(rule.effects);
            break;
          }
        }
      }
    });
  },

  getDialogueForNpc(npcId: string): string | null {
    for (const [questId, quest] of quests) {
      if (!quest.npcDialogues) continue;
      const route = quest.npcDialogues.find(r => r.npcId === npcId);
      if (!route) continue;

      const currentPhase = GameState.getQuestPhase(questId);
      if (route.routes[currentPhase]) {
        return route.routes[currentPhase];
      }
    }
    return null;
  },

  isInteractableVisible(visibility: InteractableVisibility | undefined): boolean {
    if (!visibility) return true;
    const currentPhase = GameState.getQuestPhase(visibility.questId);
    return visibility.phases.includes(currentPhase);
  },

  getActiveQuests(): QuestDef[] {
    const result: QuestDef[] = [];
    quests.forEach((quest, id) => {
      const phase = GameState.getQuestPhase(id);
      if (phase !== 'inactive' && phase !== 'completed' && phase !== 'expired') {
        result.push(quest);
      }
    });
    return result;
  },

  getCompletedQuests(): QuestDef[] {
    const result: QuestDef[] = [];
    quests.forEach((quest, id) => {
      if (GameState.getQuestPhase(id) === 'completed') {
        result.push(quest);
      }
    });
    return result;
  },

  getQuest(id: string): QuestDef | undefined {
    return quests.get(id);
  },

  getPhaseDescription(questId: string): string {
    const quest = quests.get(questId);
    if (!quest) return '';
    const phase = GameState.getQuestPhase(questId);
    const phaseDef = quest.phases.find(p => p.id === phase);
    return phaseDef?.description ?? '';
  },
};
