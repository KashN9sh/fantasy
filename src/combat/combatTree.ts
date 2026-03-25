import rawCombatTree from "./combatTree.json";
import type { BattleResponseDef, BattleStanceDef } from "./types";

interface CombatTreeData {
  stances: BattleStanceDef[];
  responses: BattleResponseDef[];
}

const combatTree = rawCombatTree as CombatTreeData;

if (!Array.isArray(combatTree.stances) || !Array.isArray(combatTree.responses)) {
  throw new Error("Invalid combat tree JSON");
}

export const STANCE_DEFS: BattleStanceDef[] = combatTree.stances;
export const RESPONSE_DEFS: BattleResponseDef[] = combatTree.responses;
