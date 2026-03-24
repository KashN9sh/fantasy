import { STARTER_DECK_IDS, getBattleCardDef } from "./battleCardDefs";
import type { BattleCardDef, BattleState, MinionInstance, TargetRef } from "./types";

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
  if (target.kind === "enemyHero") {
    dealToCharacter(state, state.enemy, state.enemy, damage, state.enemy.name);
    if (poisonBonus > 0) {
      state.enemy.poison += poisonBonus;
      log(state, `+${poisonBonus} яда на ${state.enemy.name}.`);
    }
  } else if (target.kind === "enemyMinion" && target.uid) {
    const m = getEnemyMinion(state, target.uid);
    if (!m || m.hp <= 0) return;
    dealToCharacter(state, { block: 0 }, m, damage, m.name);
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
    const id = state.drawPile.pop();
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

export function createBattle(seed = Date.now()): BattleState {
  const rng = mulberry32(seed);
  const drawPile = [...STARTER_DECK_IDS];
  shuffleInPlace(drawPile, rng);
  uidCounter = 0;

  const state: BattleState = {
    phase: "player",
    turnNumber: 1,
    player: {
      hp: 70,
      maxHp: 70,
      block: 0,
      energy: 3,
      maxEnergy: 3,
      poison: 0,
    },
    poisonOnNextAttack: 0,
    enemy: {
      name: "Тень тревоги",
      hp: 48,
      maxHp: 48,
      block: 0,
      poison: 0,
      intentDamage: 8,
    },
    playerMinions: [],
    enemyMinions: [],
    hand: [],
    drawPile,
    discardPile: [],
    log: [],
  };

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
  return state.player.energy >= def.cost;
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

  if (def.kind === "buff" && def.addPoisonToNextAttack) {
    state.poisonOnNextAttack += def.addPoisonToNextAttack;
    log(state, `Клинок отравлен (+${def.addPoisonToNextAttack}). Всего на следующий удар: ${state.poisonOnNextAttack}.`);
    discardFromHand(state, handIndex);
    checkBattleEnd(state);
    return null;
  }

  if (def.block) {
    state.player.block += def.block;
    log(state, `+${def.block} блока.`);
    discardFromHand(state, handIndex);
    checkBattleEnd(state);
    return null;
  }

  if (def.draw) {
    drawCards(state, def.draw);
    log(state, `Взято карт: ${def.draw}.`);
    discardFromHand(state, handIndex);
    checkBattleEnd(state);
    return null;
  }

  if (def.kind === "summon" && def.summon) {
    const ok = summonMinion(state, "player", def.summon, def.id);
    if (!ok) {
      state.player.energy += def.cost;
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

  if (def.damage != null && target) {
    const poisonBonus =
      def.kind === "attack" || (def.kind === "spell" && def.needsEnemyTarget)
        ? state.poisonOnNextAttack
        : 0;
    applyDamageToTarget(state, target, def.damage, poisonBonus);
    if (poisonBonus > 0) {
      state.poisonOnNextAttack = 0;
      log(state, "Яд с клинка перенесён в цель.");
    }
    discardFromHand(state, handIndex);
    checkBattleEnd(state);
    return null;
  }

  state.player.energy += def.cost;
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
  dealToCharacter(state, t2.block, t2.hp, state.enemy.intentDamage, t2.name);
  log(state, `${state.enemy.name} наносит удар (${state.enemy.intentDamage}).`);

  state.enemy.intentDamage = 6 + Math.floor(Math.random() * 5);

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

  tickPoisonOnSide(state, "enemy");
  checkBattleEnd(state);
  if (state.phase !== "player") return;

  state.player.energy = state.player.maxEnergy;
  for (const m of state.playerMinions) {
    m.canAttack = true;
  }

  drawCards(state, 1);
}

export function endPlayerTurn(state: BattleState): string | null {
  if (state.phase !== "player") return "Сейчас не твой ход.";
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
