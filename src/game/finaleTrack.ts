/**
 * Трек финала по [PATHS.md](../docs/PATHS.md) и порогам [SCENARIO.md](../docs/SCENARIO.md) ч.9.
 */
import type { GameState } from "./types";

export type FinaleTrack = "acceptance" | "absorption" | "neutral";

/** Вера в фазе «Сбор»: хорошая развязка / плохая / не дошла */
export type VeraFinalePresence = "good" | "bad" | "absent";

export interface FinaleAssembly {
  vera: VeraFinalePresence;
  lin: boolean;
  ira: boolean;
  /** Кувшин «полон» для эпилога (достаточно интеграций) */
  iraKuvshinFull: boolean;
  figure: boolean;
}

export function getFinaleTrack(state: GameState): FinaleTrack {
  const lean = state.flags.hermitPathLean;
  const wantAcc = state.acceptance >= 6 || lean === "understand";
  const wantAbs = state.absorption >= 6 || lean === "defeat";
  if (wantAcc && !wantAbs) return "acceptance";
  if (wantAbs && !wantAcc) return "absorption";
  if (wantAcc && wantAbs) {
    if (state.acceptance > state.absorption) return "acceptance";
    if (state.absorption > state.acceptance) return "absorption";
    return "neutral";
  }
  return "neutral";
}

export function getFinaleAssembly(state: GameState): FinaleAssembly {
  let vera: VeraFinalePresence = "absent";
  if (state.flags.veraLastCampDone) {
    vera = state.flags.veraCampHonest ? "good" : "bad";
  }
  const lin =
    state.flags.linLastCampDone &&
    state.flags.linFinaleChoice != null &&
    state.flags.linFinaleChoice !== "gone";
  return {
    vera,
    lin,
    ira: state.flags.iraLastCampDone,
    iraKuvshinFull: state.integratedEnemyIds.length >= 2,
    figure: state.flags.metFigure,
  };
}
