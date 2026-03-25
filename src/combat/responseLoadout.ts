import { LINES_THREE_SAME_TYPE } from "../data/encounterWarnings";
import type { GameState, PendingEncounter } from "../game/types";
import { RESPONSE_DEFS } from "./combatTree";
import type { BattleResponseId, BattleUnlockDef, DominantBattleStyle } from "./types";
import { listBattleResponseDefs } from "./responseDefs";
import { getBattleStanceDef } from "./stanceDefs";

export const BASE_RESPONSE_IDS: BattleResponseId[] = RESPONSE_DEFS.filter(
  (def) => def.unlock.kind === "base",
).map((def) => def.id);

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function isResponseUnlocked(state: GameState, unlock: BattleUnlockDef): boolean {
  switch (unlock.kind) {
    case "base":
      return true;
    case "shift":
      return state[unlock.axis] >= unlock.min;
    case "style_win_streak":
      return state.encounter.lastWinStyle === unlock.style && state.encounter.sameStyleWinStreak >= unlock.wins;
    case "integrated_enemy":
      return state.integratedEnemyIds.includes(unlock.enemyId);
    case "integrated_enemy_count":
      return state.integratedEnemyIds.length >= unlock.count;
    case "flag_true":
      return Boolean(state.flags[unlock.flag]);
    case "answers_at_least":
      return state.flags.hermitAnswersCount >= unlock.count;
    case "peak_once": {
      if (unlock.consumes === "edgeResponseUsed" && state.edgeResponseUsed) return false;
      const meetsAcceptance =
        unlock.acceptanceAtLeast !== undefined && state.acceptance >= unlock.acceptanceAtLeast;
      const meetsAbsorption =
        unlock.absorptionAtLeast !== undefined && state.absorption >= unlock.absorptionAtLeast;
      return meetsAcceptance || meetsAbsorption;
    }
    case "never_fled_with_integrations":
      return state.neverFledBattle && state.integratedEnemyIds.length >= unlock.count;
    case "any_of":
      return unlock.conditions.some((condition) => isResponseUnlocked(state, condition));
  }
}

export function buildBattleResponseIds(state: GameState): BattleResponseId[] {
  const sealed = new Set(state.sealedResponseIds);
  return unique(
    RESPONSE_DEFS.filter((def) => isResponseUnlocked(state, def.unlock))
      .map((def) => def.id)
      .filter((id) => !sealed.has(id)),
  );
}

export function buildPracticeViewItems(state: GameState): { id: BattleResponseId; name: string; hint: string }[] {
  return listBattleResponseDefs(buildBattleResponseIds(state)).map((def) => {
    const stance = getBattleStanceDef(def.stanceId);
    return { id: def.id, name: `${stance.name}: ${def.name}`, hint: def.effectHint };
  });
}

export function pickSealableResponseId(state: GameState): BattleResponseId | null {
  const all = buildBattleResponseIds(state);
  const nonBase = all.filter((id) => !BASE_RESPONSE_IDS.includes(id));
  const pool = nonBase.length > 0 ? nonBase : BASE_RESPONSE_IDS.filter((id) => !state.sealedResponseIds.includes(id));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

export function tryEncounterThreeSameResponseStyle(
  state: GameState,
  dominantStyle: DominantBattleStyle,
): PendingEncounter | null {
  if (state.encounter.threeSameStyleDone) return null;
  if (dominantStyle === "steady") return null;
  if (state.encounter.sameStyleWinStreak < 3) return null;
  state.encounter.threeSameStyleDone = true;
  return { enemyId: "compare_others", lines: LINES_THREE_SAME_TYPE };
}
