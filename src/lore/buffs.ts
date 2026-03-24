import type { LoreBuff } from "./types";

export const LORE_BUFFS: LoreBuff[] = [
  {
    category: "buff",
    id: "hot_tea_silence",
    number: 6,
    name: "Горячий чай в тишине",
    shortType: "постоянный (один раз за игру)",
    durationKind: "once_per_run",
    mechanics: [
      { kind: "restore_resource", amount: 3, resource: "player_choice" },
      { kind: "remove_status", status: "chilling_thought" },
    ],
    effect:
      "Восстанавливает 3 единицы ресурса (энергии / спокойствия). Снимает «Леденящая дума».",
    description:
      "Кружка, которую не нужно ни с кем делить. Пар, поднимающийся к лицу. Десять минут, которые принадлежат только тебе. Не требует повода.",
  },
  {
    category: "buff",
    id: "aimless_walk",
    number: 7,
    name: "Прогулка без цели",
    shortType: "постоянный",
    durationKind: "passive",
    mechanics: [
      { kind: "escape_bonus", delta: 1 },
      { kind: "free_encounter_skip", charges: 1 },
    ],
    effect:
      "+1 к сбеганию от любых врагов. Один раз можно пропустить бой без штрафа.",
    description:
      "Ноги ведут сами. Мимо знакомых дворов, под фонарями, без музыки, без подкаста. Просто движение. Мысли перестают гнаться и просто идут рядом.",
  },
  {
    category: "buff",
    id: "honest_tired",
    number: 8,
    name: "Честное «я устал»",
    shortType: "одноразовый",
    durationKind: "consumable",
    mechanics: [{ kind: "refill_energy_skip_next_turn" }],
    effect: "Восстанавливает всю энергию, но следующий ход пропускаешь.",
    description:
      "Сказать вслух — себе или кому-то. Без оправданий, без «но надо». Признать, что сил нет — это и есть первый шаг к тому, чтобы они появились. Против системы «всегда быть продуктивным» наносит критический урон.",
  },
  {
    category: "buff",
    id: "dreamless_sleep",
    number: 9,
    name: "Сон, в котором не снилось ничего",
    shortType: "постоянный",
    durationKind: "passive",
    mechanics: [
      { kind: "starting_stat_bonus", stat: "calmness", amount: 3 },
      { kind: "remove_status", status: "insomnia" },
    ],
    effect: "Старт игры с +3 к спокойствию. Снимает накопленный эффект «Бессонница».",
    description:
      "Провалиться в темноту и вынырнуть через несколько часов, не помня, где был. Тело отдохнуло. Мозг перезагрузился. Чувство, будто мир стал чуть мягче.",
  },
  {
    category: "buff",
    id: "support_unasked",
    number: 10,
    name: "Поддержка, которую не просил",
    shortType: "одноразовый",
    durationKind: "consumable",
    mechanics: [{ kind: "clutch_resource", floor: 1 }],
    effect: "Срабатывает при падении до 0 ресурса: оставляет 1 ресурс.",
    description:
      "Кто-то написал: «как ты?» в тот самый момент. Или просто поставил лайк под старым фото. Маленький сигнал: ты не один. Не лечит, но не даёт упасть окончательно.",
  },
];
