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
  | "credits";

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
  /** Завершён финальный поток (титры можно не повторять) */
  finaleComplete: boolean;
}

export interface AfterDialog {
  openCard: boolean;
  openEnd: boolean;
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
  /** Понятые враги — задел под карты интеграции (фаза 2) */
  integratedEnemyIds: string[];
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
      finaleComplete: false,
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
    integratedEnemyIds: [],
    currentZoneId: "clearing",
    visitedZoneIds: [],
    neverFledBattle: true,
    edgeCardUsed: false,
    defeatedEnemyIds: [],
  };
}
