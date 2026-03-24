import type { WorldZoneId } from "../data/worldZones";
import type { StoryNpcKind } from "../data/scenarioParts5to8";

/** 0 вода, 1 трава, 2 тропа, 3 дерево, 4 выход в следующую зону */
export const TILE = 16;
export const MAP_W = 20;
export const MAP_H = 15;

function row(...cells: number[]) {
  return cells;
}

/** Опушка (часть 1) — как в оригинальном прототипе */
const CLEARING: number[] = ([] as number[]).concat(
  row(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 4, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 3, 3, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 3, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 3, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
) as number[];

/** Мост через ручей (часть 2) — много воды, узкая тропа */
const BRIDGE: number[] = ([] as number[]).concat(
  row(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  row(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  row(0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0),
  row(0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0),
  row(0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0),
  row(0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0),
  row(0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0),
  row(0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0),
  row(0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0),
  row(0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0),
  row(0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0),
  row(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  row(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  row(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  row(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
) as number[];

/** Поляна с тремя соснами (часть 3) */
const THREE_PINES: number[] = ([] as number[]).concat(
  row(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  row(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 3, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 3, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
) as number[];

/** Роща отражений (часть 4) — к выходу в балку */
const GROVE: number[] = ([] as number[]).concat(
  row(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  row(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  row(0, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 3, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 3, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0),
  row(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
) as number[];

export const ZONE_TILES: Record<WorldZoneId, number[]> = {
  clearing: CLEARING,
  bridge: BRIDGE,
  three_pines: THREE_PINES,
  grove: GROVE,
  ravine: THREE_PINES,
  dusk: THREE_PINES,
  crossroads: THREE_PINES,
  last_camp: THREE_PINES,
  root: GROVE,
};

export interface StoryNpcSpawn {
  kind: StoryNpcKind;
  x: number;
  y: number;
}

export interface ZoneNpcLayout {
  hermit: { x: number; y: number } | null;
  /** Вера — опушка (SCENARIO 1.3) */
  vera: { x: number; y: number } | null;
  /** Лин — поляна (SCENARIO 3.1) */
  lin: { x: number; y: number } | null;
  /** Ира — роща (SCENARIO 4.1) */
  ira: { x: number; y: number } | null;
  /** Сюжетные NPC ч.5–8 ([`scenarioParts5to8`](../data/scenarioParts5to8.ts)) */
  storyNpcs: StoryNpcSpawn[];
  /**
   * Точка напряжения: вошёл на клетку → предупреждение → бой ([ENCOUNTER_SYSTEM.md](../../docs/ENCOUNTER_SYSTEM.md)).
   * Не блокирует ход, без спрайта врага.
   */
  encounter: { tileX: number; tileY: number; enemyId: string } | null;
  /** Клетка «привал» — отдых (ENCOUNTER_SYSTEM §3.2) */
  restSpot: { x: number; y: number } | null;
  /** Стартовая позиция при входе из предыдущей зоны */
  spawnIn: { x: number; y: number };
}

export const ZONE_LAYOUT: Record<WorldZoneId, ZoneNpcLayout> = {
  clearing: {
    hermit: { x: 12, y: 5 },
    vera: { x: 15, y: 6 },
    lin: null,
    ira: null,
    storyNpcs: [],
    encounter: { tileX: 8, tileY: 8, enemyId: "hum_unnamed" },
    restSpot: null,
    spawnIn: { x: 10, y: 11 },
  },
  bridge: {
    hermit: null,
    vera: null,
    lin: null,
    ira: null,
    storyNpcs: [],
    encounter: { tileX: 10, tileY: 8, enemyId: "voice_must" },
    restSpot: null,
    spawnIn: { x: 10, y: 13 },
  },
  three_pines: {
    hermit: null,
    vera: null,
    lin: { x: 12, y: 5 },
    ira: null,
    storyNpcs: [],
    encounter: { tileX: 5, tileY: 7, enemyId: "compare_others" },
    restSpot: null,
    spawnIn: { x: 10, y: 12 },
  },
  grove: {
    hermit: null,
    vera: null,
    lin: null,
    ira: { x: 6, y: 10 },
    storyNpcs: [],
    encounter: { tileX: 14, tileY: 7, enemyId: "shadow_past_decision" },
    restSpot: null,
    spawnIn: { x: 10, y: 12 },
  },
  ravine: {
    hermit: null,
    vera: null,
    lin: null,
    ira: null,
    storyNpcs: [{ kind: "hermit_ravine", x: 8, y: 6 }],
    encounter: { tileX: 10, tileY: 7, enemyId: "insomnia" },
    restSpot: null,
    spawnIn: { x: 10, y: 12 },
  },
  dusk: {
    hermit: null,
    vera: null,
    lin: null,
    ira: null,
    storyNpcs: [{ kind: "lin_dusk_second", x: 14, y: 7 }],
    encounter: { tileX: 10, tileY: 7, enemyId: "expectation_judgment" },
    restSpot: null,
    spawnIn: { x: 10, y: 12 },
  },
  crossroads: {
    hermit: null,
    vera: null,
    lin: null,
    ira: null,
    storyNpcs: [
      { kind: "vera_cross_second", x: 7, y: 7 },
      { kind: "ira_cross_second", x: 14, y: 7 },
    ],
    encounter: null,
    restSpot: null,
    spawnIn: { x: 10, y: 12 },
  },
  last_camp: {
    hermit: null,
    vera: null,
    lin: null,
    ira: null,
    storyNpcs: [
      { kind: "vera_camp_final", x: 8, y: 9 },
      { kind: "lin_camp_final", x: 12, y: 9 },
      { kind: "ira_camp_final", x: 5, y: 10 },
      { kind: "hermit_camp_third", x: 10, y: 5 },
      { kind: "figure_camp", x: 16, y: 8 },
    ],
    encounter: null,
    restSpot: { x: 10, y: 10 },
    spawnIn: { x: 10, y: 12 },
  },
  root: {
    hermit: null,
    vera: null,
    lin: null,
    ira: null,
    storyNpcs: [],
    encounter: null,
    restSpot: null,
    spawnIn: { x: 10, y: 12 },
  },
};

/** Клетка 4 = переход: северная граница следующей зоны */
export const ZONE_TRANSITION: Partial<
  Record<WorldZoneId, { tileX: number; tileY: number; to: WorldZoneId }>
> = {
  clearing: { tileX: 11, tileY: 3, to: "bridge" },
  bridge: { tileX: 10, tileY: 1, to: "three_pines" },
  three_pines: { tileX: 10, tileY: 1, to: "grove" },
  grove: { tileX: 10, tileY: 1, to: "ravine" },
  ravine: { tileX: 10, tileY: 1, to: "dusk" },
  dusk: { tileX: 10, tileY: 1, to: "crossroads" },
  crossroads: { tileX: 10, tileY: 1, to: "last_camp" },
  last_camp: { tileX: 10, tileY: 1, to: "root" },
};
