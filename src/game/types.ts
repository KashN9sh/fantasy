import type { WorldZoneId } from "../data/worldZones";

export type GameMode =
  | "intro"
  | "explore"
  | "dialog"
  | "choice"
  | "card"
  | "battle"
  | "end"
  | "finale"
  | "credits"
  | "deck_view";

export interface DialogLine {
  speaker: string;
  text: string;
}

/** Выбор сценария (развилка и т.д.) */
export interface StoryChoiceOption {
  id: string;
  label: string;
  acceptanceDelta: number;
  absorptionDelta: number;
  nextSceneId: string;
}

/** Выбор Лина после второй встречи (сумерки) */
export type LinFinaleChoice = "new" | "flowers" | "neutral" | "gone";

/** Ответ отшельнику «победить / понять» — вес финала ([PATHS.md]) */
export type HermitPathLean = "understand" | "defeat" | "neutral";

export interface GameFlags {
  soothed: boolean;
  sawEnding: boolean;
  /** Встреча с отшельником на опушке (часть 1 сценария) */
  metHermitClearing: boolean;
  /** Завершён бой с Гулом у «тренера» */
  defeatedGulTrainer: boolean;
  /** Понял(а) врага hum_unnamed через бой (ветка принятия / условие победы) */
  understoodHum: boolean;
  /** Ответы отшельнику (для NPC-карты «Тихий голос», задел) */
  hermitAnswersCount: number;
  /** Первый вопрос отшельника (ч.1): наклон к треку финала; null до встречи */
  hermitPathLean: HermitPathLean | null;
  /** Финал Веры на привале: честное описание троп (ч.8.1) */
  veraCampHonest: boolean;
  /** Встречена ли Фигура (редкая карта «След») */
  metFigure: boolean;
  /** Карта Веры в колоде: честное описание моста (SCENARIO 2.1) */
  veraMapReady: boolean;
  /** Квест Веры: согласие описывать локации */
  veraQuestActive: boolean;
  /** Отчёт о мосте Вере отдан */
  veraBridgeReported: boolean;
  /** Мост описан «красивой ложью» (ветка Веры на перекрёстке) */
  veraBridgeWasPrettyLie: boolean;
  /** Разговор с Верой на опушке уже был */
  veraHasSpoken: boolean;
  /** Первая встреча с Лином (ч.3) завершена */
  linFirstMeetingDone: boolean;
  /** Вторая встреча с Лином (ч.6) завершена */
  linSecondMeetingDone: boolean;
  linFinaleChoice: LinFinaleChoice | null;
  /** Квест Иры (ч.4) */
  iraQuestActive: boolean;
  /** Ира: отказ в первый раз */
  iraDeclinedOnce: boolean;
  /** Разговор с Ирой уже начинался */
  iraHasSpoken: boolean;
  /** Вторая встреча с Ирой на перекрёстке */
  iraCrossroadsDone: boolean;
  /** Сцена Веры на привале (ч.8.1) */
  veraLastCampDone: boolean;
  /** Сцена Лина на привале */
  linLastCampDone: boolean;
  /** Сцена Иры на привале */
  iraLastCampDone: boolean;
  /** Отшельник в балке (ч.5) */
  hermitSecondMeetingDone: boolean;
  /** Вера на перекрёстке после лжи о мосту */
  veraSecondMeetingDone: boolean;
  /** Отшельник у привала (ч.8.4) */
  hermitThirdMeetingDone: boolean;
  /** Развилка перед Корнем пройдена (можно уходить с last_camp) */
  lastCampForkDone: boolean;
  /** Гул с триггера «долго стоишь» на опушке уже предлагался */
  encounterIdleGulUsed: boolean;
  /** Вынужденная Тень после лжи Вере о мосту уже сыграна */
  encounterShadowFromLieUsed: boolean;
  /** Завершён финальный поток (титры можно не повторять) */
  finaleComplete: boolean;
  /** Туториал первого боя с Гулом: 0..3 (3 = завершён) */
  firstGulBattleTutorialStep: number;
}

export interface AfterDialog {
  openCard: boolean;
  openEnd: boolean;
}

/**
 * Очередной бой из триггера [ENCOUNTER_SYSTEM.md](../../docs/ENCOUNTER_SYSTEM.md).
 */
export interface PendingEncounter {
  enemyId: string;
  /** Второй враг как enemy-миньон (§3.4–3.6) */
  allyEnemyId?: string;
  /** Множитель ОЗ/урона главного врага (реванш +1) */
  enemyPowerLevel?: number;
  lines: DialogLine[];
}

/**
 * Счётчики и одноразовые флаги триггеров ENCOUNTER_SYSTEM.
 * «Пауза» между зонами: любой завершённый NPC-диалог, отдых на привале, простой в explore ≥ PAUSE_IDLE_MS (см. encounters.ts).
 */
export interface EncounterRuntime {
  zoneStreakNoPause: number;
  totalZoneTransitions: number;
  zonesSinceBattle: number;
  consecutiveWins: number;
  consecutiveBattlesCompleted: number;
  passByNpcStreak: number;
  prevAdjacentNpc: boolean;
  moveDirLog: { dx: number; dy: number; t: number }[];
  firstRevisitShadowDone: boolean;
  wanderGulInsomniaUsed: boolean;
  zonesWithoutCardUse: number;
  queuedEncounter: PendingEncounter | null;
  rematch: { enemyId: string; powerLevel: number } | null;
  fleeAlly: { primaryId: string; allyId: string } | null;
  coalitionFiveDone: boolean;
  coalitionThreeWinsDone: boolean;
  eightZoneDryDone: boolean;
  sevenZoneQuietDone: boolean;
  threeBattlesVoiceDone: boolean;
  shiftFiveDone: boolean;
  shiftEightDone: boolean;
  defeatComebackDone: boolean;
  lostCardPenaltyApplied: boolean;
  restDeclines: number;
  /** Первый выбор «отдохнуть» на привале (§3.2 → Голос) */
  restVoiceBattleDone: boolean;
  pendingRestInsomnia: boolean;
  compareInventoryDone: boolean;
  threeSameCategoryDone: boolean;
  /** После боя: серии карт §3.3 */
  postBattleAbsorption3: boolean;
  postBattleAcceptance3: boolean;
  postBattleDiscard3: boolean;
  /** §3.6: после «понимания» одного — усилить второго (упрощённо: баф миньона в бою) */
  buffAllyMinionNextBattle: boolean;
  /** Выборы диалога для триггеров */
  hurtfulTruthTriggered: boolean;
  refuseHelpBattleDone: boolean;
  genericLieBattleDone: boolean;
  /** Серия зон без паузы уже вызвала бессонницу (§3.1) */
  insomniaRushUsed: boolean;
  /** После боя без сыгранных карт — считаем зоны */
  lastBattleNoCards: boolean;
}

/** Итог боя для триггеров [ENCOUNTER_SYSTEM.md](../../docs/ENCOUNTER_SYSTEM.md) */
export interface BattleEndSummary {
  endKind: "won" | "lost" | "abandoned";
  /** Победа без обнуления ОЗ врага (карты, условия) */
  integrationWin: boolean;
  enemyId: string | null;
  hadAnyCardPlayed: boolean;
  postAbsorption3: boolean;
  postAcceptance3: boolean;
  postDiscard3: boolean;
}

export function createInitialEncounterRuntime(): EncounterRuntime {
  return {
    zoneStreakNoPause: 0,
    totalZoneTransitions: 0,
    zonesSinceBattle: 0,
    consecutiveWins: 0,
    consecutiveBattlesCompleted: 0,
    passByNpcStreak: 0,
    prevAdjacentNpc: false,
    moveDirLog: [],
    firstRevisitShadowDone: false,
    wanderGulInsomniaUsed: false,
    zonesWithoutCardUse: 0,
    queuedEncounter: null,
    rematch: null,
    fleeAlly: null,
    coalitionFiveDone: false,
    coalitionThreeWinsDone: false,
    eightZoneDryDone: false,
    sevenZoneQuietDone: false,
    threeBattlesVoiceDone: false,
    shiftFiveDone: false,
    shiftEightDone: false,
    defeatComebackDone: false,
    lostCardPenaltyApplied: false,
    restDeclines: 0,
    restVoiceBattleDone: false,
    pendingRestInsomnia: false,
    compareInventoryDone: false,
    threeSameCategoryDone: false,
    postBattleAbsorption3: false,
    postBattleAcceptance3: false,
    postBattleDiscard3: false,
    buffAllyMinionNextBattle: false,
    hurtfulTruthTriggered: false,
    refuseHelpBattleDone: false,
    genericLieBattleDone: false,
    insomniaRushUsed: false,
    lastBattleNoCards: false,
  } satisfies EncounterRuntime;
}

export interface GameState {
  mode: GameMode;
  flags: GameFlags;
  playerTileX: number;
  playerTileY: number;
  pendingAfterDialog: AfterDialog | null;
  /** Накопленный сдвиг пути (отдельно считаем) */
  acceptance: number;
  absorption: number;
  /** Текущая сцена сюжетного графа ([`storyScenes`](../data/storyScenes.ts)) */
  storySceneId: string | null;
  /** Во время mode === "choice" — id набора опций */
  activeChoiceId: string | null;
  /** После боя — куда вернуться в сюжете */
  pendingStorySceneAfterBattle: string | null;
  /** Id врага для следующего боя (из [`createBattle`](../combat/engine.ts)) */
  pendingBattleEnemyId: string | null;
  /** ENCOUNTER_SYSTEM: второй враг в бою */
  pendingBattleAllyId: string | null;
  pendingBattlePowerScale: number;
  pendingBattleBuffAlly: boolean;
  /** Понятые враги — задел под карты интеграции (фаза 2) */
  integratedEnemyIds: string[];
  /** Карты, потерянные навсегда после мягкого поражения */
  removedDeckCardIds: string[];
  /** Текущая зона оверворлда ([`WORLD_ZONE_IDS`](../data/worldZones.ts)) */
  currentZoneId: WorldZoneId;
  /** Уже показан входной текст при первом заходе в зону */
  visitedZoneIds: WorldZoneId[];
  /** Ни разу не уходил из боя досрочно (для «Стоять») — при появлении «бегства» выставить false */
  neverFledBattle: boolean;
  /** Одноразовая «Край» из колоды израсходована */
  edgeCardUsed: boolean;
  /** Побежденные миньоны (не показывать повторный бой на тайле) */
  defeatedEnemyIds: string[];
  /**
   * Клетка встречи: уже сработал вход в бой, пока игрок на ней (сброс при уходе).
   * [ENCOUNTER_SYSTEM.md](../docs/ENCOUNTER_SYSTEM.md)
   */
  encounterStandTile: { zoneId: WorldZoneId; x: number; y: number } | null;
  /** Мс без движения в explore (для триггера Гула) */
  exploreIdleMs: number;
  /** Триггеры ENCOUNTER_SYSTEM §3 */
  encounter: EncounterRuntime;
}

export function createInitialState(): GameState {
  return {
    mode: "intro",
    flags: {
      soothed: false,
      sawEnding: false,
      metHermitClearing: false,
      defeatedGulTrainer: false,
      understoodHum: false,
      hermitAnswersCount: 0,
      hermitPathLean: null,
      veraCampHonest: false,
      metFigure: false,
      veraMapReady: false,
      veraQuestActive: false,
      veraBridgeReported: false,
      veraBridgeWasPrettyLie: false,
      veraHasSpoken: false,
      linFirstMeetingDone: false,
      linSecondMeetingDone: false,
      linFinaleChoice: null,
      iraQuestActive: false,
      iraDeclinedOnce: false,
      iraHasSpoken: false,
      iraCrossroadsDone: false,
      veraLastCampDone: false,
      linLastCampDone: false,
      iraLastCampDone: false,
      hermitSecondMeetingDone: false,
      veraSecondMeetingDone: false,
      hermitThirdMeetingDone: false,
      lastCampForkDone: false,
      encounterIdleGulUsed: false,
      encounterShadowFromLieUsed: false,
      finaleComplete: false,
      firstGulBattleTutorialStep: 0,
    },
    playerTileX: 10,
    playerTileY: 11,
    pendingAfterDialog: null,
    acceptance: 0,
    absorption: 0,
    storySceneId: null,
    activeChoiceId: null,
    pendingStorySceneAfterBattle: null,
    pendingBattleEnemyId: null,
    pendingBattleAllyId: null,
    pendingBattlePowerScale: 1,
    pendingBattleBuffAlly: false,
    integratedEnemyIds: [],
    removedDeckCardIds: [],
    currentZoneId: "clearing",
    visitedZoneIds: [],
    neverFledBattle: true,
    edgeCardUsed: false,
    defeatedEnemyIds: [],
    encounterStandTile: null,
    exploreIdleMs: 0,
    encounter: createInitialEncounterRuntime(),
  };
}
