export type {
  BuffDurationKind,
  MechanicEffect,
  StatusId,
} from "./mechanics";
export type {
  CatalogCategory,
  CatalogEntry,
  LoreBoss,
  LoreBuff,
  LoreEnemy,
  LoreSpell,
  LoreWeapon,
} from "./types";
export { isBoss } from "./types";

export { LORE_BUFFS } from "./buffs";
export { LORE_BOSS } from "./boss";
export { LORE_ENEMIES } from "./enemies";
export { LORE_SPELLS } from "./spells";
export { LORE_WEAPONS } from "./weapons";

export { CATALOG_BY_ID, CATALOG_ENTRIES } from "./catalog";
export {
  getAllCatalogEntries,
  getCatalogEntry,
  getFinalBoss,
  listCatalogByCategory,
} from "./catalogRepository";
