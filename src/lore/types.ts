import type { BuffDurationKind, MechanicEffect } from "./mechanics";

export type CatalogCategory = "weapon" | "buff" | "spell" | "enemy" | "boss";

export interface LoreEntryBase {
  /** Стабильный ключ, snake_case */
  id: string;
  /** Номер в каталоге (1–21; босс отдельно) */
  number: number;
  name: string;
  /** Текст эффекта для дизайна / будущей механики */
  effect: string;
  /** Лор / описание */
  description: string;
}

export interface LoreWeapon extends LoreEntryBase {
  category: "weapon";
  /** Например «одноручное», «двуручное, орудие осмысления» */
  shortType: string;
}

export interface LoreBuff extends LoreEntryBase {
  category: "buff";
  /** Текстовая метка типа (лор), для UI */
  shortType: string;
  /** Машиночитаемая длительность / категория бафа */
  durationKind: BuffDurationKind;
  /** Разбор эффекта для будущего движка; `effect` остаётся человекочитаемым дублем */
  mechanics: MechanicEffect[];
}

export interface LoreSpell extends LoreEntryBase {
  category: "spell";
  /** Подтип: действие, трансформация и т.д. */
  spellType: string;
}

export interface LoreEnemy extends LoreEntryBase {
  category: "enemy";
  anxietyLevel: number;
  /** Дублирует `effect` для явного доступа к способностям */
  abilities: string;
}

export interface LoreBoss {
  category: "boss";
  id: "root_of_anxiety";
  name: string;
  /** Вводный абзац о природе босса */
  summary: string;
  /** Варианты механик (текстом) */
  mechanicVariants: string[];
  /** Финальный абзац-описание */
  flavor: string;
}

export type CatalogEntry = LoreWeapon | LoreBuff | LoreSpell | LoreEnemy | LoreBoss;

export function isBoss(e: CatalogEntry): e is LoreBoss {
  return e.category === "boss";
}
