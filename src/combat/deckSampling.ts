import type { BattleSamplingContext, DeckCardCategory } from "./types";
import { getBattleCardDef } from "./battleCardDefs";

function weightForCategory(cat: DeckCardCategory, ctx: BattleSamplingContext): number {
  const acc = ctx.acceptance;
  const abs = ctx.absorption;
  const domAcc = acc >= 4 && acc > abs;
  const domAbs = abs >= 4 && abs > acc;
  const shallow = ctx.integratedEnemyIds.length <= 2;

  if (shallow) {
    if (cat === "base") return 0.7;
    if (cat === "integration") return 0.2;
    if (cat === "npc") return 0.08;
    if (cat === "rare") return 0.02;
    if (cat === "acceptance" || cat === "absorption") return 0;
    return 0.1;
  }

  if (domAcc) {
    if (cat === "base") return 0.35;
    if (cat === "acceptance") return 0.4;
    if (cat === "integration") return 0.15;
    if (cat === "npc") return 0.08;
    if (cat === "rare") return 0.02;
    return 0.05;
  }

  if (domAbs) {
    if (cat === "base") return 0.35;
    if (cat === "absorption") return 0.4;
    if (cat === "integration") return 0.15;
    if (cat === "npc") return 0.08;
    if (cat === "rare") return 0.02;
    return 0.05;
  }

  if (cat === "base") return 0.55;
  if (cat === "acceptance") return 0.15;
  if (cat === "absorption") return 0.15;
  if (cat === "integration") return 0.12;
  if (cat === "npc") return 0.05;
  if (cat === "rare") return 0.03;
  return 0.1;
}

/**
 * Индекс карты в куче добора (см. [`DECK_PROBABILITIES.md`](../../docs/DECK_PROBABILITIES.md)).
 * Soft pity: если категория давно не выпадала — слегка усиливаем вес.
 */
export function pickWeightedDrawIndex(
  drawPile: string[],
  ctx: BattleSamplingContext,
): number {
  if (drawPile.length === 0) return -1;
  if (drawPile.length === 1) return 0;

  const weights = drawPile.map((id) => {
    const def = getBattleCardDef(id);
    const cat: DeckCardCategory = def?.deckCategory ?? "base";
    let w = weightForCategory(cat, ctx);
    const since = ctx.pitySinceCategory[cat] ?? 0;
    if (since > 3) w *= 1 + Math.min(0.4, since * 0.05);
    return Math.max(0.01, w);
  });

  const sum = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return i;
  }
  return drawPile.length - 1;
}

export function bumpPityAfterDraw(
  ctx: BattleSamplingContext,
  drawnId: string,
): void {
  const drawnCat = getBattleCardDef(drawnId)?.deckCategory ?? "base";
  const cats: DeckCardCategory[] = [
    "base",
    "acceptance",
    "absorption",
    "integration",
    "npc",
    "rare",
  ];
  for (const c of cats) {
    ctx.pitySinceCategory[c] = (ctx.pitySinceCategory[c] ?? 0) + 1;
  }
  ctx.pitySinceCategory[drawnCat] = 0;
}
