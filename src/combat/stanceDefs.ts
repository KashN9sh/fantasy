import { STANCE_DEFS } from "./combatTree";
import { getBattleResponseDef } from "./responseDefs";
import type { BattleResponseId, BattleStanceDef, BattleStanceId } from "./types";

const stanceMap = new Map<BattleStanceId, BattleStanceDef>(STANCE_DEFS.map((stance) => [stance.id, stance]));

export function getBattleStanceDef(id: BattleStanceId): BattleStanceDef {
  const found = stanceMap.get(id);
  if (!found) {
    throw new Error(`Unknown battle stance: ${id}`);
  }
  return found;
}

export function listBattleStanceDefs(): BattleStanceDef[] {
  return [...STANCE_DEFS];
}

export function listAvailableStanceIds(responseIds: BattleResponseId[]): BattleStanceId[] {
  const seen = new Set<BattleStanceId>();
  const out: BattleStanceId[] = [];
  for (const responseId of responseIds) {
    const stanceId = getBattleResponseDef(responseId).stanceId;
    if (seen.has(stanceId)) continue;
    seen.add(stanceId);
    out.push(stanceId);
  }
  return out;
}

export function listResponsesForStance(
  responseIds: BattleResponseId[],
  stanceId: BattleStanceId,
): BattleResponseId[] {
  return responseIds.filter((responseId) => getBattleResponseDef(responseId).stanceId === stanceId);
}
