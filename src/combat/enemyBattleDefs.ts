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
    intentLines: {
      light: ["Шум просто остаётся рядом.", "Он опять здесь, на краю внимания."],
      medium: ["Если прислушаться, он становится ближе.", "Тишина снова не держится."],
      heavy: ["Шум заполняет всё пространство.", "Кажется, от него некуда деться."],
    },
    intentEffects: ["Проверяет, сорвёшься ли ты в нажим или бегство."],
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
    intentLines: {
      light: ["Я уже видел этот страх.", "Ты снова узнаёшь меня слишком быстро."],
      medium: ["Сейчас ты опять дрогнешь.", "Я подойду ближе, и ты сожмёшься."],
      heavy: ["Ты не выдержишь, если я стану ближе.", "Смотри, как тело уже готово отступить."],
    },
    intentEffects: ["Прямое давление: пытается сбить спокойствие."],
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
    intentLines: {
      light: ["Ты опять не справился.", "Этого всё ещё недостаточно."],
      medium: ["А что подумают другие?", "Ты снова отстаёшь."],
      heavy: ["Ты должен был сделать лучше.", "Почему ты не можешь нормально справиться?"],
    },
    intentEffects: ["Наложит вину.", "Иногда добавляет панику поверх вины."],
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
    intentLines: {
      light: ["У них получилось, а у тебя?", "Ты опять смотришь не туда."],
      medium: ["Посмотри, как далеко они ушли.", "Ты опять сравниваешь свой шаг с чужим."],
      heavy: ["Ты отстаёшь от всех сразу.", "Чужая высота сейчас обрушится на тебя."],
    },
    intentEffects: ["Если ты уже в блоке, давление становится сильнее."],
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
    intentLines: {
      light: ["Ты мог поступить иначе.", "Всё началось там, помнишь?"],
      medium: ["Ты до сих пор несёшь то решение.", "Старый момент снова становится настоящим."],
      heavy: ["Ты всё испортил ещё тогда.", "Сейчас ты снова проживёшь это место."],
    },
    intentEffects: ["Наложит сожаление и потянет назад."],
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
    intentLines: {
      light: ["Просто полежи и подумай ещё чуть-чуть.", "Сейчас не время спать."],
      medium: ["Давай ещё один круг мыслей.", "Если не решишь это сейчас, не уснёшь."],
      heavy: ["Ты не заснёшь, пока не разберёшь всё до конца.", "Тело устало, но мысли только разгоняются."],
    },
    intentEffects: ["Наложит усталость.", "Особенно наказывает повторный нажим."],
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
    intentLines: {
      light: ["На тебя смотрят.", "Не ошибись у них на глазах."],
      medium: ["Все заметят, если ты сейчас дрогнешь.", "Ты должен выглядеть лучше, чем чувствуешь."],
      heavy: ["Если ошибёшься сейчас, это запомнят.", "Чужой взгляд уже решает за тебя."],
    },
    intentEffects: ["Наложит стыд.", "Плохо переносит безопасное повторение одной защиты."],
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
    intentLines: {
      light: ["Я уже внутри этого ритма.", "Ты чувствуешь меня раньше мысли."],
      medium: ["Я поднимаюсь изнутри.", "Всё снова собирается вокруг меня."],
      heavy: ["Сейчас я стану всем, что есть вокруг.", "Ты не обойдёшь меня одним привычным жестом."],
    },
    intentEffects: ["Сильное прямое давление.", "Питается повторяющимся ритмом ответа."],
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
    intentLines: {
      light: ["Один голос ещё можно пережить. Нас уже больше.", "Каждый из нас подхватит следующую трещину."],
      medium: ["Мы договорим это хором.", "Ты не успеешь ответить всем сразу."],
      heavy: ["Сейчас на тебя обрушатся все голоса разом.", "Твоего привычного ответа нам уже мало."],
    },
    intentEffects: ["Несколько голосов давят одновременно.", "Эхо добавляют свой урон отдельно."],
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
