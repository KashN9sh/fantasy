import { BASE_DECK_IDS, getBattleCardDef } from "./battleCardDefs";
import { bumpPityAfterDraw, pickWeightedDrawIndex } from "./deckSampling";
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
  hpRef: { hp: number },
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
    hpRef.hp -= remaining;
    log(state, `${name}: −${remaining} ОЗ.`);
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
  if (state.enemy.hp <= 0) {
    state.phase = "won";
    log(state, "Победа!");
    return;
  }
  if (state.player.hp <= 0) {
    state.phase = "lost";
    log(state, "Поражение…");
  }
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

const ENEMY_PRESETS: Record<string, { name: string; hp: number; intentDamage: number }> = {
  hum_unnamed: { name: "Гул без названия", hp: 40, intentDamage: 0 },
  trainer_shadow: { name: "Тень тревоги", hp: 48, intentDamage: 8 },
  voice_must: { name: "Голос «ты должен»", hp: 50, intentDamage: 5 },
  compare_others: { name: "Сравнение с другими", hp: 45, intentDamage: 4 },
  shadow_past_decision: { name: "Тень прошлого решения", hp: 55, intentDamage: 6 },
  insomnia: { name: "Бессонница", hp: 38, intentDamage: 0 },
  expectation_judgment: { name: "Ожидание «а что подумают»", hp: 60, intentDamage: 7 },
  root_of_anxiety: { name: "Корень тревоги", hp: 72, intentDamage: 9 },
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
      hp: 70,
      maxHp: 70,
      block: 0,
      energy: 3,
      maxEnergy: 3,
      poison: 0,
    },
    poisonOnNextAttack: 0,
    bonusDamageNextAttack: 0,
    enemy: {
      name: preset.name,
      hp: preset.hp,
      maxHp: preset.hp,
      block: 0,
      poison: 0,
      intentDamage: preset.intentDamage,
    },
    playerMinions: [],
    enemyMinions: [],
    hand: [],
    drawPile,
    discardPile: [],
    log: [],
    samplingContext: opts.samplingContext ?? null,
  };

  if (enemyId === "voice_must") {
    state.player.maxEnergy = 2;
    state.player.energy = 2;
    log(state, "Голос «ты должен»: нехватка готовности — только 2 энергии в первом ходу.");
  }

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
  if (state.player.energy < def.cost) return false;
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
  if (state.player.energy < def.cost) return "Мало энергии.";

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

  state.player.energy -= def.cost;
  state.cardsPlayedThisTurn++;

  if (
    def.instantWinIfEnemyId?.length &&
    state.battleEnemyId &&
    def.instantWinIfEnemyId.includes(state.battleEnemyId)
  ) {
    log(state, "Ты находишь паузу — можно не бороться с гулом, а просто быть.");
    discardFromHand(state, handIndex);
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
    state.phase = "won";
    return null;
  }

  const winCards =
    state.battleEnemyId && INSTANT_WIN_CARD_VS_ENEMY[state.battleEnemyId];
  if (winCards?.includes(def.id)) {
    log(state, "Карта попадает в слабое место — враг отступает.");
    discardFromHand(state, handIndex);
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
    checkBattleEnd(state);
    return null;
  }

  if (def.id === "deck_stand") {
    const n = state.samplingContext?.integratedEnemyIds.length ?? 0;
    const b = Math.min(6, Math.max(1, n));
    state.player.block += b;
    log(state, `Стоять: +${b} блока.`);
    discardFromHand(state, handIndex);
    checkBattleEnd(state);
    return null;
  }

  const utilHealEnergyBlockDraw =
    def.healPlayer != null ||
    def.addEnergy != null ||
    def.energyToMax ||
    def.skipNextPlayerTurn ||
    def.block != null ||
    def.draw != null;

  if (utilHealEnergyBlockDraw) {
    if (def.healPlayer != null) {
      const before = state.player.hp;
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + def.healPlayer);
      log(state, `+${state.player.hp - before} ОЗ.`);
    }
    if (def.addEnergy != null) {
      state.player.energy = Math.min(
        state.player.maxEnergy,
        state.player.energy + def.addEnergy,
      );
      log(state, `Энергия +${def.addEnergy}.`);
    }
    if (def.energyToMax) {
      state.player.energy = state.player.maxEnergy;
      log(state, "Энергия на максимум.");
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
    checkBattleEnd(state);
    return null;
  }

  if (def.kind === "summon" && def.summon) {
    const ok = summonMinion(state, "player", def.summon, def.id);
    if (!ok) {
      state.player.energy += def.cost;
      state.cardsPlayedThisTurn--;
      return "Поле заполнено.";
    }
    discardFromHand(state, handIndex);
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
      log(state, `Ты платишь ${def.selfDamageAfterHit} ОЗ.`);
    }
    discardFromHand(state, handIndex);
    checkBattleEnd(state);
    return null;
  }

  state.player.energy += def.cost;
  state.cardsPlayedThisTurn--;
  return "Карта не реализована.";
}

function hasPlayerTaunt(state: BattleState): boolean {
  return state.playerMinions.some((m) => m.taunt && m.hp > 0);
}

function pickPlayerSideTarget(state: BattleState): { block: { block: number }; hp: { hp: number }; name: string } {
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
  }
  if (intent > 0) {
    dealToCharacter(state, t2.block, t2.hp, intent, t2.name);
    log(state, `${state.enemy.name} наносит удар (${intent}).`);
  } else {
    log(state, `${state.enemy.name} не бьёт напрямую.`);
  }

  const id = state.battleEnemyId;
  if (id === "hum_unnamed" || id === "insomnia") {
    state.enemy.intentDamage = 0;
  } else if (id === "voice_must") {
    state.enemy.intentDamage = 4 + Math.floor(Math.random() * 4);
  } else if (id === "compare_others") {
    state.enemy.intentDamage = 3 + Math.floor(Math.random() * 4);
  } else if (id === "shadow_past_decision") {
    state.enemy.intentDamage = 5 + Math.floor(Math.random() * 4);
  } else if (id === "expectation_judgment") {
    state.enemy.intentDamage = 6 + Math.floor(Math.random() * 5);
  } else {
    state.enemy.intentDamage = 6 + Math.floor(Math.random() * 5);
  }

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

  if (state.turnNumber === 2 && state.battleEnemyId === "voice_must") {
    state.player.maxEnergy = 3;
    log(state, "Голос ослабевает — снова 3 энергии.");
  }
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

  state.player.energy = state.player.maxEnergy;
  for (const m of state.playerMinions) {
    m.canAttack = true;
  }

  drawCards(state, 1);
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
      log(state, "Усталость не отпускает (−2 ОЗ).");
    }
    checkBattleEnd(state);
    if (state.phase !== "player") return null;
  }

  if (state.battleEnemyId === "hum_unnamed") {
    if (state.cardsPlayedThisTurn === 0) {
      dealToCharacter(state, state.player, state.player, 2, "Ты");
      log(state, "Ты не сыграл ни одной карты — гул забирает опору (−2 ОЗ).");
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
