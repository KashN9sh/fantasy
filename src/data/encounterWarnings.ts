/**
 * Тексты перед боем — [ENCOUNTER_SYSTEM.md](../../docs/ENCOUNTER_SYSTEM.md).
 */
import type { DialogLine } from "../game/types";

export const ENCOUNTER_SPEAKER = "Тропа";

function L(text: string): DialogLine[] {
  return [{ speaker: ENCOUNTER_SPEAKER, text }];
}

/** Текст по id врага (§2.3 и общий fallback) */
export const ENCOUNTER_WARNING_BY_ENEMY: Record<string, DialogLine[]> = {
  hum_unnamed: L("Ты стоишь на месте. Воздух начинает дрожать. Гул нарастает."),
  voice_must: L("Знакомый голос: «Ты опять ничего не сделал?»"),
  compare_others: L("Чьи-то лица мелькают в отражении. Чьи-то успехи."),
  shadow_past_decision: L("Тень прошлого поднимается из-за спины. Ты узнаёшь этот момент."),
  insomnia: L("Мысли идут по кругу. Ты не можешь остановиться."),
  expectation_judgment: L("Тебе кажется, что за тобой следят. Все смотрят."),
  coalition_anxiety: L("Голоса сливаются в один. Ты окружён(а)."),
  trainer_shadow: L("Воздух сгущается. Что-то требует ответа."),
};

export function getEncounterWarning(enemyId: string): DialogLine[] {
  return (
    ENCOUNTER_WARNING_BY_ENEMY[enemyId] ?? L("Воздух сгущается. Что-то требует ответа.")
  );
}

export function linesForEnemy(enemyId: string, custom?: DialogLine[]): DialogLine[] {
  return custom ?? getEncounterWarning(enemyId);
}

/** Тень после лжи Вере о мосту */
export const ENCOUNTER_SHADOW_FROM_LIE: DialogLine[] = L(
  "Ты сказал(а) неправду. Тень прошлого знает правду.",
);

// —— §3.1 движение ——
export const LINES_INSOMNIA_RUSH: DialogLine[] = L(
  "Ты идёшь, не останавливаясь. Мысли начинают петлять.",
);
export const LINES_REVISIT_SHADOW: DialogLine[] = L(
  "Здесь ты уже был(а). Что-то осталось, что ты не доделал(а).",
);
export const LINES_WANDER_GUL_INSOMNIA: DialogLine[] = L(
  "Ты не можешь решиться. Воздух гудит, мысли путаются.",
);
export const LINES_PASS_NPC: DialogLine[] = L(
  "Ты прошёл(ла) мимо. Тебе кажется, что они смотрят вслед.",
);
export const LINES_INVENTORY_COMPARE: DialogLine[] = L(
  "Ты смотришь на свои опоры. Чьи-то другие кажутся лучше.",
);

// —— §3.2 диалоги ——
export const LINES_REST_VOICE: DialogLine[] = L(
  "«Ты решил(а) отдохнуть? А кто будет делать?»",
);
export const LINES_REST_DECLINE_INSOMNIA: DialogLine[] = L(
  "Ты не даёшь себе отдыха. Мысли не дают покоя.",
);
export const LINES_GENERIC_LIE_SHADOW: DialogLine[] = L(
  "Ты сказал(а) неправду. Тень прошлого знает правду.",
);
export const LINES_HURTFUL_TRUTH: DialogLine[] = L(
  "«Зачем ты это сказал(а)? Теперь они думают иначе.»",
);
export const LINES_REFUSE_HELP_VOICE: DialogLine[] = L(
  "«Ты мог(ла) помочь. Ты должен(на) был(а).»",
);
export const LINES_SILENCE_GUL: DialogLine[] = L(
  "Тишина. Но она не пустая. Что-то заполняет её.",
);
export const LINES_INTERRUPT_VOICE: DialogLine[] = L(
  "«Ты не дал(а) мне договорить. Теперь я скажу.»",
);

// —— §3.3 стиль прохождения ——
export const LINES_THREE_SAME_TYPE: DialogLine[] = L(
  "Ты всё время держишься одним и тем же способом. Кажется, у других это выходит лучше.",
);
export const LINES_ZONES_NO_CARDS_GUL: DialogLine[] = L(
  "Ты обходишь шум стороной. Но он всё равно копится внутри.",
);
export const LINES_THREE_ABSORPTION: DialogLine[] = L(
  "Ты снова и снова давишь. Мысли не успевают за тобой.",
);
export const LINES_THREE_ACCEPTANCE: DialogLine[] = L(
  "«Ты слишком мягкий(ая). Тебя раздавят.»",
);
export const LINES_THREE_DISCARD_SHADOW: DialogLine[] = L(
  "Ты всё время отходишь назад. То, что не встретил(а), возвращается.",
);
export const LINES_LOST_CARD_SHADOW: DialogLine[] = L(
  "Одна из твоих опор замолкает. Прошлое не отпускает.",
);

// —— §3.4 после боёв ——
export const LINES_REMATCH_STRONGER: DialogLine[] = L(
  "Ты думал(а), что победил(а). Но враг вернулся. Сильнее.",
);
export const LINES_FLEE_REINFORCEMENT: DialogLine[] = L(
  "Ты убежал(а). Враг привёл подкрепление.",
);
export const LINES_COALITION_WINS: DialogLine[] = L(
  "Ты слишком долго дерёшься. Голоса сливаются в один.",
);
export const LINES_DEFEAT_RETURN: DialogLine[] = L(
  "Ты проиграл(а). Прошлое напоминает. Голос требует ответа.",
);

// —— §3.5 прогресс ——
export const LINES_FIVE_ZONES_COALITION: DialogLine[] = L(
  "Ты далеко зашёл(ла). Тревога собирается в стаю.",
);
export const LINES_SEVEN_ZONES_QUIET: DialogLine[] = L(
  "Ты слишком долго не слышал(а) шум. Он навёрстывает упущенное.",
);
export const LINES_THREE_BATTLES_VOICE: DialogLine[] = L(
  "«Ты слишком много дерёшься. Может, хватит?»",
);
export const LINES_SHIFT_FIVE_OPPOSITE: DialogLine[] = L(
  "Ты выбрал(а) свой путь. Другая сторона не молчит.",
);
export const LINES_SHIFT_EIGHT_COALITION: DialogLine[] = L(
  "Ты слишком глубоко в одном направлении. Тревога пытается вернуть равновесие.",
);

// —— §3.6 ——
export const LINES_ALLY_FEUD: DialogLine[] = L(
  "К шуму добавляется голос. Они говорят вместе. Или спорят.",
);
export const LINES_ONE_UNDERSTOOD_OTHER_LOUDER: DialogLine[] = L(
  "Один враг замолчал. Другой становится громче.",
);
