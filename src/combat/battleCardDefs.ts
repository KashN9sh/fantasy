import type { BattleCardDef } from "./types";

export const BATTLE_CARD_DEFS: BattleCardDef[] = [
  {
    id: "strike",
    name: "Удар",
    cost: 1,
    icon: "⚔️",
    desc: "Нанести 5 урона врагу.",
    needsEnemyTarget: true,
    kind: "attack",
    damage: 5,
  },
  {
    id: "heavy_strike",
    name: "Тяжёлый удар",
    cost: 2,
    icon: "🗡️",
    desc: "Нанести 10 урона врагу.",
    needsEnemyTarget: true,
    kind: "attack",
    damage: 10,
  },
  {
    id: "poison_blade",
    name: "Яд на клинок",
    cost: 1,
    icon: "☠️",
    desc: "Следующий удар картой добавит 4 яда цели.",
    needsEnemyTarget: false,
    kind: "buff",
    addPoisonToNextAttack: 4,
  },
  {
    id: "firebolt",
    name: "Огненный болт",
    cost: 2,
    icon: "🔥",
    desc: "Нанести 7 урона выбранному врагу.",
    needsEnemyTarget: true,
    kind: "spell",
    damage: 7,
  },
  {
    id: "swipe",
    name: "Размах",
    cost: 2,
    icon: "💨",
    desc: "3 урона всем врагам.",
    needsEnemyTarget: false,
    kind: "spell",
    aoeDamage: 3,
  },
  {
    id: "shield",
    name: "Щит",
    cost: 1,
    icon: "🛡️",
    desc: "Получить 6 блока.",
    needsEnemyTarget: false,
    kind: "utility",
    block: 6,
  },
  {
    id: "scout",
    name: "Взять круг",
    cost: 0,
    icon: "👁️",
    desc: "Взять 2 карты.",
    needsEnemyTarget: false,
    kind: "utility",
    draw: 2,
  },
  {
    id: "boar",
    name: "Кабан",
    cost: 1,
    icon: "🐗",
    desc: "Призыв 3/2 с натиском (атакует в этот ход).",
    needsEnemyTarget: false,
    kind: "summon",
    summon: { name: "Кабан", atk: 3, hp: 2, taunt: false, rush: true },
  },
  {
    id: "warden",
    name: "Лесной страж",
    cost: 2,
    icon: "🌳",
    desc: "Призыв 2/5 с провокацией.",
    needsEnemyTarget: false,
    kind: "summon",
    summon: { name: "Страж", atk: 2, hp: 5, taunt: true, rush: false },
  },
  {
    id: "sprite",
    name: "Спрайт",
    cost: 1,
    icon: "✨",
    desc: "Призыв 1/3.",
    needsEnemyTarget: false,
    kind: "summon",
    summon: { name: "Спрайт", atk: 1, hp: 3, taunt: false, rush: false },
  },
];

const defMap = new Map(BATTLE_CARD_DEFS.map((c) => [c.id, c]));

export function getBattleCardDef(id: string): BattleCardDef | undefined {
  return defMap.get(id);
}

/** Отображение в «рамке монстра»: уровень, ATK/DEF внизу */
export function getBattleCardFrame(d: BattleCardDef): {
  stars: number;
  atk: number;
  def: number;
  attr: "dark" | "fire" | "earth" | "light" | "water";
} {
  const stars = Math.min(6, Math.max(1, d.cost === 0 ? 1 : d.cost + 2));
  if (d.summon) {
    return { stars, atk: d.summon.atk, def: d.summon.hp, attr: "earth" };
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
  if (d.draw) {
    return { stars, atk: 0, def: d.draw, attr: "water" };
  }
  return { stars, atk: 0, def: 0, attr: "dark" };
}

/** Стартовая колода для демо-боя */
export const STARTER_DECK_IDS: string[] = [
  "strike",
  "strike",
  "strike",
  "strike",
  "heavy_strike",
  "heavy_strike",
  "poison_blade",
  "poison_blade",
  "firebolt",
  "firebolt",
  "swipe",
  "shield",
  "shield",
  "boar",
  "boar",
  "warden",
  "sprite",
  "sprite",
  "scout",
  "scout",
];
