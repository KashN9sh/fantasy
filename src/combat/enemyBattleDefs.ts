import type { BattleEnemyDef } from "./types";

const ENEMY_BATTLE_DEFS: Record<string, BattleEnemyDef> = {
  hum_unnamed: {
    id: "hum_unnamed",
    name: "Гул без названия",
    level: 2,
    hp: 14,
    intentDamage: 0,
    attacks: [
      { tier: "light", weight: 50, min: 0, max: 0 },
      { tier: "medium", weight: 30, min: 0, max: 0 },
      { tier: "heavy", weight: 20, min: 0, max: 0 },
    ],
    adaptationRules: [
      {
        trigger: "same_style",
        threshold: 2,
        styles: ["absorption"],
        hint: "Гул сгущается вокруг повторного нажима.",
        log: "Гул привыкает к твоему усилию и начинает звучать плотнее.",
        intentText: "гул цепляется за твой нажим",
        effects: [
          { kind: "intent_bonus", amount: 1 },
          { kind: "pressure", amount: 1 },
        ],
      },
    ],
  },
  trainer_shadow: {
    id: "trainer_shadow",
    name: "Тень тревоги",
    level: 6,
    hp: 18,
    intentDamage: 3,
    attacks: [
      { tier: "light", weight: 50, min: 2, max: 3 },
      { tier: "medium", weight: 30, min: 3, max: 4 },
      { tier: "heavy", weight: 20, min: 4, max: 5 },
    ],
    adaptationRules: [
      {
        trigger: "same_response",
        threshold: 2,
        hint: "Тень тревоги уже ждёт этот жест.",
        log: "Тень тревоги подстраивается под твой повтор и входит ближе.",
        intentText: "перехватывает знакомый жест",
        effects: [{ kind: "intent_bonus", amount: 1 }],
      },
    ],
  },
  voice_must: {
    id: "voice_must",
    name: "Голос «ты должен»",
    level: 6,
    hp: 18,
    intentDamage: 3,
    attacks: [
      { tier: "light", weight: 50, min: 2, max: 3 },
      { tier: "medium", weight: 30, min: 3, max: 4 },
      { tier: "heavy", weight: 20, min: 4, max: 5 },
    ],
    adaptationRules: [
      {
        trigger: "same_style",
        threshold: 2,
        styles: ["acceptance", "withdrawal", "steady"],
        hint: "Голос учится давить через твой привычный мягкий ответ.",
        log: "Голос находит новую форму упрёка в твоём повторяющемся ритме.",
        intentText: "находит зазор в твоём ответе",
        effects: [
          { kind: "intent_bonus", amount: 1 },
          { kind: "set_debuff", debuff: "guilt", turns: 2 },
        ],
      },
    ],
  },
  compare_others: {
    id: "compare_others",
    name: "Сравнение с другими",
    level: 5,
    hp: 16,
    intentDamage: 2,
    attacks: [
      { tier: "light", weight: 50, min: 2, max: 2 },
      { tier: "medium", weight: 30, min: 3, max: 4 },
      { tier: "heavy", weight: 20, min: 4, max: 5 },
    ],
    adaptationRules: [
      {
        trigger: "same_response",
        threshold: 2,
        hint: "Сравнение уже ждёт именно этот ход.",
        log: "Сравнение замечает повтор и подменяет твой ритм чужой меркой.",
        intentText: "предугадывает твой следующий жест",
        effects: [
          { kind: "intent_bonus", amount: 1 },
          { kind: "ignore_block", amount: 2 },
        ],
      },
      {
        trigger: "same_style",
        threshold: 3,
        styles: ["steady", "withdrawal"],
        hint: "Предсказуемость делает тебя прозрачнее для чужого взгляда.",
        log: "Чем ровнее ты повторяешься, тем легче тебя мерить извне.",
        intentText: "читает тебя по повторяющемуся рисунку",
        effects: [{ kind: "set_debuff", debuff: "shame", turns: 2 }],
      },
    ],
  },
  shadow_past_decision: {
    id: "shadow_past_decision",
    name: "Тень прошлого решения",
    level: 8,
    hp: 20,
    intentDamage: 3,
    attacks: [
      { tier: "light", weight: 50, min: 2, max: 3 },
      { tier: "medium", weight: 30, min: 4, max: 4 },
      { tier: "heavy", weight: 20, min: 5, max: 6 },
    ],
    adaptationRules: [
      {
        trigger: "same_response",
        threshold: 2,
        hint: "Прошлое цепляется за повтор и тянет тем же крюком.",
        log: "Один и тот же ответ только крепче возвращает тебя в старую петлю.",
        intentText: "тянет туда же, где уже было больно",
        effects: [
          { kind: "intent_bonus", amount: 1 },
          { kind: "set_debuff", debuff: "regret", turns: 2 },
        ],
      },
    ],
  },
  insomnia: {
    id: "insomnia",
    name: "Бессонница",
    level: 4,
    hp: 12,
    intentDamage: 0,
    attacks: [
      { tier: "light", weight: 50, min: 0, max: 0 },
      { tier: "medium", weight: 30, min: 0, max: 0 },
      { tier: "heavy", weight: 20, min: 0, max: 0 },
    ],
    adaptationRules: [
      {
        trigger: "same_style",
        threshold: 2,
        styles: ["absorption"],
        hint: "Бессонница раскручивается от попыток снова додавить.",
        log: "Каждый новый нажим только сильнее будит тело.",
        intentText: "раскачивает мысли ещё сильнее",
        effects: [
          { kind: "intent_bonus", amount: 1 },
          { kind: "set_debuff", debuff: "fatigue", turns: 2 },
          { kind: "reduce_understanding", amount: 1 },
        ],
      },
      {
        trigger: "same_response",
        threshold: 2,
        responseIds: ["ground", "step_back", "night_talk"],
        hint: "Даже тихий ритм начинает звучать как петля.",
        log: "Бессонница подхватывает даже мягкий повтор и превращает его в круг.",
        intentText: "повторяет твою же мысль по кругу",
        effects: [{ kind: "intent_bonus", amount: 1 }],
      },
    ],
  },
  expectation_judgment: {
    id: "expectation_judgment",
    name: "Ожидание «а что подумают»",
    level: 10,
    hp: 22,
    intentDamage: 4,
    attacks: [
      { tier: "light", weight: 50, min: 3, max: 4 },
      { tier: "medium", weight: 30, min: 4, max: 5 },
      { tier: "heavy", weight: 20, min: 5, max: 6 },
    ],
    adaptationRules: [
      {
        trigger: "same_style",
        threshold: 2,
        styles: ["steady", "withdrawal"],
        hint: "Ожидание уже знает, как ты будешь защищаться.",
        log: "Чужой взгляд подстраивается под твою безопасную форму.",
        intentText: "давит туда, где ты уже привычно закрываешься",
        effects: [
          { kind: "intent_bonus", amount: 1 },
          { kind: "set_debuff", debuff: "shame", turns: 2 },
        ],
      },
    ],
  },
  root_of_anxiety: {
    id: "root_of_anxiety",
    name: "Корень тревоги",
    level: 16,
    hp: 28,
    intentDamage: 5,
    attacks: [
      { tier: "light", weight: 50, min: 4, max: 5 },
      { tier: "medium", weight: 30, min: 5, max: 6 },
      { tier: "heavy", weight: 20, min: 6, max: 7 },
    ],
    adaptationRules: [
      {
        trigger: "same_style",
        threshold: 2,
        hint: "Корень тревоги питается повторяющимся ритмом.",
        log: "Корень тревоги узнаёт рисунок и цепляется глубже.",
        intentText: "поднимается в такт твоему повтору",
        effects: [
          { kind: "intent_bonus", amount: 1 },
          { kind: "pressure", amount: 1 },
        ],
      },
    ],
  },
  coalition_anxiety: {
    id: "coalition_anxiety",
    name: "Коалиция голосов",
    level: 9,
    hp: 20,
    intentDamage: 3,
    attacks: [
      { tier: "light", weight: 50, min: 2, max: 3 },
      { tier: "medium", weight: 30, min: 3, max: 4 },
      { tier: "heavy", weight: 20, min: 4, max: 5 },
    ],
    adaptationRules: [
      {
        trigger: "same_style",
        threshold: 2,
        hint: "Коалиция голосов быстро ловит повторяющийся тон.",
        log: "Голоса раскладывают твой повтор на несколько упрёков сразу.",
        intentText: "подхватывает твой ритм разными голосами",
        effects: [{ kind: "intent_bonus", amount: 1 }],
      },
    ],
  },
};

export function getEnemyBattleDef(enemyId: string): BattleEnemyDef {
  return ENEMY_BATTLE_DEFS[enemyId] ?? ENEMY_BATTLE_DEFS.hum_unnamed;
}
