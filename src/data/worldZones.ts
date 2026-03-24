/**
 * Задел фазы 2: зоны оверворлда и переходы между локациями сценария.
 * Подключить к [`Overworld`](../game/Overworld.ts), когда появятся несколько тайлмапов.
 */
export const WORLD_ZONE_IDS = [
  "clearing",
  "bridge",
  "three_pines",
  "grove",
  "ravine",
  "dusk",
  "crossroads",
  "last_camp",
  "root",
] as const;

export type WorldZoneId = (typeof WORLD_ZONE_IDS)[number];
