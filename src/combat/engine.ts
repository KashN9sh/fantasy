import { BASE_DECK_IDS, getBattleCardDef } from "./battleCardDefs";
import { bumpPityAfterDraw, pickWeightedDrawIndex } from "./deckSampling";
import type { BattleEndSummary } from "../game/types";
import type {
  BattleCardDef,
  BattleSamplingContext,
  BattleState,
  MinionInstance,
  TargetRef,
} from "./types";

let uidCounter = 0;
function uid(prefix: string): string {
  uidCounter++;
  return `${prefix}_${uidCounter}`;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function log(state: BattleState, msg: string) {
  state.log.push(msg);
  if (state.log.length > 14) state.log.shift();
}

function dealToCharacter(
  state: BattleState,
  blockRef: { block: number },
  hpRef: { hp: number } | { calm: number } | { resistance: number },
  amount: number,
  name: string,
): void {
  let remaining = amount;
  if (blockRef.block > 0) {
    const absorbed = Math.min(blockRef.block, remaining);
    blockRef.block -= absorbed;
    remaining -= absorbed;
    if (absorbed > 0) log(state, `${name}: блок −${absorbed}.`);
  }
  if (remaining > 0) {
    if ("hp" in hpRef) {
      hpRef.hp -= remaining;
      log(state, `${name}: −${remaining} здоровья.`);
    } else if ("resistance" in hpRef) {
      hpRef.resistance -= remaining;
      log(state, `${name}: −${remaining} устойчивости.`);
    } else {
      hpRef.calm -= remaining;
      log(state, `${name}: −${remaining} спокойствия.`);
    }
  }
}

function tickPoisonOnSide(state: BattleState, side: "player" | "enemy"): void {
  if (side === "enemy") {
    if (state.enemy.poison > 0) {
      const p = state.enemy.poison;
      dealToCharacter(state, state.enemy, state.enemy, p, state.enemy.name);
      state.enemy.poison = Math.max(0, state.enemy.poison - 1);
      if (p > 0) log(state, `Яд: ${p} по ${state.enemy.name} (осталось ${state.enemy.poison}).`);
    }
    for (const m of state.enemyMinions) {
      if (m.poison > 0) {
        const p = m.poison;
        dealToCharacter(state, { block: 0 }, m, p, m.name);
        m.poison = Math.max(0, m.poison - 1);
      }
    }
  } else {
    for (const m of state.playerMinions) {
      if (m.poison > 0) {
        const p = m.poison;
        dealToCharacter(state, { block: 0 }, m, p, m.name);
        m.poison = Math.max(0, m.poison - 1);
      }
    }
    if (state.player.poison > 0) {
      const p = state.player.poison;
      dealToCharacter(state, state.player, state.player, p, "Ты");
      state.player.poison = Math.max(0, state.player.poison - 1);
    }
  }
}

function hasEnemyTaunt(state: BattleState): boolean {
  return state.enemyMinions.some((m) => m.taunt && m.hp > 0);
}

export function legalEnemyTargets(state: BattleState): TargetRef[] {
  const taunt = hasEnemyTaunt(state);
  const out: TargetRef[] = [];
  if (!taunt) out.push({ kind: "enemyHero" });
  for (const m of state.enemyMinions) {
    if (m.hp <= 0) continue;
    if (taunt && !m.taunt) continue;
    out.push({ kind: "enemyMinion", uid: m.uid });
  }
  if (out.length === 0) out.push({ kind: "enemyHero" });
  return out;
}

function getEnemyMinion(state: BattleState, id: string): MinionInstance | undefined {
  return state.enemyMinions.find((m) => m.uid === id);
}

function applyDamageToTarget(
  state: BattleState,
  target: TargetRef,
  damage: number,
  poisonBonus: number,
) {
  let dmg = damage;
  if (target.kind === "enemyHero" || target.kind === "enemyMinion") {
    dmg += state.bonusDamageNextAttack;
    if (state.bonusDamageNextAttack > 0) {
      log(state, `Край: +${state.bonusDamageNextAttack} к удару.`);
    }
    state.bonusDamageNextAttack = 0;
  }
  if (target.kind === "enemyHero") {
    dealToCharacter(state, state.enemy, state.enemy, dmg, state.enemy.name);
    if (poisonBonus > 0) {
      state.enemy.poison += poisonBonus;
      log(state, `+${poisonBonus} яда на ${state.enemy.name}.`);
    }
  } else if (target.kind === "enemyMinion" && target.uid) {
    const m = getEnemyMinion(state, target.uid);
    if (!m || m.hp <= 0) return;
    dealToCharacter(state, { block: 0 }, m, dmg, m.name);
    if (poisonBonus > 0) {
      m.poison += poisonBonus;
      log(state, `+${poisonBonus} яда на ${m.name}.`);
    }
  }
}

function cleanupDeadMinions(state: BattleState) {
  state.enemyMinions = state.enemyMinions.filter((m) => m.hp > 0);
  state.playerMinions = state.playerMinions.filter((m) => m.hp > 0);
}

function checkBattleEnd(state: BattleState): void {
  cleanupDeadMinions(state);
  if (state.enemy.resistance <= 0) {
    state.phase = "won";
    log(state, "Победа!");
    return;
  }
  if (state.player.calm <= 0) {
    state.phase = "lost";
    log(state, "Поражение…");
  }
}

function drawToHandSize(state: BattleState, handSize: number): void {
  const need = Math.max(0, handSize - state.hand.length);
  if (need > 0) drawCards(state, need);
}

function drawCards(state: BattleState, n: number) {
  for (let i = 0; i < n; i++) {
    if (state.drawPile.length === 0) {
      if (state.discardPile.length === 0) break;
      state.drawPile = [...state.discardPile];
      state.discardPile = [];
      shuffleInPlace(state.drawPile, mulberry32(state.turnNumber * 9973));
      log(state, "Колода перетасована из сброса.");
    }
    let id: string | undefined;
    if (state.samplingContext && state.drawPile.length > 0) {
      const idx = pickWeightedDrawIndex(state.drawPile, state.samplingContext);
      const pick = idx >= 0 ? state.drawPile.splice(idx, 1)[0] : undefined;
      id = pick;
      if (id) bumpPityAfterDraw(state.samplingContext, id);
    } else {
      id = state.drawPile.pop();
    }
    if (!id) break;
    state.hand.push({ uid: uid("card"), defId: id });
  }
}

function discardFromHand(state: BattleState, handIndex: number) {
  const c = state.hand.splice(handIndex, 1)[0];
  if (c) state.discardPile.push(c.defId);
}

function summonMinion(
  state: BattleState,
  side: "player" | "enemy",
  s: NonNullable<BattleCardDef["summon"]>,
  defId: string,
) {
  const list = side === "player" ? state.playerMinions : state.enemyMinions;
  if (list.length >= 4) {
    log(state, "Нет места на поле.");
    return false;
  }
  const m: MinionInstance = {
    uid: uid("minion"),
    defId,
    name: s.name,
    atk: s.atk,
    hp: s.hp,
    maxHp: s.hp,
    canAttack: s.rush,
    taunt: s.taunt,
    poison: 0,
  };
  list.push(m);
  log(state, `Призыв: ${s.name} (${s.atk}/${s.hp})${s.rush ? " с натиском" : ""}${s.taunt ? ", провокация" : ""}.`);
  return true;
}

type EnemyAttackTier = { tier: "light" | "medium" | "heavy"; weight: number; min: number; max: number };

const ENEMY_PRESETS: Record<
  string,
  { name: string; level: number; hp: number; intentDamage: number; attacks: EnemyAttackTier[] }
> = {
  hum_unnamed: {
    name: "Гул без названия",
    level: 2,
    hp: 40,
    intentDamage: 0,
    attacks: [
      { tier: "light", weight: 50, min: 0, max: 0 },
      { tier: "medium", weight: 30, min: 0, max: 0 },
      { tier: "heavy", weight: 20, min: 0, max: 0 },
    ],
  },
  trainer_shadow: {
    name: "Тень тревоги",
    level: 6,
    hp: 48,
    intentDamage: 8,
    attacks: [
      { tier: "light", weight: 50, min: 6, max: 7 },
      { tier: "medium", weight: 30, min: 8, max: 9 },
      { tier: "heavy", weight: 20, min: 10, max: 12 },
    ],
  },
  voice_must: {
    name: "Голос «ты должен»",
    level: 6,
    hp: 50,
    intentDamage: 5,
    attacks: [
      { tier: "light", weight: 50, min: 4, max: 5 },
      { tier: "medium", weight: 30, min: 6, max: 7 },
      { tier: "heavy", weight: 20, min: 8, max: 9 },
    ],
  },
  compare_others: {
    name: "Сравнение с другими",
    level: 5,
    hp: 45,
    intentDamage: 4,
    attacks: [
      { tier: "light", weight: 50, min: 3, max: 4 },
      { tier: "medium", weight: 30, min: 5, max: 6 },
      { tier: "heavy", weight: 20, min: 7, max: 8 },
    ],
  },
  shadow_past_decision: {
    name: "Тень прошлого решения",
    level: 8,
    hp: 55,
    intentDamage: 6,
    attacks: [
      { tier: "light", weight: 50, min: 5, max: 6 },
      { tier: "medium", weight: 30, min: 7, max: 8 },
      { tier: "heavy", weight: 20, min: 9, max: 10 },
    ],
  },
  insomnia: {
    name: "Бессонница",
    level: 4,
    hp: 38,
    intentDamage: 0,
    attacks: [
      { tier: "light", weight: 50, min: 0, max: 0 },
      { tier: "medium", weight: 30, min: 0, max: 0 },
      { tier: "heavy", weight: 20, min: 0, max: 0 },
    ],
  },
  expectation_judgment: {
    name: "Ожидание «а что подумают»",
    level: 10,
    hp: 60,
    intentDamage: 7,
    attacks: [
      { tier: "light", weight: 50, min: 6, max: 7 },
      { tier: "medium", weight: 30, min: 8, max: 9 },
      { tier: "heavy", weight: 20, min: 10, max: 12 },
    ],
  },
  root_of_anxiety: {
    name: "Корень тревоги",
    level: 16,
    hp: 72,
    intentDamage: 9,
    attacks: [
      { tier: "light", weight: 50, min: 8, max: 9 },
      { tier: "medium", weight: 30, min: 10, max: 12 },
      { tier: "heavy", weight: 20, min: 13, max: 15 },
    ],
  },
  coalition_anxiety: {
    name: "Коалиция голосов",
    level: 9,
    hp: 52,
    intentDamage: 5,
    attacks: [
      { tier: "light", weight: 50, min: 5, max: 6 },
      { tier: "medium", weight: 30, min: 7, max: 8 },
      { tier: "heavy", weight: 20, min: 9, max: 11 },
    ],
  },
};

/** Мгновенная победа картой по id ([`ENEMY_BATTLES.md`](../../docs/ENEMY_BATTLES.md)) */
const INSTANT_WIN_CARD_VS_ENEMY: Record<string, string[]> = {
  voice_must: ["deck_boundary", "deck_tired_honest"],
  compare_others: ["deck_walk"],
  shadow_past_decision: ["deck_journal"],
  insomnia: ["deck_tea_quiet"],
  expectation_judgment: ["deck_boundary"],
};

export interface CreateBattleOptions {
  seed?: number;
  /** По умолчанию `hum_unnamed` (Гул) */
  enemyId?: string;
  deckIds?: string[];
  /** Взвешенный добор по [`DECK_PROBABILITIES.md`](../../docs/DECK_PROBABILITIES.md) */
  samplingContext?: BattleSamplingContext | null;
  /** Второй враг как enemy-миньон (ENCOUNTER_SYSTEM) */
  allyEnemyId?: string;
  /** Множитель устойчивости и намерения главного врага (реванш) */
  enemyPowerScale?: number;
  /** §3.6: усилить союзного миньона после «понимания» */
  buffAllyMinion?: boolean;
}

function rollEnemyIntent(enemyId: string): { dmg: number; tier: "light" | "medium" | "heavy" } {
  const preset = ENEMY_PRESETS[enemyId] ?? ENEMY_PRESETS.hum_unnamed;
  const attacks = preset.attacks;
  const total = attacks.reduce((s, a) => s + a.weight, 0);
  let r = Math.random() * total;
  for (const a of attacks) {
    r -= a.weight;
    if (r <= 0) {
      const span = a.max - a.min + 1;
      const dmg = a.min + Math.floor(Math.random() * Math.max(1, span));
      return { dmg, tier: a.tier };
    }
  }
  const last = attacks[attacks.length - 1]!;
  return { dmg: last.min, tier: last.tier };
}

function effectiveCardCost(state: BattleState, baseCost: number): number {
  if (state.debuffs.fatigue > 0 || state.debuffs.regret > 0) {
    return baseCost > 0 ? 1 : 0;
  }
  return 0;
}

function removeDebuffByCard(state: BattleState, cardId: string): void {
  if (cardId === "deck_pause" || cardId === "deck_breath_square") {
    state.debuffs.panic = 0;
  }
  if (cardId === "deck_boundary" || cardId === "deck_permission") {
    state.debuffs.guilt = 0;
    state.debuffs.shame = 0;
  }
  if (cardId === "deck_tea_quiet") {
    state.debuffs.fatigue = 0;
  }
  if (cardId === "deck_journal" || cardId === "deck_companion") {
    state.debuffs.regret = 0;
  }
}

function tickDebuffsStartTurn(state: BattleState): void {
  state.debuffs.guilt = Math.max(0, state.debuffs.guilt - 1);
  state.debuffs.shame = Math.max(0, state.debuffs.shame - 1);
  state.debuffs.panic = Math.max(0, state.debuffs.panic - 1);
  state.debuffs.numbness = Math.max(0, state.debuffs.numbness - 1);
  state.debuffs.regret = Math.max(0, state.debuffs.regret - 1);
  if (state.debuffs.fatigue > 0) state.debuffs.fatigue -= 1;
}

function trackCardPlayMeta(state: BattleState, def: BattleCardDef): void {
  state.cardsPlayedTotal++;
  const cat = def.deckCategory ?? "base";
  if (cat === "absorption") {
    state.absorptionPlayStreak++;
    state.acceptancePlayStreak = 0;
  } else if (cat === "acceptance") {
    state.acceptancePlayStreak++;
    state.absorptionPlayStreak = 0;
  } else {
    state.absorptionPlayStreak = 0;
    state.acceptancePlayStreak = 0;
  }
  if (state.absorptionPlayStreak >= 3) state.metaPostAbsorption3 = true;
  if (state.acceptancePlayStreak >= 3) state.metaPostAcceptance3 = true;
}

function pushEchoMinion(state: BattleState, allyId: string, buff: boolean): void {
  const p = ENEMY_PRESETS[allyId] ?? ENEMY_PRESETS.voice_must;
  let atk = 4;
  let hp = Math.max(14, Math.floor(p.hp * 0.38));
  if (buff) {
    atk += 2;
    hp += 10;
  }
  const m: MinionInstance = {
    uid: uid("eminion"),
    defId: "echo",
    name: `${p.name} (эхо)`,
    atk,
    hp,
    maxHp: hp,
    canAttack: true,
    taunt: false,
    poison: 0,
  };
  state.enemyMinions.push(m);
  log(state, `Рядом — эхо: ${m.name} (${atk}/${hp}).`);
}

export function summarizeBattleEnd(state: BattleState): BattleEndSummary {
  const eid = state.battleEnemyId;
  const meta = {
    hadAnyCardPlayed: state.cardsPlayedTotal > 0,
    postAbsorption3: state.metaPostAbsorption3,
    postAcceptance3: state.metaPostAcceptance3,
    postDiscard3: state.metaPostDiscard3,
  };
  if (state.phase === "won") {
    return {
      endKind: "won",
      integrationWin: state.enemy.resistance > 0,
      enemyId: eid,
      ...meta,
    };
  }
  if (state.phase === "lost") {
    return {
      endKind: "lost",
      integrationWin: false,
      enemyId: eid,
      hadAnyCardPlayed: meta.hadAnyCardPlayed,
      postAbsorption3: false,
      postAcceptance3: false,
      postDiscard3: false,
    };
  }
  return {
    endKind: "abandoned",
    integrationWin: false,
    enemyId: eid,
    ...meta,
  };
}

export function createBattle(opts: CreateBattleOptions = {}): BattleState {
  const seed = opts.seed ?? Date.now();
  const rng = mulberry32(seed);
  const enemyId = opts.enemyId ?? "hum_unnamed";
  const preset = ENEMY_PRESETS[enemyId] ?? ENEMY_PRESETS.hum_unnamed;
  const drawPile = [...(opts.deckIds ?? BASE_DECK_IDS)];
  shuffleInPlace(drawPile, rng);
  uidCounter = 0;

  const state: BattleState = {
    phase: "player",
    turnNumber: 1,
    battleEnemyId: enemyId,
    cardsPlayedThisTurn: 0,
    gulCardStreak: 0,
    skipNextPlayerTurn: false,
    insomniaEmptyStreak: 0,
    playedEdgeCard: false,
    player: {
      calm: 5,
      maxCalm: 10,
      block: 0,
      poison: 0,
    },
    poisonOnNextAttack: 0,
    bonusDamageNextAttack: 0,
    enemy: {
      name: preset.name,
      level: preset.level,
      resistance: preset.hp,
      maxResistance: preset.hp,
      block: 0,
      poison: 0,
      intentDamage: preset.intentDamage,
      intentTier: "light",
    },
    debuffs: {
      panic: 0,
      guilt: 0,
      shame: 0,
      fatigue: 0,
      numbness: 0,
      regret: 0,
    },
    playerMinions: [],
    enemyMinions: [],
    hand: [],
    drawPile,
    discardPile: [],
    log: [],
    samplingContext: opts.samplingContext ?? null,
    cardsPlayedTotal: 0,
    absorptionPlayStreak: 0,
    acceptancePlayStreak: 0,
    turnsNoCardEnd: 0,
    metaPostAbsorption3: false,
    metaPostAcceptance3: false,
    metaPostDiscard3: false,
  };

  const scale = opts.enemyPowerScale ?? 1;
  if (scale > 1) {
    state.enemy.maxResistance = Math.floor(state.enemy.maxResistance * scale);
    state.enemy.resistance = state.enemy.maxResistance;
    state.enemy.intentDamage = Math.floor(state.enemy.intentDamage * scale);
    state.enemy.level += Math.max(1, Math.floor(scale - 1));
    log(state, `Враг возвращается сильнее (×${scale}).`);
  }

  if (enemyId === "coalition_anxiety") {
    pushEchoMinion(state, "voice_must", false);
  }
  if (opts.allyEnemyId) {
    pushEchoMinion(state, opts.allyEnemyId, opts.buffAllyMinion ?? false);
  }

  const openingIntent = rollEnemyIntent(enemyId);
  state.enemy.intentDamage = openingIntent.dmg;
  state.enemy.intentTier = openingIntent.tier;

  log(state, "Бой! Сначала тикает яд на враге, потом возьми карты.");
  tickPoisonOnSide(state, "enemy");
  checkBattleEnd(state);
  if (state.phase !== "player") return state;
  drawCards(state, 5);
  return state;
}

export function canPlayCard(state: BattleState, handIndex: number): boolean {
  if (state.phase !== "player") return false;
  const hc = state.hand[handIndex];
  if (!hc) return false;
  const def = getBattleCardDef(hc.defId);
  if (!def) return false;
  if (state.debuffs.numbness > 0 && def.id === "deck_ask_help") return false;
  if (state.debuffs.panic > 0 && def.id === "silence_finale") return false;
  const strainCost = effectiveCardCost(state, def.cost);
  if (state.player.calm <= strainCost) return false;
  if (def.needsEnemyTarget) {
    return def.damage != null || def.damageFromHandSize != null;
  }
  return true;
}

export function playCard(state: BattleState, handIndex: number, target?: TargetRef): string | null {
  if (state.phase !== "player") return "Не твой ход.";
  const hc = state.hand[handIndex];
  if (!hc) return "Нет карты.";
  const def = getBattleCardDef(hc.defId);
  if (!def) return "Неизвестная карта.";
  if (state.debuffs.numbness > 0 && def.id === "deck_ask_help") {
    return "Онемение не даёт попросить о помощи.";
  }
  if (state.debuffs.panic > 0 && def.id === "silence_finale") {
    return "Паника мешает сыграть «Тишину».";
  }
  const cardCost = effectiveCardCost(state, def.cost);
  if (state.player.calm <= cardCost) return "Слишком тяжело: не хватает спокойствия.";

  if (def.needsEnemyTarget) {
    if (!target) return "Нужна цель.";
    const legal = legalEnemyTargets(state);
    const ok = legal.some(
      (t) =>
        t.kind === target.kind &&
        (t.kind !== "enemyMinion" || t.uid === target.uid),
    );
    if (!ok) return "Недопустимая цель.";
  }

  if (cardCost > 0) {
    state.player.calm = Math.max(0, state.player.calm - cardCost);
    log(state, `Напряжение: −${cardCost} спокойствия.`);
  }
  state.cardsPlayedThisTurn++;
  trackCardPlayMeta(state, def);

  if (
    def.instantWinIfEnemyId?.length &&
    state.battleEnemyId &&
    def.instantWinIfEnemyId.includes(state.battleEnemyId)
  ) {
    log(state, "Ты находишь паузу — можно не бороться с гулом, а просто быть.");
    discardFromHand(state, handIndex);
    removeDebuffByCard(state, def.id);
    state.phase = "won";
    return null;
  }

  if (
    def.instantWinIfAcceptanceAtLeast != null &&
    state.samplingContext &&
    state.samplingContext.acceptance >= def.instantWinIfAcceptanceAtLeast
  ) {
    log(state, "Тишина принятия — бой обрывается без победителя.");
    discardFromHand(state, handIndex);
    removeDebuffByCard(state, def.id);
    state.phase = "won";
    return null;
  }

  const winCards =
    state.battleEnemyId && INSTANT_WIN_CARD_VS_ENEMY[state.battleEnemyId];
  if (winCards?.includes(def.id)) {
    log(state, "Карта попадает в слабое место — враг отступает.");
    discardFromHand(state, handIndex);
    removeDebuffByCard(state, def.id);
    state.phase = "won";
    return null;
  }

  if (def.kind === "buff" && (def.addPoisonToNextAttack || def.addBonusDamageNextAttack)) {
    if (def.addPoisonToNextAttack) {
      state.poisonOnNextAttack += def.addPoisonToNextAttack;
      log(state, `Клинок отравлен (+${def.addPoisonToNextAttack}). Всего на следующий удар: ${state.poisonOnNextAttack}.`);
    }
    if (def.addBonusDamageNextAttack) {
      state.bonusDamageNextAttack += def.addBonusDamageNextAttack;
      state.playedEdgeCard = true;
      log(state, `К следующей атаке +${def.addBonusDamageNextAttack} урона.`);
    }
    discardFromHand(state, handIndex);
    removeDebuffByCard(state, def.id);
    checkBattleEnd(state);
    return null;
  }

  if (def.id === "deck_stand") {
    const n = state.samplingContext?.integratedEnemyIds.length ?? 0;
    const b = Math.min(6, Math.max(1, n));
    state.player.block += b;
    log(state, `Стоять: +${b} блока.`);
    discardFromHand(state, handIndex);
    removeDebuffByCard(state, def.id);
    checkBattleEnd(state);
    return null;
  }

  const utilHealEnergyBlockDraw =
    def.healPlayer != null ||
    def.gainCalm != null ||
    def.calmToMax ||
    def.skipNextPlayerTurn ||
    def.block != null ||
    def.draw != null;

  if (utilHealEnergyBlockDraw) {
    if (def.healPlayer != null) {
      const before = state.player.calm;
      state.player.calm = Math.min(state.player.maxCalm, state.player.calm + def.healPlayer);
      log(state, `+${state.player.calm - before} спокойствия.`);
    }
    if (def.gainCalm != null) {
      const before = state.player.calm;
      state.player.calm = Math.min(state.player.maxCalm, state.player.calm + def.gainCalm);
      log(state, `+${state.player.calm - before} спокойствия.`);
    }
    if (def.calmToMax) {
      state.player.calm = state.player.maxCalm;
      log(state, "Спокойствие восстановлено до максимума.");
    }
    if (def.skipNextPlayerTurn) {
      state.skipNextPlayerTurn = true;
      log(state, "Следующий ход будет пропущен.");
    }
    if (def.block != null) {
      state.player.block += def.block;
      log(state, `+${def.block} блока.`);
    }
    if (def.draw != null) {
      drawCards(state, def.draw);
      log(state, `Взято карт: ${def.draw}.`);
    }
    discardFromHand(state, handIndex);
    removeDebuffByCard(state, def.id);
    checkBattleEnd(state);
    return null;
  }

  if (def.kind === "summon" && def.summon) {
    const ok = summonMinion(state, "player", def.summon, def.id);
    if (!ok) {
      if (cardCost > 0) {
        state.player.calm = Math.min(state.player.maxCalm, state.player.calm + cardCost);
      }
      state.cardsPlayedThisTurn--;
      state.cardsPlayedTotal = Math.max(0, state.cardsPlayedTotal - 1);
      return "Поле заполнено.";
    }
    discardFromHand(state, handIndex);
    removeDebuffByCard(state, def.id);
    checkBattleEnd(state);
    return null;
  }

  if (def.aoeDamage) {
    dealToCharacter(state, state.enemy, state.enemy, def.aoeDamage, state.enemy.name);
    for (const m of [...state.enemyMinions]) {
      if (m.hp > 0) dealToCharacter(state, { block: 0 }, m, def.aoeDamage, m.name);
    }
    log(state, `Урон по всем врагам: ${def.aoeDamage}.`);
    discardFromHand(state, handIndex);
    removeDebuffByCard(state, def.id);
    checkBattleEnd(state);
    return null;
  }

  if ((def.damage != null || def.damageFromHandSize) && target) {
    let dmg = def.damage ?? 0;
    if (def.damageFromHandSize) {
      dmg = Math.min(def.damageFromHandSize.cap, state.hand.length);
      log(state, `Список сделанного: урон ${dmg} (карт в руке: ${state.hand.length}).`);
    }
    const poisonBonus =
      def.kind === "attack" || (def.kind === "spell" && def.needsEnemyTarget)
        ? state.poisonOnNextAttack
        : 0;
    applyDamageToTarget(state, target, dmg, poisonBonus);
    if (poisonBonus > 0) {
      state.poisonOnNextAttack = 0;
      log(state, "Яд с клинка перенесён в цель.");
    }
    if (def.selfDamageAfterHit) {
      dealToCharacter(state, state.player, state.player, def.selfDamageAfterHit, "Ты");
      log(state, `Ты платишь ${def.selfDamageAfterHit} спокойствия.`);
    }
    discardFromHand(state, handIndex);
    removeDebuffByCard(state, def.id);
    checkBattleEnd(state);
    return null;
  }

  if (cardCost > 0) {
    state.player.calm = Math.min(state.player.maxCalm, state.player.calm + cardCost);
  }
  state.cardsPlayedThisTurn--;
  return "Карта не реализована.";
}

function hasPlayerTaunt(state: BattleState): boolean {
  return state.playerMinions.some((m) => m.taunt && m.hp > 0);
}

function pickPlayerSideTarget(
  state: BattleState,
): { block: { block: number }; hp: { hp: number } | { calm: number }; name: string } {
  if (hasPlayerTaunt(state)) {
    const taunts = state.playerMinions.filter((m) => m.taunt && m.hp > 0);
    const m = taunts[Math.floor(Math.random() * taunts.length)]!;
    return { block: { block: 0 }, hp: m, name: m.name };
  }
  if (state.playerMinions.length > 0) {
    const m = state.playerMinions[Math.floor(Math.random() * state.playerMinions.length)]!;
    return { block: { block: 0 }, hp: m, name: m.name };
  }
  return { block: state.player, hp: state.player, name: "Ты" };
}

function enemyTurn(state: BattleState) {
  if (state.phase !== "enemy") return;
  log(state, `Ход ${state.enemy.name}.`);

  tickPoisonOnSide(state, "player");
  checkBattleEnd(state);
  if (state.phase !== "enemy") return;

  state.enemy.block = 0;

  for (const m of state.enemyMinions) {
    if (m.hp <= 0 || !m.canAttack) continue;
    const t = pickPlayerSideTarget(state);
    dealToCharacter(state, t.block, t.hp, m.atk, t.name);
    m.canAttack = false;
    checkBattleEnd(state);
    if (state.phase !== "enemy") return;
  }

  const t2 = pickPlayerSideTarget(state);
  let intent = state.enemy.intentDamage;
  if (state.battleEnemyId === "compare_others" && state.player.block > 0) {
    intent += 2;
    log(state, "Сравнение подхватывает твой барьер (+2 к удару).");
  }
  if (state.battleEnemyId === "expectation_judgment") {
    intent += 4;
    state.debuffs.shame = Math.max(state.debuffs.shame, 2);
    log(state, "Стыд: защита ослабевает.");
  }
  if (state.battleEnemyId === "voice_must") {
    state.debuffs.guilt = Math.max(state.debuffs.guilt, 2);
    if (Math.random() < 0.35) state.debuffs.panic = Math.max(state.debuffs.panic, 1);
  }
  if (state.battleEnemyId === "shadow_past_decision") {
    state.debuffs.regret = Math.max(state.debuffs.regret, 2);
  }
  if (state.battleEnemyId === "insomnia") {
    state.debuffs.fatigue = Math.max(state.debuffs.fatigue, 2);
  }
  const guiltPenalty = state.debuffs.guilt > 0 ? 1 : 0;
  const shamePenalty = state.debuffs.shame > 0 ? 2 : 0;
  const finalBlock = Math.max(0, t2.block.block - guiltPenalty - shamePenalty);
  if (guiltPenalty || shamePenalty) {
    log(state, `Дебаффы снижают защиту на ${guiltPenalty + shamePenalty}.`);
  }
  if (intent > 0) {
    dealToCharacter(state, { block: finalBlock }, t2.hp, intent, t2.name);
    log(state, `${state.enemy.name} наносит удар (${intent}).`);
  } else {
    log(state, `${state.enemy.name} не бьёт напрямую.`);
  }

  const id = state.battleEnemyId ?? "hum_unnamed";
  const nextIntent = rollEnemyIntent(id);
  state.enemy.intentDamage = nextIntent.dmg;
  state.enemy.intentTier = nextIntent.tier;

  for (const m of state.enemyMinions) {
    m.canAttack = true;
  }

  checkBattleEnd(state);
  if (state.phase === "enemy") beginPlayerTurn(state);
}

function beginPlayerTurn(state: BattleState) {
  state.phase = "player";
  state.turnNumber++;
  state.player.block = 0;
  log(state, `Твой ход (${state.turnNumber}).`);
  tickDebuffsStartTurn(state);

  if (state.samplingContext) {
    state.samplingContext.turnNumber = state.turnNumber;
  }

  if (state.skipNextPlayerTurn) {
    state.skipNextPlayerTurn = false;
    log(state, "Ты пропускаешь ход…");
    for (const c of state.hand) {
      state.discardPile.push(c.defId);
    }
    state.hand = [];
    state.phase = "enemy";
    enemyTurn(state);
    return;
  }

  tickPoisonOnSide(state, "enemy");
  checkBattleEnd(state);
  if (state.phase !== "player") return;

  state.cardsPlayedThisTurn = 0;

  state.player.calm = Math.min(state.player.maxCalm, state.player.calm + 1);
  log(state, "Начало хода: +1 спокойствие.");
  if (state.debuffs.panic > 0) log(state, "Паника мешает держать ритм.");
  for (const m of state.playerMinions) {
    m.canAttack = true;
  }

  drawToHandSize(state, 5);
}

export function endPlayerTurn(state: BattleState): string | null {
  if (state.phase !== "player") return "Сейчас не твой ход.";

  if (state.battleEnemyId === "insomnia") {
    if (state.cardsPlayedThisTurn === 0) {
      state.insomniaEmptyStreak++;
      log(state, `Тихий ход… (${state.insomniaEmptyStreak}/3)`);
      if (state.insomniaEmptyStreak >= 3) {
        state.phase = "won";
        log(state, "Три тихих хода — ты засыпаешь. Бессонница отступает.");
        return null;
      }
    } else {
      state.insomniaEmptyStreak = 0;
      dealToCharacter(state, state.player, state.player, 2, "Ты");
      log(state, "Усталость не отпускает (−2 спокойствия).");
    }
    checkBattleEnd(state);
    if (state.phase !== "player") return null;
  }

  if (state.battleEnemyId === "hum_unnamed") {
    if (state.cardsPlayedThisTurn === 0) {
      dealToCharacter(state, state.player, state.player, 2, "Ты");
      log(state, "Ты не сыграл ни одной карты — гул забирает опору (−2 спокойствия).");
      state.gulCardStreak = 0;
    } else {
      state.gulCardStreak++;
      log(state, `Рядом с собой: ${state.gulCardStreak}/3 хода подряд с картой.`);
      if (state.gulCardStreak >= 3) {
        state.phase = "won";
        log(state, "Три хода подряд ты не замираешь. Гул отступает.");
        return null;
      }
    }
    checkBattleEnd(state);
    if (state.phase !== "player") return null;
  }

  const bid = state.battleEnemyId;
  if (bid !== "hum_unnamed" && bid !== "insomnia") {
    if (state.cardsPlayedThisTurn === 0) {
      state.turnsNoCardEnd++;
      if (state.turnsNoCardEnd >= 3) state.metaPostDiscard3 = true;
    } else {
      state.turnsNoCardEnd = 0;
    }
  }

  state.phase = "enemy";
  for (const c of state.hand) {
    state.discardPile.push(c.defId);
  }
  state.hand = [];
  log(state, "Конец хода — сброс руки.");
  enemyTurn(state);
  return null;
}

export function minionAttack(
  state: BattleState,
  minionUid: string,
  target: TargetRef,
): string | null {
  if (state.phase !== "player") return "Не твой ход.";
  const m = state.playerMinions.find((x) => x.uid === minionUid);
  if (!m || m.hp <= 0) return "Нет такого миньона.";
  if (!m.canAttack) return "Уже атаковал или призван в этот ход.";

  if (target.kind !== "enemyHero" && target.kind !== "enemyMinion") {
    return "Бей только врага.";
  }
  const legal = legalEnemyTargets(state);
  const ok = legal.some(
    (t) => t.kind === target.kind && (t.kind !== "enemyMinion" || t.uid === target.uid),
  );
  if (!ok) return "Нужна другая цель (провокация?).";

  const poisonBonus = state.poisonOnNextAttack;
  applyDamageToTarget(state, target, m.atk, poisonBonus);
  if (poisonBonus > 0) {
    state.poisonOnNextAttack = 0;
    log(state, "Миньон перенёс яд с клинка!");
  }
  m.canAttack = false;
  checkBattleEnd(state);
  return null;
}
