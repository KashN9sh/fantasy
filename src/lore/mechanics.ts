/**
 * Системные идентификаторы состояний — снимаются/накладываются движком по мере готовности.
 * Имена совпадают с лором в кавычках в ITEMS_AND_ENEMIES.
 */
export type StatusId =
  | "chilling_thought"
  | "insomnia"
  | "numbness"
  | "panic"
  | "guilt"
  | "shame"
  | "fatigue";

/** Как часто срабатывает постоянный баф */
export type BuffDurationKind = "once_per_run" | "passive" | "consumable";

/**
 * Атомарный эффект для интерпретации боем / мета-игрой.
 * Расширяй по мере появления механик.
 */
export type MechanicEffect =
  | {
      kind: "restore_resource";
      /** Сколько единиц */
      amount: number;
      /** energy / calmness — или выбор игрока, если в дизайне «энергия/спокойствие» */
      resource: "energy" | "calmness" | "player_choice";
    }
  | { kind: "remove_status"; status: StatusId }
  | { kind: "escape_bonus"; delta: number }
  | {
      kind: "free_encounter_skip";
      /** Зарядов «пропустить бой без штрафа» */
      charges: number;
    }
  | {
      kind: "refill_energy_skip_next_turn";
      /** Полная энергия, затем пропуск хода (одноразово) */
    }
  | {
      kind: "starting_stat_bonus";
      stat: "calmness";
      amount: number;
    }
  | {
      kind: "clutch_resource";
      /** При падении до 0 — оставить столько ресурса (часто 1) */
      floor: number;
    };
