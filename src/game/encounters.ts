/**
 * Триггеры входа в бой — [ENCOUNTER_SYSTEM.md](../../docs/ENCOUNTER_SYSTEM.md).
 */
import { isStoryNpcVisible } from "../data/scenarioParts5to8";
import {
  ENCOUNTER_SHADOW_FROM_LIE,
  LINES_COALITION_WINS,
  LINES_DEFEAT_RETURN,
  LINES_FIVE_ZONES_COALITION,
  LINES_FLEE_REINFORCEMENT,
  LINES_INSOMNIA_RUSH,
  LINES_PASS_NPC,
  LINES_REMATCH_STRONGER,
  LINES_REST_DECLINE_INSOMNIA,
  LINES_REVISIT_SHADOW,
  LINES_SEVEN_ZONES_QUIET,
  LINES_SHIFT_EIGHT_COALITION,
  LINES_SHIFT_FIVE_OPPOSITE,
  LINES_THREE_BATTLES_VOICE,
  LINES_WANDER_GUL_INSOMNIA,
  getEncounterWarning,
} from "../data/encounterWarnings";
import type { BattleEndSummary, GameState, PendingEncounter } from "./types";
import type { WorldZoneId } from "../data/worldZones";
import { ZONE_LAYOUT } from "./overworldMaps";
import { isDown } from "./input";

export type { PendingEncounter };

export const PAUSE_EXPLORE_IDLE_MS = 13_000;
const IDLE_GUL_MS = 30_000;
const DIRECTION_WINDOW_MS = 5_500;
const DIR_CHANGES_NEED = 3;

const FLEE_ALLIES = ["voice_must", "compare_others", "insomnia"] as const;

export function signalEncounterDialogPause(state: GameState): void {
  state.encounter.zoneStreakNoPause = 0;
}

export function signalEncounterRestPause(state: GameState): void {
  state.encounter.zoneStreakNoPause = 0;
}

export function resetEncounterStandTile(state: GameState): void {
  state.encounterStandTile = null;
  state.exploreIdleMs = 0;
}

function encounterForZone(state: GameState): { tileX: number; tileY: number; enemyId: string } | null {
  const enc = ZONE_LAYOUT[state.currentZoneId].encounter;
  if (!enc) return null;
  if (state.defeatedEnemyIds.includes(enc.enemyId)) return null;
  return enc;
}

function takeQueued(state: GameState): PendingEncounter | null {
  const q = state.encounter.queuedEncounter;
  if (!q) return null;
  state.encounter.queuedEncounter = null;
  return q;
}

function manhattan(state: GameState, x: number, y: number): number {
  return Math.abs(state.playerTileX - x) + Math.abs(state.playerTileY - y);
}

function adjacentToNpcLayer(state: GameState): boolean {
  const lay = ZONE_LAYOUT[state.currentZoneId];
  if (lay.hermit && manhattan(state, lay.hermit.x, lay.hermit.y) === 1) return true;
  if (lay.vera && manhattan(state, lay.vera.x, lay.vera.y) === 1) return true;
  if (lay.lin && manhattan(state, lay.lin.x, lay.lin.y) === 1) return true;
  if (lay.ira && manhattan(state, lay.ira.x, lay.ira.y) === 1) return true;
  for (const sn of lay.storyNpcs) {
    if (!isStoryNpcVisible(state, sn.kind)) continue;
    if (manhattan(state, sn.x, sn.y) === 1) return true;
  }
  return false;
}

/** Таймер простоя: сброс серии зон при долгой остановке. */
export function tickExploreEncounterIdle(state: GameState, dtMs: number): void {
  const moving =
    isDown("KeyW") ||
    isDown("KeyS") ||
    isDown("KeyA") ||
    isDown("KeyD") ||
    isDown("ArrowUp") ||
    isDown("ArrowDown") ||
    isDown("ArrowLeft") ||
    isDown("ArrowRight");
  if (moving) {
    state.exploreIdleMs = 0;
    return;
  }
  state.exploreIdleMs += dtMs;
  if (state.exploreIdleMs >= PAUSE_EXPLORE_IDLE_MS) {
    state.encounter.zoneStreakNoPause = 0;
  }
}

/**
 * @param isFirstVisit — true, если до вызова зона ещё не была в visitedZoneIds.
 */
export function encounterOnZoneEntered(state: GameState, _zone: WorldZoneId, isFirstVisit: boolean): PendingEncounter | null {
  const er = state.encounter;
  er.totalZoneTransitions += 1;
  er.zonesSinceBattle += 1;

  if (er.lastBattleNoCards) {
    er.zonesWithoutCardUse += 1;
  }

  if (!isFirstVisit) {
    if (!er.firstRevisitShadowDone && !state.defeatedEnemyIds.includes("shadow_past_decision")) {
      er.firstRevisitShadowDone = true;
      return { enemyId: "shadow_past_decision", lines: LINES_REVISIT_SHADOW };
    }
  }

  er.zoneStreakNoPause += 1;

  if (er.rematch) {
    const { enemyId, powerLevel } = er.rematch;
    er.rematch = null;
    return {
      enemyId,
      enemyPowerLevel: powerLevel,
      lines: LINES_REMATCH_STRONGER,
    };
  }

  if (er.fleeAlly) {
    const { primaryId, allyId } = er.fleeAlly;
    er.fleeAlly = null;
    return {
      enemyId: primaryId,
      allyEnemyId: allyId,
      lines: LINES_FLEE_REINFORCEMENT,
    };
  }

  if (er.pendingRestInsomnia) {
    er.pendingRestInsomnia = false;
    if (!state.defeatedEnemyIds.includes("insomnia")) {
      return { enemyId: "insomnia", lines: LINES_REST_DECLINE_INSOMNIA };
    }
  }

  if (
    er.zoneStreakNoPause >= 3 &&
    !er.insomniaRushUsed &&
    !state.defeatedEnemyIds.includes("insomnia")
  ) {
    er.insomniaRushUsed = true;
    return { enemyId: "insomnia", lines: LINES_INSOMNIA_RUSH };
  }

  if (
    er.totalZoneTransitions >= 5 &&
    !er.coalitionFiveDone &&
    !state.defeatedEnemyIds.includes("coalition_anxiety")
  ) {
    er.coalitionFiveDone = true;
    return { enemyId: "coalition_anxiety", lines: LINES_FIVE_ZONES_COALITION };
  }

  if (
    er.zonesSinceBattle >= 8 &&
    !er.sevenZoneQuietDone &&
    !state.defeatedEnemyIds.includes("hum_unnamed")
  ) {
    er.sevenZoneQuietDone = true;
    return {
      enemyId: "hum_unnamed",
      allyEnemyId: "insomnia",
      lines: LINES_SEVEN_ZONES_QUIET,
    };
  }

  if (
    er.totalZoneTransitions >= 8 &&
    !er.eightZoneDryDone &&
    !state.defeatedEnemyIds.includes("hum_unnamed")
  ) {
    er.eightZoneDryDone = true;
    return {
      enemyId: "hum_unnamed",
      allyEnemyId: "insomnia",
      lines: LINES_SEVEN_ZONES_QUIET,
    };
  }

  if (
    er.consecutiveBattlesCompleted >= 3 &&
    !er.threeBattlesVoiceDone &&
    !state.defeatedEnemyIds.includes("voice_must")
  ) {
    er.threeBattlesVoiceDone = true;
    return { enemyId: "voice_must", lines: LINES_THREE_BATTLES_VOICE };
  }

  if (er.postBattleAbsorption3) {
    er.postBattleAbsorption3 = false;
    if (!state.defeatedEnemyIds.includes("insomnia")) {
      return { enemyId: "insomnia", lines: getEncounterWarning("insomnia") };
    }
  }
  if (er.postBattleAcceptance3) {
    er.postBattleAcceptance3 = false;
    if (!state.defeatedEnemyIds.includes("voice_must")) {
      return { enemyId: "voice_must", lines: getEncounterWarning("voice_must") };
    }
  }
  if (er.postBattleDiscard3) {
    er.postBattleDiscard3 = false;
    if (!state.defeatedEnemyIds.includes("shadow_past_decision")) {
      return { enemyId: "shadow_past_decision", lines: getEncounterWarning("shadow_past_decision") };
    }
  }

  if (er.zonesWithoutCardUse >= 3 && !state.defeatedEnemyIds.includes("hum_unnamed")) {
    er.zonesWithoutCardUse = 0;
    er.lastBattleNoCards = false;
    return { enemyId: "hum_unnamed", lines: getEncounterWarning("hum_unnamed") };
  }

  return null;
}

export function tryConsumeShadowLieEncounter(state: GameState, enteredZone: WorldZoneId): PendingEncounter | null {
  if (enteredZone !== "grove") return null;
  if (!state.flags.veraBridgeWasPrettyLie) return null;
  if (state.flags.encounterShadowFromLieUsed) return null;
  if (state.defeatedEnemyIds.includes("shadow_past_decision")) return null;

  state.flags.encounterShadowFromLieUsed = true;
  return { enemyId: "shadow_past_decision", lines: ENCOUNTER_SHADOW_FROM_LIE };
}

function tryStepEncounter(state: GameState): PendingEncounter | null {
  const e = encounterForZone(state);
  if (!e) {
    state.encounterStandTile = null;
    return null;
  }
  const { tileX, tileY, enemyId } = e;
  const onTile = state.playerTileX === tileX && state.playerTileY === tileY;
  if (!onTile) {
    state.encounterStandTile = null;
    return null;
  }
  const st = state.encounterStandTile;
  if (st && st.zoneId === state.currentZoneId && st.x === tileX && st.y === tileY) {
    return null;
  }
  state.encounterStandTile = { zoneId: state.currentZoneId, x: tileX, y: tileY };
  return { enemyId, lines: getEncounterWarning(enemyId) };
}

function tryIdleGulEncounter(state: GameState): PendingEncounter | null {
  if (state.defeatedEnemyIds.includes("hum_unnamed")) return null;
  if (state.flags.encounterIdleGulUsed) return null;
  if (state.exploreIdleMs < IDLE_GUL_MS) return null;

  state.flags.encounterIdleGulUsed = true;
  state.exploreIdleMs = 0;
  return { enemyId: "hum_unnamed", lines: getEncounterWarning("hum_unnamed") };
}

function countRecentDirectionChanges(log: { dx: number; dy: number; t: number }[], now: number): number {
  const cutoff = now - DIRECTION_WINDOW_MS;
  const recent = log.filter((e) => e.t >= cutoff);
  if (recent.length < 2) return 0;
  let changes = 0;
  for (let i = 1; i < recent.length; i++) {
    const a = recent[i - 1];
    const b = recent[i];
    if (a.dx !== b.dx || a.dy !== b.dy) changes++;
  }
  return changes;
}

export function encounterRecordMove(state: GameState, dx: number, dy: number): void {
  const now = performance.now();
  const er = state.encounter;
  er.moveDirLog.push({ dx, dy, t: now });
  er.moveDirLog = er.moveDirLog.filter((e) => e.t > now - DIRECTION_WINDOW_MS * 2);

  const adj = adjacentToNpcLayer(state);
  if (er.prevAdjacentNpc && !adj) {
    er.passByNpcStreak += 1;
  } else if (adj) {
    er.passByNpcStreak = 0;
  }
  er.prevAdjacentNpc = adj;
}

function tryWanderEncounter(state: GameState): PendingEncounter | null {
  if (state.encounter.wanderGulInsomniaUsed) return null;
  const changes = countRecentDirectionChanges(state.encounter.moveDirLog, performance.now());
  if (changes < DIR_CHANGES_NEED) return null;
  state.encounter.wanderGulInsomniaUsed = true;
  return {
    enemyId: "hum_unnamed",
    allyEnemyId: "insomnia",
    lines: LINES_WANDER_GUL_INSOMNIA,
  };
}

function tryPassNpc(state: GameState): PendingEncounter | null {
  if (state.encounter.passByNpcStreak < 2) return null;
  if (state.defeatedEnemyIds.includes("expectation_judgment")) return null;
  state.encounter.passByNpcStreak = 0;
  return { enemyId: "expectation_judgment", lines: LINES_PASS_NPC };
}

export function evaluateExploreEncounters(state: GameState): PendingEncounter | null {
  if (state.mode !== "explore") return null;

  const q = takeQueued(state);
  if (q) return q;

  const wander = tryWanderEncounter(state);
  if (wander) return wander;

  const pass = tryPassNpc(state);
  if (pass) return pass;

  const step = tryStepEncounter(state);
  if (step) return step;

  return tryIdleGulEncounter(state);
}

export function tryConsumeShiftEncounter(state: GameState): PendingEncounter | null {
  const er = state.encounter;
  const a = state.acceptance;
  const b = state.absorption;

  if (a >= 5 && a > b + 1 && !er.shiftFiveDone) {
    er.shiftFiveDone = true;
    if (!state.defeatedEnemyIds.includes("compare_others")) {
      return { enemyId: "compare_others", lines: LINES_SHIFT_FIVE_OPPOSITE };
    }
  }
  if (b >= 5 && b > a + 1 && !er.shiftFiveDone) {
    er.shiftFiveDone = true;
    if (!state.defeatedEnemyIds.includes("expectation_judgment")) {
      return { enemyId: "expectation_judgment", lines: LINES_SHIFT_FIVE_OPPOSITE };
    }
  }

  if (a >= 8 && a > b + 2 && !er.shiftEightDone) {
    er.shiftEightDone = true;
    if (!state.defeatedEnemyIds.includes("coalition_anxiety")) {
      return { enemyId: "coalition_anxiety", lines: LINES_SHIFT_EIGHT_COALITION };
    }
  }
  if (b >= 8 && b > a + 2 && !er.shiftEightDone) {
    er.shiftEightDone = true;
    if (!state.defeatedEnemyIds.includes("coalition_anxiety")) {
      return { enemyId: "coalition_anxiety", lines: LINES_SHIFT_EIGHT_COALITION };
    }
  }

  return null;
}

function pickFleeAlly(primaryId: string): string {
  const idx = Math.abs(primaryId.split("").reduce((s, c) => s + c.charCodeAt(0), 0)) % FLEE_ALLIES.length;
  let ally = FLEE_ALLIES[idx];
  if (ally === primaryId) ally = FLEE_ALLIES[(idx + 1) % FLEE_ALLIES.length];
  return ally;
}

export function applyBattleEndToEncounters(state: GameState, s: BattleEndSummary): void {
  const er = state.encounter;
  er.consecutiveBattlesCompleted += 1;

  if (s.endKind === "won") {
    er.zonesSinceBattle = 0;
    if (s.hadAnyCardPlayed) {
      er.zonesWithoutCardUse = 0;
      er.lastBattleNoCards = false;
    } else {
      er.lastBattleNoCards = true;
    }

    er.consecutiveWins += 1;
    if (
      er.consecutiveWins >= 3 &&
      !er.coalitionThreeWinsDone &&
      !state.defeatedEnemyIds.includes("coalition_anxiety")
    ) {
      er.coalitionThreeWinsDone = true;
      er.consecutiveWins = 0;
      er.rematch = null;
      er.queuedEncounter = { enemyId: "coalition_anxiety", lines: LINES_COALITION_WINS };
    } else if (s.integrationWin) {
      er.rematch = null;
    } else if (s.enemyId && s.enemyId !== "root_of_anxiety" && s.enemyId !== "coalition_anxiety") {
      er.rematch = { enemyId: s.enemyId, powerLevel: 2 };
    }

    if (s.postAbsorption3) er.postBattleAbsorption3 = true;
    if (s.postAcceptance3) er.postBattleAcceptance3 = true;
    if (s.postDiscard3) er.postBattleDiscard3 = true;
  } else {
    er.consecutiveWins = 0;
    er.rematch = null;

    if (s.endKind === "lost") {
      if (!er.defeatComebackDone && s.enemyId !== "root_of_anxiety") {
        er.defeatComebackDone = true;
        er.queuedEncounter = {
          enemyId: "shadow_past_decision",
          allyEnemyId: "voice_must",
          lines: LINES_DEFEAT_RETURN,
        };
      }
    }

    if (s.endKind === "abandoned") {
      state.neverFledBattle = false;
      if (s.enemyId && s.enemyId !== "root_of_anxiety") {
        er.fleeAlly = { primaryId: s.enemyId, allyId: pickFleeAlly(s.enemyId) };
      }
    }
  }
}
