export type BattlePhase = "player" | "enemy" | "won" | "lost" | "abandoned";

export type EnemyIntentTier = "light" | "medium" | "heavy";

export type BattleStanceId = "steady" | "acceptance" | "absorption" | "withdrawal";

export type BattleUnlockDef =
  | { kind: "base" }
  | { kind: "shift"; axis: "acceptance" | "absorption"; min: number }
  | { kind: "style_win_streak"; style: DominantBattleStyle; wins: number }
  | { kind: "integrated_enemy"; enemyId: string }
  | { kind: "integrated_enemy_count"; count: number }
  | { kind: "flag_true"; flag: "veraMapReady" | "iraQuestActive" | "metFigure" }
  | { kind: "answers_at_least"; count: number }
  | { kind: "peak_once"; acceptanceAtLeast?: number; absorptionAtLeast?: number; consumes: "edgeResponseUsed" }
  | { kind: "never_fled_with_integrations"; count: number }
  | { kind: "any_of"; conditions: BattleUnlockDef[] };

export type BattleResponseStyle =
  | "acceptance"
  | "absorption"
  | "withdrawal"
  | "steady"
  | "integration"
  | "npc"
  | "rare";

export type DominantBattleStyle = "acceptance" | "absorption" | "withdrawal" | "steady";

export type BattleResponseId =
  | "ground"
  | "boundary"
  | "witness"
  | "push"
  | "step_back"
  | "unhook"
  | "far_horizon"
  | "breathe_square"
  | "honest_rest"
  | "autopilot"
  | "hard_wall"
  | "background_noise"
  | "inner_advisor"
  | "own_path"
  | "companion"
  | "night_talk"
  | "own_eyes"
  | "vera_map"
  | "quiet_voice"
  | "sapling"
  | "echo_echo"
  | "trail_follow"
  | "final_silence"
  | "edge"
  | "stand";

export interface BattleResponseDef {
  id: BattleResponseId;
  stanceId: BattleStanceId;
  name: string;
  style: BattleResponseStyle;
  title: string;
  desc: string;
  effectHint: string;
  icon: string;
  unlockGroup: "base" | "acceptance" | "absorption" | "integration" | "npc" | "rare";
  unlock: BattleUnlockDef;
}

export interface BattleStanceDef {
  id: BattleStanceId;
  name: string;
  title: string;
  desc: string;
  icon: string;
  unlock: BattleUnlockDef;
}

export interface EnemyEcho {
  enemyId: string;
  name: string;
  intentDamage: number;
  intentText: string;
  buffed: boolean;
}

export interface BattleState {
  phase: BattlePhase;
  turnNumber: number;
  battleEnemyId: string | null;
  skipNextPlayerTurn: boolean;
  currentStanceId: BattleStanceId | null;
  availableResponseIds: BattleResponseId[];
  player: {
    calm: number;
    maxCalm: number;
    block: number;
    poison: number;
  };
  enemy: {
    name: string;
    level: number;
    resistance: number;
    maxResistance: number;
    block: number;
    poison: number;
    intentDamage: number;
    intentTier: EnemyIntentTier;
    intentText: string;
  };
  enemyEchoes: EnemyEcho[];
  debuffs: {
    panic: number;
    guilt: number;
    shame: number;
    fatigue: number;
    numbness: number;
    regret: number;
  };
  log: string[];
  understanding: number;
  pressureLevel: number;
  turnUsedResponse: boolean;
  responsesUsedTotal: number;
  pressureResponsesTotal: number;
  acceptanceResponseStreak: number;
  absorptionResponseStreak: number;
  withdrawalResponseStreak: number;
  quietResponseStreak: number;
  understandingChain: number;
  lastResponseIds: BattleResponseId[];
  lastDominantStyle: DominantBattleStyle;
  metaPostAbsorption3: boolean;
  metaPostAcceptance3: boolean;
  metaPostWithdrawal3: boolean;
  usedRareResponse: boolean;
  usedResponses: BattleResponseId[];
}
