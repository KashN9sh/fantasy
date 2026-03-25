import { LINES_THREE_SAME_TYPE } from "../data/encounterWarnings";
import type { GameState, PendingEncounter } from "../game/types";
import type { BattleSamplingContext } from "./types";
import { BASE_DECK_IDS, getBattleCardDef } from "./battleCardDefs";

/** Карта интеграции по id врага ([`DECK.md`](../../docs/DECK.md)) */
export const INTEGRATION_CARD_BY_ENEMY: Record<string, string> = {
  hum_unnamed: "deck_background_noise",
  voice_must: "deck_inner_advisor",
  compare_others: "deck_own_path",
  shadow_past_decision: "deck_companion",
  insomnia: "deck_night_talk",
  expectation_judgment: "deck_own_eyes",
};

const ACCEPTANCE_IDS = [
  "deck_window_gaze",
  "deck_hand_shoulder",
  "deck_done_list",
  "silence_accept",
  "deck_permission",
] as const;

const ABSORPTION_IDS = [
  "deck_grit_teeth",
  "deck_autopilot",
  "deck_louder",
  "deck_wall_card",
  "deck_not_now",
] as const;

/** Сборка колоды по [`DECK.md`](../../docs/DECK.md) и состоянию игры */
export function buildBattleDeckIds(state: GameState): string[] {
  const out: string[] = [...BASE_DECK_IDS];

  if (state.acceptance >= 4) {
    out.push(...ACCEPTANCE_IDS);
  }
  if (state.absorption >= 4) {
    out.push(...ABSORPTION_IDS);
  }

  for (const eid of state.integratedEnemyIds) {
    const cid = INTEGRATION_CARD_BY_ENEMY[eid];
    if (cid) out.push(cid);
  }

  if (state.flags.veraMapReady) {
    out.push("deck_card_vera");
  }
  if (state.flags.hermitAnswersCount >= 4) {
    out.push("deck_quiet_voice");
  }
  if (state.acceptance >= 6) {
    out.push("deck_sapling", "deck_flowers_roots");
  }
  if (state.flags.metFigure) {
    out.push("deck_trail_follow");
  }
  if (state.integratedEnemyIds.length >= 6) {
    out.push("silence_finale");
  }
  if (!state.edgeCardUsed && (state.acceptance >= 10 || state.absorption >= 10)) {
    out.push("deck_edge");
  }
  if (state.neverFledBattle && state.integratedEnemyIds.length >= 1) {
    out.push("deck_stand");
  }
  if (state.flags.iraQuestActive) {
    out.push("deck_echo_echo");
  }

  if (state.removedDeckCardIds.length === 0) return out;
  const removed = new Set(state.removedDeckCardIds);
  return out.filter((id) => !removed.has(id));
}

/** §3.3: три карты одной категории (не base) в колоде боя */
export function tryEncounterThreeSameDeckCategory(state: GameState): PendingEncounter | null {
  if (state.encounter.threeSameCategoryDone) return null;
  const ids = buildBattleDeckIds(state);
  const counts = new Map<string, number>();
  for (const id of ids) {
    const cat = getBattleCardDef(id)?.deckCategory;
    if (!cat || cat === "base") continue;
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
    if ((counts.get(cat) ?? 0) >= 3) {
      state.encounter.threeSameCategoryDone = true;
      return { enemyId: "compare_others", lines: LINES_THREE_SAME_TYPE };
    }
  }
  return null;
}

export function buildBattleSamplingContext(state: GameState): BattleSamplingContext {
  return {
    acceptance: state.acceptance,
    absorption: state.absorption,
    turnNumber: 1,
    integratedEnemyIds: [...state.integratedEnemyIds],
    pitySinceCategory: {},
  };
}
