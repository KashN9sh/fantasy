import { CATALOG_BY_ID, CATALOG_ENTRIES } from "./catalog";
import { LORE_BOSS } from "./boss";
import type { CatalogCategory, CatalogEntry, LoreBoss } from "./types";

export function getCatalogEntry(id: string): CatalogEntry | undefined {
  return CATALOG_BY_ID.get(id);
}

export function listCatalogByCategory(category: CatalogCategory): CatalogEntry[] {
  return CATALOG_ENTRIES.filter((e) => e.category === category);
}

export function getAllCatalogEntries(): CatalogEntry[] {
  return [...CATALOG_ENTRIES];
}

export function getFinalBoss(): LoreBoss {
  return LORE_BOSS;
}
