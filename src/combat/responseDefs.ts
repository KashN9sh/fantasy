import { RESPONSE_DEFS } from "./combatTree";
import type { BattleResponseDef, BattleResponseId } from "./types";

const responseMap = new Map<BattleResponseId, BattleResponseDef>(RESPONSE_DEFS.map((def) => [def.id, def]));

export function getBattleResponseDef(id: BattleResponseId): BattleResponseDef {
  const found = responseMap.get(id);
  if (!found) {
    throw new Error(`Unknown battle response: ${id}`);
  }
  return found;
}

export function listBattleResponseDefs(ids: BattleResponseId[]): BattleResponseDef[] {
  return ids.map((id) => getBattleResponseDef(id));
}
