import { GameState } from './GameState';

export interface RitualDef {
  id: string;
  name: string;
  instruction: string;
  steps: RitualStep[];
  reward: {
    effects?: Partial<{ acceptance: number; care: number; selfKnowledge: number; trust: number }>;
    diaryEntry?: { id: string; title: string; text: string };
    setFlag?: string;
    addItem?: string;
  };
}

export interface RitualStep {
  text: string;
  action: 'wait' | 'press-e' | 'hold-space';
  duration?: number;
}

export class RitualEngine {
  private ritual: RitualDef | null = null;
  private stepIndex = 0;
  private completed = false;

  load(ritual: RitualDef): RitualStep | null {
    this.ritual = ritual;
    this.stepIndex = 0;
    this.completed = false;
    return ritual.steps[0] ?? null;
  }

  getCurrentStep(): RitualStep | null {
    if (!this.ritual || this.completed) return null;
    return this.ritual.steps[this.stepIndex] ?? null;
  }

  advanceStep(): RitualStep | null {
    if (!this.ritual || this.completed) return null;

    this.stepIndex++;
    if (this.stepIndex >= this.ritual.steps.length) {
      this.complete();
      return null;
    }
    return this.ritual.steps[this.stepIndex];
  }

  isCompleted(): boolean {
    return this.completed;
  }

  getRitualName(): string {
    return this.ritual?.name ?? '';
  }

  private complete(): void {
    if (!this.ritual) return;
    this.completed = true;

    const reward = this.ritual.reward;
    if (reward.effects) GameState.applyEffects(reward.effects);
    if (reward.setFlag) GameState.setFlag(reward.setFlag);
    if (reward.addItem) GameState.addItem(reward.addItem);
    if (reward.diaryEntry) GameState.addDiaryEntry(reward.diaryEntry);
  }
}
