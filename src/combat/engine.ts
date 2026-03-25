import type { BattleEndSummary } from "../game/types";
import { getEnemyBattleDef } from "./enemyBattleDefs";
import { getBattleResponseDef } from "./responseDefs";
import { listAvailableStanceIds, listResponsesForStance } from "./stanceDefs";
import type {
  BattleEnemyDef,
  EnemyAdaptationRule,
  BattleResponseId,
  BattleResponseStyle,
  BattleState,
  BattleStanceId,
  DominantBattleStyle,
  EnemyEcho,
  EnemyIntentTier,
} from "./types";

export interface CreateBattleOptions {
  seed?: number;
  enemyId?: string;
  responseIds?: BattleResponseId[];
  allyEnemyId?: string;
  enemyPowerScale?: number;
  buffAllyEcho?: boolean;
}

function log(state: BattleState, msg: string): void {
  state.log.push(msg);
  if (state.log.length > 14) state.log.shift();
}

function tickDebuffsStartTurn(state: BattleState): void {
  for (const key of Object.keys(state.debuffs) as Array<keyof BattleState["debuffs"]>) {
    if (state.debuffs[key] > 0) state.debuffs[key] -= 1;
  }
}

function damageEnemy(state: BattleState, amount: number): void {
  let remaining = amount;
  if (state.enemy.block > 0) {
    const absorbed = Math.min(state.enemy.block, remaining);
    state.enemy.block -= absorbed;
    remaining -= absorbed;
    if (absorbed > 0) log(state, `${state.enemy.name}: блок −${absorbed}.`);
  }
  if (remaining > 0) {
    state.enemy.resistance = Math.max(0, state.enemy.resistance - remaining);
    log(state, `${state.enemy.name}: −${remaining} устойчивости.`);
  }
}

function damagePlayer(state: BattleState, amount: number): void {
  const guiltPenalty = state.debuffs.guilt > 0 ? 1 : 0;
  const shamePenalty = state.debuffs.shame > 0 ? 2 : 0;
  const adaptationPenalty = state.enemyAdaptation.blockIgnore;
  let effectiveBlock = Math.max(0, state.player.block - guiltPenalty - shamePenalty - adaptationPenalty);
  let remaining = amount;
  if (effectiveBlock > 0) {
    const absorbed = Math.min(effectiveBlock, remaining);
    state.player.block = Math.max(0, state.player.block - absorbed);
    remaining -= absorbed;
    if (absorbed > 0) log(state, `Ты: блок −${absorbed}.`);
  }
  if (remaining > 0) {
    state.player.calm = Math.max(0, state.player.calm - remaining);
    log(state, `Ты: −${remaining} спокойствия.`);
  }
}

function healPlayer(state: BattleState, amount: number): void {
  const before = state.player.calm;
  state.player.calm = Math.min(state.player.maxCalm, state.player.calm + amount);
  const gained = state.player.calm - before;
  if (gained > 0) log(state, `Спокойствие +${gained}.`);
}

function addBlock(state: BattleState, amount: number): void {
  if (amount <= 0) return;
  state.player.block += amount;
  log(state, `Блок +${amount}.`);
}

function rollEnemyIntent(enemyId: string): { dmg: number; tier: EnemyIntentTier; text: string } {
  const preset = getEnemyBattleDef(enemyId);
  const attacks = preset.attacks;
  const total = attacks.reduce((sum, attack) => sum + attack.weight, 0);
  let r = Math.random() * total;
  for (const attack of attacks) {
    r -= attack.weight;
    if (r <= 0) {
      const span = attack.max - attack.min + 1;
      const dmg = attack.min + Math.floor(Math.random() * Math.max(1, span));
      return { dmg, tier: attack.tier, text: buildIntentText(enemyId, attack.tier) };
    }
  }
  const fallback = attacks[attacks.length - 1]!;
  return { dmg: fallback.min, tier: fallback.tier, text: buildIntentText(enemyId, fallback.tier) };
}

function buildIntentText(enemyId: string, tier: EnemyIntentTier): string {
  switch (enemyId) {
    case "hum_unnamed":
      return tier === "heavy" ? "гул давит в грудь" : "шум сгущается";
    case "voice_must":
      return tier === "heavy" ? "обвиняет и ускоряет" : "требует больше";
    case "compare_others":
      return tier === "heavy" ? "меряет тебя чужой высотой" : "сравнивает шаг";
    case "shadow_past_decision":
      return tier === "heavy" ? "возвращает прежнюю боль" : "тянет назад";
    case "insomnia":
      return tier === "heavy" ? "раскачивает мысли" : "не даёт уснуть";
    case "expectation_judgment":
      return tier === "heavy" ? "сжимает чужим взглядом" : "подталкивает под суд";
    case "root_of_anxiety":
      return tier === "heavy" ? "давит всем весом" : "поднимается изнутри";
    default:
      return tier === "heavy" ? "наступает" : "подступает";
  }
}

function toDominantStyle(style: BattleResponseStyle): DominantBattleStyle {
  if (style === "absorption") return "absorption";
  if (style === "withdrawal") return "withdrawal";
  if (style === "steady") return "steady";
  return "acceptance";
}

function refreshRepeatTracking(
  state: BattleState,
  responseId: BattleResponseId,
  dominantStyle: DominantBattleStyle,
): void {
  const adaptation = state.enemyAdaptation;
  if (adaptation.repeatedResponseId === responseId) adaptation.repeatedResponseCount += 1;
  else {
    adaptation.repeatedResponseId = responseId;
    adaptation.repeatedResponseCount = 1;
  }

  if (adaptation.repeatedStyle === dominantStyle) adaptation.repeatedStyleCount += 1;
  else {
    adaptation.repeatedStyle = dominantStyle;
    adaptation.repeatedStyleCount = 1;
  }
}

function canTriggerAdaptationRule(
  state: BattleState,
  rule: EnemyAdaptationRule,
  responseId: BattleResponseId,
  dominantStyle: DominantBattleStyle,
): boolean {
  if (rule.trigger === "same_response") {
    if (state.enemyAdaptation.repeatedResponseCount < rule.threshold) return false;
    if (rule.responseIds && !rule.responseIds.includes(responseId)) return false;
    return true;
  }

  if (state.enemyAdaptation.repeatedStyleCount < rule.threshold) return false;
  if (rule.styles && !rule.styles.includes(dominantStyle)) return false;
  return true;
}

function pickAdaptationRule(
  enemyDef: BattleEnemyDef,
  state: BattleState,
  responseId: BattleResponseId,
  dominantStyle: DominantBattleStyle,
): EnemyAdaptationRule | null {
  const matches = enemyDef.adaptationRules.filter((rule) =>
    canTriggerAdaptationRule(state, rule, responseId, dominantStyle),
  );
  if (matches.length === 0) return null;
  matches.sort((a, b) => {
    if (b.threshold !== a.threshold) return b.threshold - a.threshold;
    if (a.trigger !== b.trigger) return a.trigger === "same_response" ? -1 : 1;
    return 0;
  });
  return matches[0] ?? null;
}

function applyEnemyAdaptation(
  state: BattleState,
  enemyDef: BattleEnemyDef,
  responseId: BattleResponseId,
  dominantStyle: DominantBattleStyle,
): void {
  refreshRepeatTracking(state, responseId, dominantStyle);

  if (
    state.enemyAdaptation.repeatedResponseCount >= 2 ||
    state.enemyAdaptation.repeatedStyleCount >= 2
  ) {
    state.enemyAdaptation.currentHint ??= "Враг начинает читать твой повторяющийся ритм.";
  }

  const rule = pickAdaptationRule(enemyDef, state, responseId, dominantStyle);
  if (!rule) return;

  state.enemyAdaptation.currentHint = rule.hint;
  state.enemyAdaptation.currentTrigger = rule.trigger;
  log(state, rule.log);

  for (const effect of rule.effects) {
    switch (effect.kind) {
      case "intent_bonus":
        state.enemyAdaptation.intentBonus += effect.amount;
        state.enemy.intentDamage += effect.amount;
        break;
      case "set_debuff":
        state.debuffs[effect.debuff] = Math.max(state.debuffs[effect.debuff], effect.turns);
        break;
      case "pressure":
        state.pressureLevel += effect.amount;
        break;
      case "reduce_understanding":
        state.understanding = Math.max(0, state.understanding - effect.amount);
        break;
      case "ignore_block":
        state.enemyAdaptation.blockIgnore += effect.amount;
        break;
    }
  }

  if (rule.intentText) {
    state.enemy.intentText = rule.intentText;
  }
}

function pushEcho(enemyId: string, buffed: boolean): EnemyEcho {
  const preset = getEnemyBattleDef(enemyId);
  return {
    enemyId,
    name: `${preset.name} (эхо)`,
    intentDamage: Math.max(1, Math.floor(preset.intentDamage / 2)) + (buffed ? 2 : 0),
    intentText: buildIntentText(enemyId, "light"),
    buffed,
  };
}

function getFirstAvailableStance(responseIds: BattleResponseId[]): BattleStanceId | null {
  return listAvailableStanceIds(responseIds)[0] ?? null;
}

function markResponseStyle(state: BattleState, style: BattleResponseStyle, responseId: BattleResponseId): void {
  state.responsesUsedTotal += 1;
  state.usedResponses.push(responseId);
  state.lastResponseIds.push(responseId);
  if (state.lastResponseIds.length > 4) state.lastResponseIds.shift();

  if (style === "acceptance" || style === "integration" || style === "npc" || style === "rare") {
    state.acceptanceResponseStreak += 1;
    state.absorptionResponseStreak = 0;
    state.withdrawalResponseStreak = 0;
    state.quietResponseStreak += 1;
    state.understandingChain += 1;
    if (state.acceptanceResponseStreak >= 3) state.metaPostAcceptance3 = true;
  } else if (style === "absorption") {
    state.absorptionResponseStreak += 1;
    state.acceptanceResponseStreak = 0;
    state.withdrawalResponseStreak = 0;
    state.quietResponseStreak = 0;
    state.understandingChain = 0;
    state.pressureResponsesTotal += 1;
    if (state.absorptionResponseStreak >= 3) state.metaPostAbsorption3 = true;
  } else if (style === "withdrawal") {
    state.withdrawalResponseStreak += 1;
    state.acceptanceResponseStreak = 0;
    state.absorptionResponseStreak = 0;
    state.quietResponseStreak += 1;
    state.understandingChain = Math.max(0, state.understandingChain - 1);
    if (state.withdrawalResponseStreak >= 3) state.metaPostWithdrawal3 = true;
  } else {
    state.acceptanceResponseStreak = 0;
    state.absorptionResponseStreak = 0;
    state.withdrawalResponseStreak = 0;
    state.quietResponseStreak += 1;
  }
}

function resolveUnderstandingWin(state: BattleState): boolean {
  if (state.battleEnemyId === "root_of_anxiety") return false;
  if (state.understandingChain >= 3 || state.understanding >= 4) {
    state.phase = "won";
    log(state, "Давление теряет лицо. Это уже не враг, а узнанный шум.");
    return true;
  }
  return false;
}

function checkBattleEnd(state: BattleState): void {
  if (state.enemy.resistance <= 0) {
    state.phase = "won";
    log(state, "Ты дожимаешь шум. Он отступает.");
    return;
  }
  if (state.player.calm <= 0) {
    state.phase = "lost";
    log(state, "Спокойствие осыпается до нуля.");
  }
}

function beginPlayerTurn(state: BattleState): void {
  if (state.phase === "won" || state.phase === "lost" || state.phase === "abandoned") return;
  state.phase = "player";
  state.turnNumber += 1;
  state.turnUsedResponse = false;
  state.enemyAdaptation.currentHint = null;
  state.enemyAdaptation.currentTrigger = null;
  state.enemyAdaptation.intentBonus = 0;
  state.enemyAdaptation.blockIgnore = 0;
  if (
    !state.currentStanceId ||
    listResponsesForStance(state.availableResponseIds, state.currentStanceId).length === 0
  ) {
    state.currentStanceId = getFirstAvailableStance(state.availableResponseIds);
  }
  state.player.block = 0;
  state.pressureLevel = Math.max(0, state.pressureLevel - 1);
  tickDebuffsStartTurn(state);
  healPlayer(state, 1);
  log(state, `Твой ход (${state.turnNumber}).`);

  if (state.skipNextPlayerTurn) {
    state.skipNextPlayerTurn = false;
    log(state, "Ты не продолжаешь усилие и просто пережидаешь этот ход.");
    state.phase = "enemy";
    enemyTurn(state);
  }
}

function enemyTurn(state: BattleState): void {
  if (state.phase !== "enemy") return;
  log(state, `Ход ${state.enemy.name}.`);
  state.enemy.block = 0;

  for (const echo of state.enemyEchoes) {
    damagePlayer(state, echo.intentDamage);
    log(state, `${echo.name}: ${echo.intentText}.`);
    checkBattleEnd(state);
    if (state.phase !== "enemy") return;
  }

  let damage = state.enemy.intentDamage + Math.max(0, state.pressureLevel - 1);
  if (state.currentStanceId === "steady") {
    damage = Math.max(0, damage - 1);
  }
  if (state.currentStanceId === "withdrawal") {
    damage = Math.max(0, damage - 1);
  }
  if (state.currentStanceId === "absorption") {
    damage += 1;
  }

  if (state.battleEnemyId === "compare_others" && state.player.block > 0) damage += 1;
  if (state.battleEnemyId === "voice_must") {
    state.debuffs.guilt = Math.max(state.debuffs.guilt, 2);
    if (Math.random() < 0.35) state.debuffs.panic = Math.max(state.debuffs.panic, 1);
  }
  if (state.battleEnemyId === "shadow_past_decision") state.debuffs.regret = Math.max(state.debuffs.regret, 2);
  if (state.battleEnemyId === "insomnia") state.debuffs.fatigue = Math.max(state.debuffs.fatigue, 2);
  if (state.battleEnemyId === "expectation_judgment") state.debuffs.shame = Math.max(state.debuffs.shame, 2);

  if (damage > 0) {
    if (state.enemyAdaptation.blockIgnore > 0 && state.player.block > 0) {
      log(state, `${state.enemy.name} находит щель в защите и частично проходит сквозь блок.`);
    }
    damagePlayer(state, damage);
    log(state, `${state.enemy.name}: ${state.enemy.intentText}.`);
  } else {
    log(state, `${state.enemy.name} тянется ближе, но прямого удара нет.`);
  }

  checkBattleEnd(state);
  if (state.phase !== "enemy") return;

  const nextIntent = rollEnemyIntent(state.battleEnemyId ?? "hum_unnamed");
  state.enemy.intentDamage = nextIntent.dmg;
  state.enemy.intentTier = nextIntent.tier;
  state.enemy.intentText = nextIntent.text;
  beginPlayerTurn(state);
}

export function createBattle(opts: CreateBattleOptions = {}): BattleState {
  const enemyId = opts.enemyId ?? "hum_unnamed";
  const preset = getEnemyBattleDef(enemyId);
  const intent = rollEnemyIntent(enemyId);
  const availableResponseIds = opts.responseIds ?? ["ground", "boundary", "witness", "push", "step_back"];

  const state: BattleState = {
    phase: "player",
    turnNumber: 1,
    battleEnemyId: enemyId,
    skipNextPlayerTurn: false,
    currentStanceId: null,
    availableResponseIds,
    player: {
      calm: 5,
      maxCalm: 10,
      block: 0,
      poison: 0,
    },
    enemy: {
      name: preset.name,
      level: preset.level,
      resistance: preset.hp,
      maxResistance: preset.hp,
      block: 0,
      poison: 0,
      intentDamage: intent.dmg,
      intentTier: intent.tier,
      intentText: intent.text,
    },
    enemyEchoes: [],
    debuffs: {
      panic: 0,
      guilt: 0,
      shame: 0,
      fatigue: 0,
      numbness: 0,
      regret: 0,
    },
    log: [],
    understanding: 0,
    pressureLevel: 0,
    turnUsedResponse: false,
    responsesUsedTotal: 0,
    pressureResponsesTotal: 0,
    acceptanceResponseStreak: 0,
    absorptionResponseStreak: 0,
    withdrawalResponseStreak: 0,
    quietResponseStreak: 0,
    understandingChain: 0,
    lastResponseIds: [],
    enemyAdaptation: {
      repeatedResponseId: null,
      repeatedResponseCount: 0,
      repeatedStyle: null,
      repeatedStyleCount: 0,
      currentHint: null,
      currentTrigger: null,
      intentBonus: 0,
      blockIgnore: 0,
    },
    lastDominantStyle: "steady",
    metaPostAbsorption3: false,
    metaPostAcceptance3: false,
    metaPostWithdrawal3: false,
    usedRareResponse: false,
    usedResponses: [],
  };

  const scale = opts.enemyPowerScale ?? 1;
  if (scale > 1) {
    state.enemy.maxResistance = Math.floor(state.enemy.maxResistance * scale);
    state.enemy.resistance = state.enemy.maxResistance;
    state.enemy.intentDamage = Math.max(0, Math.floor(state.enemy.intentDamage * scale));
    state.enemy.level += Math.max(1, Math.floor(scale - 1));
    log(state, `Враг возвращается сильнее (×${scale}).`);
  }

  if (enemyId === "coalition_anxiety") state.enemyEchoes.push(pushEcho("voice_must", false));
  if (opts.allyEnemyId) state.enemyEchoes.push(pushEcho(opts.allyEnemyId, opts.buffAllyEcho ?? false));

  log(state, "Конфликт начинается. Сначала выбери стойку, потом приём внутри неё.");
  return state;
}

export function canSelectStance(state: BattleState, stanceId: BattleStanceId): boolean {
  if (state.phase !== "player" || state.turnUsedResponse) return false;
  return listResponsesForStance(state.availableResponseIds, stanceId).length > 0;
}

export function selectStance(state: BattleState, stanceId: BattleStanceId): string | null {
  if (!canSelectStance(state, stanceId)) return "Эта стойка сейчас недоступна.";
  if (state.currentStanceId === stanceId) return null;
  state.currentStanceId = stanceId;
  return null;
}

export function canUseResponse(state: BattleState, responseId: BattleResponseId): boolean {
  if (state.phase !== "player" || state.turnUsedResponse) return false;
  if (!state.availableResponseIds.includes(responseId)) return false;
  if (!state.currentStanceId) return false;
  if (getBattleResponseDef(responseId).stanceId !== state.currentStanceId) return false;
  if (state.debuffs.panic > 0 && responseId === "final_silence") return false;
  if (state.debuffs.numbness > 0 && responseId === "companion") return false;
  if (responseId === "edge" && state.usedResponses.includes("edge")) return false;
  return true;
}

export function useResponse(state: BattleState, responseId: BattleResponseId): string | null {
  if (!canUseResponse(state, responseId)) return "Сейчас этот ответ недоступен.";

  const def = getBattleResponseDef(responseId);
  const enemyDef = getEnemyBattleDef(state.battleEnemyId ?? "hum_unnamed");
  const dominantStyle = toDominantStyle(def.style);
  state.turnUsedResponse = true;
  state.currentStanceId = def.stanceId;
  markResponseStyle(state, def.style, responseId);
  state.lastDominantStyle = dominantStyle;

  log(state, `${def.name}: ${def.title.toLowerCase()}.`);

  switch (responseId) {
    case "ground":
      healPlayer(state, 2);
      state.debuffs.panic = Math.max(0, state.debuffs.panic - 1);
      break;
    case "boundary":
      addBlock(state, 4);
      if (state.debuffs.guilt > 0) state.debuffs.guilt -= 1;
      else if (state.debuffs.shame > 0) state.debuffs.shame -= 1;
      break;
    case "witness":
      damageEnemy(state, 2);
      state.understanding += 1;
      break;
    case "push":
      damageEnemy(state, 3);
      state.pressureLevel += 1;
      damagePlayer(state, 1);
      break;
    case "step_back":
      addBlock(state, 2);
      if (state.withdrawalResponseStreak >= 2 && state.battleEnemyId !== "root_of_anxiety") {
        state.phase = "abandoned";
        log(state, "Ты не побеждаешь шум, но размыкаешь контакт и уходишь.");
        return null;
      }
      break;
    case "unhook":
      addBlock(state, 2);
      state.enemy.intentDamage = Math.max(0, state.enemy.intentDamage - 1);
      break;
    case "far_horizon":
      healPlayer(state, 2);
      state.understanding += 1;
      if (state.withdrawalResponseStreak >= 2 && state.battleEnemyId !== "root_of_anxiety") {
        state.phase = "abandoned";
        log(state, "Ты видишь жизнь дальше боя и спокойно выходишь из него.");
        return null;
      }
      break;
    case "breathe_square":
      healPlayer(state, 1);
      addBlock(state, 3);
      state.debuffs.panic = 0;
      break;
    case "honest_rest":
      state.player.calm = state.player.maxCalm;
      state.skipNextPlayerTurn = true;
      log(state, "Ты признаёшь предел и перестаёшь дожимать себя.");
      break;
    case "autopilot":
      damageEnemy(state, 4);
      state.debuffs.numbness = Math.max(state.debuffs.numbness, 2);
      break;
    case "hard_wall":
      addBlock(state, 6);
      state.debuffs.regret = Math.max(state.debuffs.regret, 1);
      break;
    case "background_noise":
      healPlayer(state, 2);
      state.understanding += 1;
      break;
    case "inner_advisor":
      state.enemy.intentDamage = Math.max(0, state.enemy.intentDamage - 1);
      state.debuffs.guilt = 0;
      state.understanding += 1;
      break;
    case "own_path":
      addBlock(state, 3);
      state.debuffs.shame = 0;
      break;
    case "companion":
      healPlayer(state, 2);
      state.debuffs.numbness = 0;
      state.debuffs.regret = 0;
      break;
    case "night_talk":
      state.understanding += state.battleEnemyId === "insomnia" ? 2 : 1;
      addBlock(state, 2);
      break;
    case "own_eyes":
      damageEnemy(state, 2);
      state.debuffs.shame = 0;
      state.debuffs.guilt = 0;
      break;
    case "vera_map":
      addBlock(state, 2);
      healPlayer(state, 1);
      break;
    case "quiet_voice":
      state.enemy.intentDamage = Math.max(0, state.enemy.intentDamage - 1);
      state.understanding += 1;
      break;
    case "sapling":
      healPlayer(state, 2);
      state.debuffs.fatigue = Math.max(0, state.debuffs.fatigue - 1);
      break;
    case "echo_echo":
      damageEnemy(state, 2);
      state.debuffs.regret = Math.max(0, state.debuffs.regret - 1);
      break;
    case "trail_follow":
      healPlayer(state, 1);
      addBlock(state, 2);
      state.understanding += 1;
      break;
    case "final_silence":
      if (state.understanding >= 2 && state.battleEnemyId !== "root_of_anxiety") {
        state.phase = "won";
        log(state, "Тишина оказывается не пустотой, а местом, где спор заканчивается.");
        return null;
      }
      healPlayer(state, 2);
      state.understanding += 1;
      break;
    case "edge":
      damageEnemy(state, 6);
      damagePlayer(state, 2);
      state.usedRareResponse = true;
      break;
    case "stand":
      addBlock(state, 5);
      if (state.understanding > 0) damageEnemy(state, 1);
      break;
  }

  applyEnemyAdaptation(state, enemyDef, responseId, dominantStyle);

  if (state.battleEnemyId === "hum_unnamed") {
    if (def.style !== "absorption" && def.style !== "withdrawal" && state.quietResponseStreak >= 3) {
      state.phase = "won";
      log(state, "Гул остаётся фоном. Он больше не ведёт твой ритм.");
      return null;
    }
  }

  if (state.battleEnemyId === "insomnia") {
    if (responseId === "ground" || responseId === "step_back" || responseId === "night_talk") {
      if (state.quietResponseStreak >= 3) {
        state.phase = "won";
        log(state, "Тишина становится глубже, и бессонница отпускает.");
        return null;
      }
    } else if (def.style === "absorption") {
      damagePlayer(state, 2);
      log(state, "Чем сильнее давишь, тем громче просыпается тело.");
    }
  }

  if (resolveUnderstandingWin(state)) return null;
  checkBattleEnd(state);
  return null;
}

export function endPlayerTurn(state: BattleState): string | null {
  if (state.phase !== "player") return "Сейчас не твой ход.";
  if (!state.turnUsedResponse) {
    state.withdrawalResponseStreak += 1;
    if (state.withdrawalResponseStreak >= 3) state.metaPostWithdrawal3 = true;
    addBlock(state, 1);
    log(state, "Ты не находишь ответа и просто пережидаешь ход.");
  }
  state.phase = "enemy";
  enemyTurn(state);
  return null;
}

export function summarizeBattleEnd(state: BattleState): BattleEndSummary {
  const counts = {
    acceptance: 0,
    absorption: 0,
    withdrawal: 0,
    steady: 0,
  };

  for (const id of state.usedResponses) {
    const style = getBattleResponseDef(id).style;
    if (style === "absorption") counts.absorption += 1;
    else if (style === "withdrawal") counts.withdrawal += 1;
    else if (style === "steady") counts.steady += 1;
    else counts.acceptance += 1;
  }

  const dominantStyle: DominantBattleStyle =
    counts.acceptance >= counts.absorption &&
    counts.acceptance >= counts.withdrawal &&
    counts.acceptance >= counts.steady
      ? "acceptance"
      : counts.absorption >= counts.withdrawal && counts.absorption >= counts.steady
        ? "absorption"
        : counts.withdrawal >= counts.steady
          ? "withdrawal"
          : "steady";

  const base = {
    enemyId: state.battleEnemyId,
    hadAnyResponse: state.responsesUsedTotal > 0,
    hadPressureResponse: state.pressureResponsesTotal > 0,
    postAbsorption3: state.metaPostAbsorption3,
    postAcceptance3: state.metaPostAcceptance3,
    postWithdrawal3: state.metaPostWithdrawal3,
    dominantStyle,
  } satisfies Omit<BattleEndSummary, "endKind" | "integrationWin">;

  if (state.phase === "won") {
    return {
      endKind: "won",
      integrationWin: state.enemy.resistance > 0,
      ...base,
    };
  }
  if (state.phase === "lost") {
    return {
      endKind: "lost",
      integrationWin: false,
      ...base,
      postAbsorption3: false,
      postAcceptance3: false,
      postWithdrawal3: false,
    };
  }
  return {
    endKind: "abandoned",
    integrationWin: false,
    ...base,
  };
}
