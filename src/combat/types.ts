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

/** Категория карты для весов добора ([`DECK_PROBABILITIES.md`](../../docs/DECK_PROBABILITIES.md)) */
export type DeckCardCategory =
  | "base"
  | "acceptance"
  | "absorption"
  | "integration"
  | "npc"
  | "rare";

export interface BattleSamplingContext {
  acceptance: number;
  absorption: number;
  /** Счётчик ходов с начала боя (для pity / интеграций) */
  turnNumber: number;
  integratedEnemyIds: string[];
  /** Сколько ходов назад поняли врага (для повышенного веса интеграций) — упрощённо 0 */
  pitySinceCategory: Partial<Record<DeckCardCategory, number>>;
}

export interface BattleState {
  phase: BattlePhase;
  turnNumber: number;
  /** Id врага из лора ([`LORE_ENEMIES`](../lore/enemies.ts)) — особые правила боя */
  battleEnemyId: string | null;
  /** Сколько карт сыграно за текущий ход игрока */
  cardsPlayedThisTurn: number;
  /** Подряд ходов с ≥1 картой (для «Гула») */
  gulCardStreak: number;
  /** Пропустить следующий ход игрока (после «Честное „я устал“») */
  skipNextPlayerTurn: boolean;
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
  /** Бонус к следующему урону картой (карта «Край») */
  bonusDamageNextAttack: number;
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
  /** Серия ходов без карт (бессонница) */
  insomniaEmptyStreak: number;
  /** Сыграна карта «Край» (одноразовая в метапрогрессии) */
  playedEdgeCard: boolean;
  /** Контекст взвешенного добора */
  samplingContext: BattleSamplingContext | null;
  /** Всего карт сыграно за бой (ENCOUNTER_SYSTEM §3.3) */
  cardsPlayedTotal: number;
  absorptionPlayStreak: number;
  acceptancePlayStreak: number;
  /** Ходы подряд, завершённые без сыгранной карты (не гул/бессонница) */
  turnsNoCardEnd: number;
  metaPostAbsorption3: boolean;
  metaPostAcceptance3: boolean;
  metaPostDiscard3: boolean;
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
  /** Восстановить ОЗ игрока */
  healPlayer?: number;
  /** Добавить энергию (не выше максимума) */
  addEnergy?: number;
  /** Установить энергию в максимум */
  energyToMax?: boolean;
  /** После разыгрывания — пропустить следующий свой ход */
  skipNextPlayerTurn?: boolean;
  /** Мгновенная победа, если `battleEnemyId` в списке (напр. «Пауза» vs Гул) */
  instantWinIfEnemyId?: string[];
  /** Мгновенная победа при принятии ≥ N ([`DECK.md`](../../docs/DECK.md) «Тишина» принятие) */
  instantWinIfAcceptanceAtLeast?: number;
  /** Категория для [`deckSampling`](./deckSampling.ts) */
  deckCategory?: DeckCardCategory;
  /** Урон = min(кап, число карт в руке при розыгрыше) — «Список уже сделанного» */
  damageFromHandSize?: { cap: number };
  /** После урона врагу — урон себе («Сжать зубы») */
  selfDamageAfterHit?: number;
  /** Следующая твоя атака +N урона («Край») */
  addBonusDamageNextAttack?: number;
  summon?: {
    name: string;
    atk: number;
    hp: number;
    taunt: boolean;
    rush: boolean;
  };
}
