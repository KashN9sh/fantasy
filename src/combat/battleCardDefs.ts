import type { BattleCardDef } from "./types";
import { EXTENDED_CARD_DEFS } from "./extendedCardDefs";

/** Базовые карты «Тихая тропа» ([`DECK.md`](../../docs/DECK.md)) — упрощённые эффекты для прототипа боя */
const CORE_CARD_DEFS: BattleCardDef[] = [
  {
    id: "deck_pause",
    name: "Пауза",
    cost: 1,
    icon: "✋",
    desc: "+3 блока. Против «Гула» — принять тишину и закончить бой.",
    needsEnemyTarget: false,
    kind: "utility",
    block: 3,
    instantWinIfEnemyId: ["hum_unnamed"],
    deckCategory: "base",
  },
  {
    id: "deck_boundary",
    name: "Граница",
    cost: 2,
    icon: "⬚",
    desc: "Барьер: +4 блока.",
    needsEnemyTarget: false,
    kind: "utility",
    block: 4,
    deckCategory: "base",
  },
  {
    id: "deck_breath_square",
    name: "Дыхание «квадрат»",
    cost: 1,
    icon: "▢",
    desc: "+2 энергии в этом ходу.",
    needsEnemyTarget: false,
    kind: "utility",
    addEnergy: 2,
    deckCategory: "base",
  },
  {
    id: "deck_tired_honest",
    name: "Честное «я устал»",
    cost: 2,
    icon: "🌒",
    desc: "Полная энергия. Следующий ход пропускаешь.",
    needsEnemyTarget: false,
    kind: "utility",
    energyToMax: true,
    skipNextPlayerTurn: true,
    deckCategory: "base",
  },
  {
    id: "deck_tea_quiet",
    name: "Горячий чай в тишине",
    cost: 1,
    icon: "🫖",
    desc: "Восстанови 6 ОЗ.",
    needsEnemyTarget: false,
    kind: "utility",
    healPlayer: 6,
    deckCategory: "base",
  },
  {
    id: "deck_walk",
    name: "Прогулка без цели",
    cost: 1,
    icon: "🛤",
    desc: "Возьми 1 карту.",
    needsEnemyTarget: false,
    kind: "utility",
    draw: 1,
    deckCategory: "base",
  },
  {
    id: "deck_journal",
    name: "Дневник",
    cost: 1,
    icon: "📓",
    desc: "Возьми 2 карты.",
    needsEnemyTarget: false,
    kind: "utility",
    draw: 2,
    deckCategory: "base",
  },
  {
    id: "deck_ask_help",
    name: "Просьба о помощи",
    cost: 0,
    icon: "🤝",
    desc: "Возьми 1 карту.",
    needsEnemyTarget: false,
    kind: "utility",
    draw: 1,
    deckCategory: "base",
  },
];

export const BATTLE_CARD_DEFS: BattleCardDef[] = [...CORE_CARD_DEFS, ...EXTENDED_CARD_DEFS];

const defMap = new Map(BATTLE_CARD_DEFS.map((c) => [c.id, c]));

export function getBattleCardDef(id: string): BattleCardDef | undefined {
  return defMap.get(id);
}

/** Рамка карты в UI */
export function getBattleCardFrame(d: BattleCardDef): {
  stars: number;
  atk: number;
  def: number;
  attr: "dark" | "fire" | "earth" | "light" | "water";
} {
  const stars = Math.min(6, Math.max(1, d.cost === 0 ? 1 : d.cost + 2));
  if (d.healPlayer != null) {
    return { stars, atk: 0, def: d.healPlayer, attr: "light" };
  }
  if (d.addEnergy != null) {
    return { stars, atk: 0, def: d.addEnergy, attr: "water" };
  }
  if (d.energyToMax) {
    return { stars, atk: 0, def: 3, attr: "light" };
  }
  if (d.damageFromHandSize) {
    return { stars, atk: d.damageFromHandSize.cap, def: 0, attr: "dark" };
  }
  if (d.damage != null) {
    return { stars, atk: d.damage, def: 0, attr: d.kind === "spell" ? "fire" : "dark" };
  }
  if (d.aoeDamage != null) {
    return { stars, atk: d.aoeDamage, def: 0, attr: "fire" };
  }
  if (d.block != null) {
    return { stars, atk: 0, def: d.block, attr: "light" };
  }
  if (d.addPoisonToNextAttack) {
    return { stars, atk: 0, def: d.addPoisonToNextAttack, attr: "dark" };
  }
  if (d.addBonusDamageNextAttack) {
    return { stars, atk: d.addBonusDamageNextAttack, def: 0, attr: "fire" };
  }
  if (d.draw) {
    return { stars, atk: 0, def: d.draw, attr: "water" };
  }
  return { stars, atk: 0, def: 0, attr: "earth" };
}

/** Стартовая колода: по 2 копии каждой базовой карты */
export const BASE_DECK_IDS: string[] = [
  "deck_pause",
  "deck_pause",
  "deck_boundary",
  "deck_boundary",
  "deck_breath_square",
  "deck_breath_square",
  "deck_tired_honest",
  "deck_tired_honest",
  "deck_tea_quiet",
  "deck_tea_quiet",
  "deck_walk",
  "deck_walk",
  "deck_journal",
  "deck_journal",
  "deck_ask_help",
  "deck_ask_help",
];

/** @deprecated используйте BASE_DECK_IDS */
export const STARTER_DECK_IDS = BASE_DECK_IDS;
