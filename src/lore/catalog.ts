import { LORE_BUFFS } from "./buffs";
import { LORE_BOSS } from "./boss";
import { LORE_ENEMIES } from "./enemies";
import { LORE_SPELLS } from "./spells";
import type { CatalogEntry } from "./types";
import { LORE_WEAPONS } from "./weapons";

/** Все записи каталога, включая финального босса */
export const CATALOG_ENTRIES: CatalogEntry[] = [
  ...LORE_WEAPONS,
  ...LORE_BUFFS,
  ...LORE_SPELLS,
  ...LORE_ENEMIES,
  LORE_BOSS,
];

const byId = new Map<string, CatalogEntry>();
for (const e of CATALOG_ENTRIES) {
  byId.set(e.id, e);
}

export const CATALOG_BY_ID: ReadonlyMap<string, CatalogEntry> = byId;
