export type TargetKind = "enemyHero" | "enemyMinion" | "playerHero" | "playerMinion";

export interface TargetRef {
  kind: TargetKind;
  uid?: string;
}

export interface MinionInstance {
  uid: string;
  defId: string;
  name: string;
  atk: number;
  hp: number;
  maxHp: number;
  canAttack: boolean;
  taunt: boolean;
  poison: number;
}

export interface HandCard {
  uid: string;
  defId: string;
}

export type BattlePhase = "player" | "enemy" | "won" | "lost";

export interface BattleState {
  phase: BattlePhase;
  turnNumber: number;
  player: {
    hp: number;
    maxHp: number;
    block: number;
    energy: number;
    maxEnergy: number;
    poison: number;
  };
  /** Яд на следующий удар картой attack/spell с уроном */
  poisonOnNextAttack: number;
  enemy: {
    name: string;
    hp: number;
    maxHp: number;
    block: number;
    poison: number;
    intentDamage: number;
  };
  playerMinions: MinionInstance[];
  enemyMinions: MinionInstance[];
  hand: HandCard[];
  drawPile: string[];
  discardPile: string[];
  log: string[];
}

export interface BattleCardDef {
  id: string;
  name: string;
  cost: number;
  icon: string;
  desc: string;
  needsEnemyTarget: boolean;
  kind: "attack" | "spell" | "summon" | "buff" | "utility";
  damage?: number;
  aoeDamage?: number;
  block?: number;
  draw?: number;
  addPoisonToNextAttack?: number;
  summon?: {
    name: string;
    atk: number;
    hp: number;
    taunt: boolean;
    rush: boolean;
  };
}
