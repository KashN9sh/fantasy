import "./style.css";
import { summarizeBattleEnd } from "./combat/engine";
import type { BattleState } from "./combat/types";
import {
  buildBattleDeckIds,
  buildBattleSamplingContext,
  tryEncounterThreeSameDeckCategory,
} from "./combat/deckBuild";
import { getBattleCardDef } from "./combat/battleCardDefs";
import { syncThemeFromGameMode } from "./theme/syncGameTheme";
import { getHermitDialog } from "./data/story";
import { CHOICE_FORK_CLEARING, AFTER_FORK_LINES, INTRO_SCREENS } from "./data/storyScenes";
import {
  HERMIT_DEFEAT_OR_UNDERSTAND_OPTIONS,
  HERMIT_DEFEAT_OR_UNDERSTAND_PROMPT,
  HERMIT_FIRST_INTRO,
  HERMIT_FIRST_OUTRO,
  HERMIT_REACTION_THEN_OUTRO,
  IRA_FIRST_INTRO,
  IRA_QUEST_OPTIONS,
  IRA_QUEST_PROMPT,
  IRA_QUEST_RESOLUTION,
  IRA_SHORT_RETURN,
  LIN_CHOICE_OPTIONS,
  LIN_CHOICE_PROMPT,
  LIN_FIRST_INTRO,
  LIN_OUTRO,
  LIN_REACTION,
  LIN_REPEAT,
  VERA_AFTER_BRIDGE,
  VERA_BRIDGE_OPTIONS,
  VERA_BRIDGE_PROMPT,
  VERA_BRIDGE_RESOLUTION,
  VERA_FIRST_INTRO,
  VERA_QUEST_OPTIONS,
  VERA_QUEST_PROMPT,
  VERA_QUEST_RESOLUTION,
  VERA_SHORT_RETURN,
  VERA_THANKS_UPDATED_MAP,
} from "./data/scenarioParts1to4";
import {
  FIGURE_INTRO,
  FIGURE_OPTIONS,
  FIGURE_PROMPT,
  FIGURE_RESOLUTION,
  HERMIT_CAMP_INTRO,
  HERMIT_CAMP_OPTIONS,
  HERMIT_CAMP_OUTRO,
  HERMIT_CAMP_QUESTION,
  HERMIT_CAMP_REACTION,
  HERMIT_RAVINE_INTRO,
  HERMIT_RAVINE_OPTIONS,
  HERMIT_RAVINE_OUTRO,
  HERMIT_RAVINE_QUESTION,
  HERMIT_RAVINE_REACTION,
  IRA_CROSS_INTRO,
  IRA_CROSS_OPTIONS,
  IRA_CROSS_OUTRO,
  IRA_CROSS_PROMPT,
  IRA_CAMP_FULL,
  IRA_CAMP_HALF,
  LAST_CAMP_FORK_OPTIONS,
  LAST_CAMP_FORK_PROMPT,
  LIN_CAMP_FLOWERS,
  LIN_CAMP_GONE,
  LIN_CAMP_NEUTRAL,
  LIN_CAMP_NEW,
  LIN_DUSK_INTRO,
  LIN_DUSK_OPTIONS,
  LIN_DUSK_OUTRO,
  LIN_DUSK_PROMPT,
  LIN_DUSK_RESOLUTION,
  VERA_CAMP_HONESTY_OPTIONS,
  VERA_CAMP_HONESTY_PROMPT,
  VERA_CAMP_INTRO,
  VERA_CAMP_PROMPT,
  VERA_CAMP_OPTIONS,
  VERA_CAMP_RESOLUTION_HONEST,
  VERA_CAMP_RESOLUTION_LIE,
  VERA_CROSS_INTRO,
  VERA_CROSS_OPTIONS,
  VERA_CROSS_OUTRO,
  VERA_CROSS_PROMPT,
  VERA_CROSS_REACTION,
  type StoryNpcKind,
} from "./data/scenarioParts5to8";
import type { WorldZoneId } from "./data/worldZones";
import {
  ROOT_ABSORPTION_OPEN,
  ROOT_ACCEPTANCE_ECHO,
  ROOT_ACCEPTANCE_OPEN,
  ROOT_ACCEPTANCE_Q1,
  ROOT_ACCEPTANCE_Q2,
  ROOT_ACCEPTANCE_Q3,
  ROOT_ASSEMBLY_FIGURE,
  ROOT_ASSEMBLY_HERMIT,
  ROOT_ASSEMBLY_IRA,
  ROOT_ASSEMBLY_LIN,
  ROOT_ASSEMBLY_VERA_BAD,
  ROOT_ASSEMBLY_VERA_GOOD,
  ROOT_EPILOG_ABSORPTION_FIGURE,
  ROOT_EPILOG_ABSORPTION_HERMIT,
  ROOT_EPILOG_ABSORPTION_IRA,
  ROOT_EPILOG_ABSORPTION_LIN,
  ROOT_EPILOG_ABSORPTION_VERA,
  ROOT_EPILOG_ACCEPTANCE_FIGURE,
  ROOT_EPILOG_ACCEPTANCE_HERMIT,
  ROOT_EPILOG_ACCEPTANCE_IRA,
  ROOT_EPILOG_ACCEPTANCE_LIN,
  ROOT_EPILOG_ACCEPTANCE_VERA,
  ROOT_EPILOG_NEUTRAL_CLOSING,
  ROOT_HERMIT_FOURTH_INTRO,
  ROOT_HERMIT_FOURTH_OPTIONS,
  ROOT_HERMIT_FOURTH_OUTRO,
  ROOT_HERMIT_FOURTH_PROMPT,
  ROOT_LOCATION_INTRO,
  ROOT_NEUTRAL_ADVICE_HERMIT,
  ROOT_NEUTRAL_ADVICE_IRA,
  ROOT_NEUTRAL_ADVICE_LIN,
  ROOT_NEUTRAL_ADVICE_VERA,
  ROOT_NEUTRAL_FORK_OPEN,
  ROOT_NEUTRAL_FORK_OPTIONS,
  ROOT_NEUTRAL_FORK_PROMPT,
  ROOT_RESOLUTION_ABSORPTION_MAIN,
  ROOT_RESOLUTION_ACCEPTANCE_MAIN,
  ROOT_RESOLUTION_NEUTRAL_MAIN,
  ROOT_SPEAKER,
  rootAcceptanceCircle1Options,
  rootAcceptanceCircle2Options,
  rootAcceptanceCircle3Options,
} from "./data/scenarioPart9";
import { ZONE_FIRST_ENTER_LINES } from "./data/zoneStories";
import {
  getFinaleAssembly,
  getFinaleTrack,
  type FinaleAssembly,
  type FinaleTrack,
} from "./game/finaleTrack";
import {
  LINES_HURTFUL_TRUTH,
  LINES_INVENTORY_COMPARE,
  LINES_INTERRUPT_VOICE,
  LINES_REFUSE_HELP_VOICE,
  LINES_REST_VOICE,
  LINES_SILENCE_GUL,
} from "./data/encounterWarnings";
import {
  applyBattleEndToEncounters,
  encounterOnZoneEntered,
  evaluateExploreEncounters,
  signalEncounterDialogPause,
  signalEncounterRestPause,
  tickExploreEncounterIdle,
  tryConsumeShadowLieEncounter,
  tryConsumeShiftEncounter,
  type PendingEncounter,
} from "./game/encounters";
import {
  createInitialState,
  type BattleEndSummary,
  type DialogLine,
  type GameMode,
  type GameState,
  type HermitPathLean,
  type LinFinaleChoice,
  type StoryChoiceOption,
} from "./game/types";
import { consumePress, initInput } from "./game/input";
import {
  onZoneExitTile,
  renderOverworld,
  tryConsumeStoryNpcInteraction,
  tryConsumeZoneTransition,
  tryStartHermitDialog,
  tryStartIraDialog,
  tryStartLinDialog,
  tryStartRest,
  tryStartVeraDialog,
  updateOverworld,
} from "./game/Overworld";
import { resetEncounterStandTile } from "./game/encounters";
import { ZONE_LAYOUT } from "./game/overworldMaps";
import { createBattleUI } from "./ui/BattleUI";
import { createCardSceneController } from "./ui/CardScene";
import { createDialogController } from "./ui/Dialog";
import { runEncounterPrelude } from "./ui/encounterPrelude";
import { createIntroOverlay } from "./ui/IntroOverlay";
import { createStoryChoice } from "./ui/StoryChoice";
import { playCombatAudioEvent } from "./audio/combatAudio";

const canvas = document.querySelector<HTMLCanvasElement>("#world");
const uiRoot = document.querySelector<HTMLElement>("#ui-root");

if (!canvas || !uiRoot) {
  throw new Error("Не найдены #world или #ui-root");
}

const rootEl = uiRoot;
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("2d context недоступен");
const worldCtx = ctx;

initInput();

const state: GameState = createInitialState();
let combatState: BattleState | null = null;
let deckViewAccumMs = 0;
let deckViewWrap: HTMLDivElement | null = null;

function resumeExplore() {
  signalEncounterDialogPause(state);
  const m: GameMode = "explore";
  state.mode = m;
}

const REST_CHOICE_OPTIONS: StoryChoiceOption[] = [
  {
    id: "rest_yes",
    label: "Присесть",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "rest_yes",
  },
  {
    id: "rest_no",
    label: "Идти дальше",
    acceptanceDelta: 0,
    absorptionDelta: 0,
    nextSceneId: "rest_no",
  },
];

function closeDeckViewUi() {
  deckViewWrap?.remove();
  deckViewWrap = null;
  deckViewAccumMs = 0;
}

function openDeckViewUi() {
  if (state.mode !== "explore") return;
  closeDeckViewUi();
  state.mode = "deck_view";
  deckViewAccumMs = 0;
  const ids = buildBattleDeckIds(state);
  deckViewWrap = document.createElement("div");
  deckViewWrap.className = "deck-view-overlay";
  const items = ids
    .map((id) => {
      const d = getBattleCardDef(id);
      return `<li>${escapeHtmlDeck(d?.name ?? id)}</li>`;
    })
    .join("");
  deckViewWrap.innerHTML = `
    <div class="deck-view-box">
      <h3 class="deck-view-title">Колода</h3>
      <p class="deck-view-hint">Удерживай открытым 20 с — триггер «Сравнение». I или Esc — закрыть.</p>
      <ul class="deck-view-list">${items}</ul>
    </div>
  `;
  rootEl.appendChild(deckViewWrap);
}

function escapeHtmlDeck(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function maybeShiftEncounter() {
  const enc = tryConsumeShiftEncounter(state);
  if (enc) startEncounterFromPending(enc);
}

const dialog = createDialogController(rootEl);
const cards = createCardSceneController(rootEl);
const intro = createIntroOverlay(rootEl);
const storyChoice = createStoryChoice(rootEl);

function showCredits() {
  const wrap = document.createElement("div");
  wrap.className = "end-screen";
  wrap.innerHTML = `
    <h2>Тихая тропа</h2>
    <p>Сценарий: часть 9 «Корень» и финал по [FINALE.md]. Спасибо за игру.</p>
    <p class="credits-meta">Колода и вероятности — DECK.md / DECK_PROBABILITIES.md</p>
    <button type="button" class="card-close">Вернуться</button>
  `;
  wrap.querySelector("button")?.addEventListener("click", () => {
    wrap.remove();
    resumeExplore();
    state.flags.finaleComplete = true;
  });
  rootEl.appendChild(wrap);
}

function filterAcceptanceCircleOptions(
  opts: StoryChoiceOption[],
  asm: FinaleAssembly,
): StoryChoiceOption[] {
  const filtered = opts.filter((o) => {
    if (o.id.includes("_vera_")) return asm.vera === "good";
    if (o.id.includes("_lin_")) return asm.lin;
    if (o.id.includes("_ira_")) return asm.ira;
    if (o.id.includes("_hermit_")) return true;
    return false;
  });
  const hermitOnly = opts.filter((o) => o.id.includes("_hermit_"));
  return filtered.length > 0 ? filtered : hermitOnly;
}

function hermitFourthThenCredits(): void {
  state.mode = "finale";
  dialog.mount(ROOT_HERMIT_FOURTH_INTRO, () => {
    storyChoice.mount(ROOT_HERMIT_FOURTH_PROMPT, ROOT_HERMIT_FOURTH_OPTIONS, (_opt) => {
      dialog.mount(ROOT_HERMIT_FOURTH_OUTRO, () => {
        state.mode = "credits";
        showCredits();
      });
    });
  });
}

function runPhase3AcceptanceFromRoot(asm: FinaleAssembly, done: () => void): void {
  const lines: DialogLine[] = [...ROOT_RESOLUTION_ACCEPTANCE_MAIN];
  if (asm.vera === "good") lines.push(...ROOT_EPILOG_ACCEPTANCE_VERA);
  if (asm.lin) lines.push(...ROOT_EPILOG_ACCEPTANCE_LIN);
  if (asm.ira) lines.push(...ROOT_EPILOG_ACCEPTANCE_IRA);
  lines.push(...ROOT_EPILOG_ACCEPTANCE_HERMIT);
  if (asm.figure) lines.push(...ROOT_EPILOG_ACCEPTANCE_FIGURE);
  dialog.mount(lines, done);
}

function runPhase3AbsorptionFromRoot(asm: FinaleAssembly, done: () => void): void {
  const lines: DialogLine[] = [...ROOT_RESOLUTION_ABSORPTION_MAIN];
  if (asm.vera !== "absent") lines.push(...ROOT_EPILOG_ABSORPTION_VERA);
  if (asm.lin) lines.push(...ROOT_EPILOG_ABSORPTION_LIN);
  if (asm.ira) lines.push(...ROOT_EPILOG_ABSORPTION_IRA);
  lines.push(...ROOT_EPILOG_ABSORPTION_HERMIT);
  if (asm.figure) lines.push(...ROOT_EPILOG_ABSORPTION_FIGURE);
  dialog.mount(lines, done);
}

function runPhase3NeutralFromRoot(_asm: FinaleAssembly, done: () => void): void {
  dialog.mount([...ROOT_RESOLUTION_NEUTRAL_MAIN, ...ROOT_EPILOG_NEUTRAL_CLOSING], done);
}

function runFinalePhase2Acceptance(asm: FinaleAssembly): void {
  dialog.mount(ROOT_ACCEPTANCE_OPEN, () => {
    const o1 = filterAcceptanceCircleOptions(rootAcceptanceCircle1Options(), asm);
    storyChoice.mount(ROOT_ACCEPTANCE_Q1, o1, (_opt) => {
      dialog.mount(ROOT_ACCEPTANCE_ECHO, () => {
        const o2 = filterAcceptanceCircleOptions(rootAcceptanceCircle2Options(), asm);
        storyChoice.mount(ROOT_ACCEPTANCE_Q2, o2, (_opt) => {
          dialog.mount(ROOT_ACCEPTANCE_ECHO, () => {
            const o3 = filterAcceptanceCircleOptions(rootAcceptanceCircle3Options(), asm);
            storyChoice.mount(ROOT_ACCEPTANCE_Q3, o3, (_opt) => {
              dialog.mount(ROOT_ACCEPTANCE_ECHO, () => {
                runPhase3AcceptanceFromRoot(asm, () => hermitFourthThenCredits());
              });
            });
          });
        });
      });
    });
  });
}

function runFinalePhase2Absorption(): void {
  dialog.mount(ROOT_ABSORPTION_OPEN, () => {
    state.mode = "battle";
    state.pendingBattleEnemyId = "root_of_anxiety";
    battleUI.mount();
  });
}

function runFinalePhase2Neutral(asm: FinaleAssembly): void {
  const advice: DialogLine[] = [...ROOT_NEUTRAL_FORK_OPEN];
  if (asm.vera === "good") advice.push(...ROOT_NEUTRAL_ADVICE_VERA);
  if (asm.lin) advice.push(...ROOT_NEUTRAL_ADVICE_LIN);
  if (asm.ira) advice.push(...ROOT_NEUTRAL_ADVICE_IRA);
  advice.push(...ROOT_NEUTRAL_ADVICE_HERMIT);
  dialog.mount(advice, () => {
    storyChoice.mount(ROOT_NEUTRAL_FORK_PROMPT, ROOT_NEUTRAL_FORK_OPTIONS, (opt) => {
      state.acceptance += opt.acceptanceDelta;
      state.absorption += opt.absorptionDelta;
      if (opt.id === "nf_light") {
        runPhase3AcceptanceFromRoot(asm, () => hermitFourthThenCredits());
      } else if (opt.id === "nf_dark") {
        runPhase3AbsorptionFromRoot(asm, () => hermitFourthThenCredits());
      } else {
        runPhase3NeutralFromRoot(asm, () => hermitFourthThenCredits());
      }
    });
  });
}

function runFinalePhase2(track: FinaleTrack, asm: FinaleAssembly): void {
  if (track === "acceptance") runFinalePhase2Acceptance(asm);
  else if (track === "absorption") runFinalePhase2Absorption();
  else runFinalePhase2Neutral(asm);
}

function beginRootFinale(): void {
  state.mode = "finale";
  const track = getFinaleTrack(state);
  const asm = getFinaleAssembly(state);
  const p1: DialogLine[] = [...ROOT_LOCATION_INTRO[track]];
  if (asm.vera === "good") p1.push(...ROOT_ASSEMBLY_VERA_GOOD);
  else if (asm.vera === "bad") p1.push(...ROOT_ASSEMBLY_VERA_BAD);
  const linChoice = state.flags.linFinaleChoice;
  if (asm.lin && linChoice && linChoice !== "gone") {
    p1.push(...ROOT_ASSEMBLY_LIN[linChoice]);
  }
  if (asm.ira) p1.push(...ROOT_ASSEMBLY_IRA);
  p1.push(...ROOT_ASSEMBLY_HERMIT);
  if (asm.figure) p1.push(...ROOT_ASSEMBLY_FIGURE);
  dialog.mount(p1, () => runFinalePhase2(track, asm));
}

function finishRootBossBattle(won: boolean): void {
  state.mode = "finale";
  const asm = getFinaleAssembly(state);
  if (won) {
    runPhase3AbsorptionFromRoot(asm, () => hermitFourthThenCredits());
  } else {
    dialog.mount(
      [{ speaker: ROOT_SPEAKER, text: "Тишина. Ты отступаешь — пока." }],
      () => runPhase3NeutralFromRoot(asm, () => hermitFourthThenCredits()),
    );
  }
}

const battleUI = createBattleUI(rootEl, {
  getBattle: () => combatState,
  setBattle: (b) => {
    combatState = b;
  },
  getBattleOptions: () => ({
    enemyId: state.pendingBattleEnemyId ?? "hum_unnamed",
    deckIds: buildBattleDeckIds(state),
    samplingContext: buildBattleSamplingContext(state),
    allyEnemyId: state.pendingBattleAllyId ?? undefined,
    enemyPowerScale: state.pendingBattlePowerScale > 1 ? state.pendingBattlePowerScale : undefined,
    buffAllyMinion: state.pendingBattleBuffAlly ? true : undefined,
  }),
  getShift: () => ({ acceptance: state.acceptance, absorption: state.absorption }),
  getTutorialStep: () =>
    state.pendingBattleEnemyId === "hum_unnamed" ? state.flags.firstGulBattleTutorialStep : 3,
  markTutorialStepDone: () => {
    if (state.pendingBattleEnemyId !== "hum_unnamed") return;
    state.flags.firstGulBattleTutorialStep = Math.min(3, state.flags.firstGulBattleTutorialStep + 1);
  },
  onEvent: (event) => {
    playCombatAudioEvent(event);
  },
  onClose: (won, lastBattle) => {
    if (state.pendingBattleEnemyId === "hum_unnamed") {
      state.flags.firstGulBattleTutorialStep = 3;
    }
    const eid = state.pendingBattleEnemyId ?? "hum_unnamed";
    const rootBoss = eid === "root_of_anxiety";

    const summary: BattleEndSummary = lastBattle
      ? summarizeBattleEnd(lastBattle)
      : {
          endKind: "abandoned",
          integrationWin: false,
          enemyId: eid,
          hadAnyCardPlayed: false,
          postAbsorption3: false,
          postAcceptance3: false,
          postDiscard3: false,
        };

    applyBattleEndToEncounters(state, summary);
    if (summary.endKind === "lost") {
      const currentDeck = buildBattleDeckIds(state);
      const available = currentDeck.filter((id) => !state.removedDeckCardIds.includes(id));
      if (available.length > 1) {
        const lostCard = available[Math.floor(Math.random() * available.length)];
        state.removedDeckCardIds.push(lostCard);
      }
      const spawn = ZONE_LAYOUT.last_camp.spawnIn;
      state.currentZoneId = "last_camp";
      state.playerTileX = spawn.x;
      state.playerTileY = spawn.y;
      if (!state.visitedZoneIds.includes("last_camp")) {
        state.visitedZoneIds.push("last_camp");
      }
    }

    if (summary.endKind === "won" && summary.enemyId) {
      const wid = summary.enemyId;
      if (!state.defeatedEnemyIds.includes(wid)) {
        state.defeatedEnemyIds.push(wid);
      }
      if (summary.integrationWin && !state.integratedEnemyIds.includes(wid)) {
        state.integratedEnemyIds.push(wid);
      }
      if (wid === "hum_unnamed") {
        state.flags.defeatedGulTrainer = true;
        state.flags.understoodHum = true;
      }
      if (summary.integrationWin) {
        state.encounter.buffAllyMinionNextBattle = true;
      }
      const deckTrip = tryEncounterThreeSameDeckCategory(state);
      if (deckTrip && !state.encounter.queuedEncounter) {
        state.encounter.queuedEncounter = deckTrip;
      }
    }

    if (lastBattle?.playedEdgeCard) {
      state.edgeCardUsed = true;
    }
    combatState = null;
    state.pendingBattleEnemyId = null;
    state.pendingBattleAllyId = null;
    state.pendingBattlePowerScale = 1;
    state.pendingBattleBuffAlly = false;

    if (rootBoss) {
      finishRootBossBattle(won);
      return;
    }
    resumeExplore();
  },
});

function startEncounterFromPending(p: PendingEncounter): void {
  const buffNext = state.encounter.buffAllyMinionNextBattle && !!p.allyEnemyId;
  state.encounter.buffAllyMinionNextBattle = false;
  state.pendingBattleAllyId = p.allyEnemyId ?? null;
  state.pendingBattlePowerScale = p.enemyPowerLevel ?? 1;
  state.pendingBattleBuffAlly = buffNext;
  state.mode = "dialog";
  runEncounterPrelude(rootEl, () => {
    dialog.mount(p.lines, () => {
      state.mode = "battle";
      state.pendingBattleEnemyId = p.enemyId;
      battleUI.mount();
    });
  });
}

function showEndScreen() {
  const wrap = document.createElement("div");
  wrap.className = "end-screen";
  wrap.innerHTML = `
    <h2>Тихая тропа</h2>
    <p>Маленькая история подошла к концу. Лес остаётся здесь — как и обещание вернуться к простым вещам: свету, чаю и шагу по дороге.</p>
    <button type="button" class="card-close">Идти дальше</button>
  `;
  wrap.querySelector("button")?.addEventListener("click", () => {
    wrap.remove();
    resumeExplore();
  });
  rootEl.appendChild(wrap);
}

function openHermitFirstMeeting() {
  state.mode = "dialog";
  dialog.mount(HERMIT_FIRST_INTRO, () => {
    state.mode = "card";
    cards.mountInteractive((won) => {
      if (won) state.flags.soothed = true;
      state.mode = "choice";
      storyChoice.mount(
        HERMIT_DEFEAT_OR_UNDERSTAND_PROMPT,
        HERMIT_DEFEAT_OR_UNDERSTAND_OPTIONS,
        (opt) => {
          state.acceptance += opt.acceptanceDelta;
          state.absorption += opt.absorptionDelta;
          let lean: HermitPathLean = "neutral";
          if (opt.id === "hermit_understand") lean = "understand";
          else if (opt.id === "hermit_defeat") lean = "defeat";
          state.flags.hermitPathLean = lean;
          const react = HERMIT_REACTION_THEN_OUTRO[opt.nextSceneId] ?? [];
          state.mode = "dialog";
          dialog.mount([...react, ...HERMIT_FIRST_OUTRO], () => {
            state.flags.metHermitClearing = true;
            state.flags.hermitAnswersCount = Math.min(4, state.flags.hermitAnswersCount + 1);
            resumeExplore();
          });
        },
      );
    });
  });
}

function openHermitDialog() {
  if (!state.flags.metHermitClearing) {
    openHermitFirstMeeting();
    return;
  }

  const { lines, openCardAfter, openEndAfter } = getHermitDialog(state.flags);
  if (lines.length === 0) {
    return;
  }
  state.pendingAfterDialog = {
    openCard: openCardAfter,
    openEnd: openEndAfter,
  };
  state.mode = "dialog";
  dialog.mount(lines, () => {
    state.flags.hermitAnswersCount = Math.min(4, state.flags.hermitAnswersCount + 1);
    const pending = state.pendingAfterDialog;
    state.pendingAfterDialog = null;

    if (pending?.openCard) {
      state.mode = "card";
      cards.mountInteractive((won) => {
        if (won) state.flags.soothed = true;
        resumeExplore();
      });
      return;
    }

    if (pending?.openEnd) {
      state.flags.sawEnding = true;
      state.mode = "end";
      showEndScreen();
      return;
    }

    resumeExplore();
  });
}

function openVeraDialog() {
  const bridgeSeen = state.visitedZoneIds.includes("bridge");

  if (state.flags.veraQuestActive && !state.flags.veraBridgeReported && bridgeSeen) {
    state.mode = "dialog";
    dialog.mount(VERA_AFTER_BRIDGE, () => {
      state.mode = "choice";
      storyChoice.mount(VERA_BRIDGE_PROMPT, VERA_BRIDGE_OPTIONS, (opt) => {
        state.acceptance += opt.acceptanceDelta;
        state.absorption += opt.absorptionDelta;
        if (opt.id === "bridge_honest") {
          state.flags.veraMapReady = true;
        }
        if (opt.id === "bridge_pretty_lie") {
          state.flags.veraBridgeWasPrettyLie = true;
        }
        state.flags.veraBridgeReported = true;
        const tail = VERA_BRIDGE_RESOLUTION[opt.nextSceneId] ?? [];
        state.mode = "dialog";
        dialog.mount(tail, () => {
          resumeExplore();
          maybeShiftEncounter();
        });
      });
    });
    return;
  }

  if (state.flags.veraQuestActive && state.flags.veraBridgeReported) {
    state.mode = "dialog";
    dialog.mount(VERA_THANKS_UPDATED_MAP, () => {
      resumeExplore();
    });
    return;
  }

  if (!state.flags.veraHasSpoken) {
    state.mode = "dialog";
    dialog.mount(
      VERA_FIRST_INTRO,
      () => {
        state.mode = "choice";
        storyChoice.mount(VERA_QUEST_PROMPT, VERA_QUEST_OPTIONS, (opt) => {
          state.flags.veraHasSpoken = true;
          if (opt.id === "vera_accept") {
            state.flags.veraQuestActive = true;
          }
          const tail = VERA_QUEST_RESOLUTION[opt.nextSceneId] ?? [];
          state.mode = "dialog";
          dialog.mount(tail, () => {
            resumeExplore();
          });
        });
      },
      {
        silence: () => {
          startEncounterFromPending({ enemyId: "hum_unnamed", lines: LINES_SILENCE_GUL });
        },
        interrupt: () => {
          startEncounterFromPending({ enemyId: "voice_must", lines: LINES_INTERRUPT_VOICE });
        },
      },
    );
    return;
  }

  if (!state.flags.veraQuestActive) {
    state.mode = "dialog";
    dialog.mount(VERA_SHORT_RETURN, () => {
      state.mode = "choice";
      storyChoice.mount(VERA_QUEST_PROMPT, VERA_QUEST_OPTIONS, (opt) => {
        if (opt.id === "vera_accept") {
          state.flags.veraQuestActive = true;
        }
        const tail = VERA_QUEST_RESOLUTION[opt.nextSceneId] ?? [];
        state.mode = "dialog";
        dialog.mount(tail, () => {
          resumeExplore();
        });
      });
    });
    return;
  }

  state.mode = "dialog";
  dialog.mount(VERA_SHORT_RETURN, () => {
    resumeExplore();
  });
}

function openLinDialog() {
  if (!state.flags.linFirstMeetingDone) {
    state.mode = "dialog";
    dialog.mount(LIN_FIRST_INTRO, () => {
      state.mode = "choice";
      storyChoice.mount(LIN_CHOICE_PROMPT, LIN_CHOICE_OPTIONS, (opt) => {
        state.acceptance += opt.acceptanceDelta;
        state.absorption += opt.absorptionDelta;
        const react = LIN_REACTION[opt.nextSceneId] ?? [];
        state.flags.linFirstMeetingDone = true;
        state.mode = "dialog";
        dialog.mount([...react, ...LIN_OUTRO], () => {
          resumeExplore();
        });
      });
    });
    return;
  }

  state.mode = "dialog";
  dialog.mount(LIN_REPEAT, () => {
    resumeExplore();
  });
}

function openIraFirstOrReoffer() {
  state.mode = "dialog";
  dialog.mount(IRA_FIRST_INTRO, () => {
    state.mode = "choice";
    storyChoice.mount(IRA_QUEST_PROMPT, IRA_QUEST_OPTIONS, (opt) => {
      state.flags.iraHasSpoken = true;
      if (opt.id === "ira_accept") {
        state.flags.iraQuestActive = true;
        state.flags.iraDeclinedOnce = false;
      }
      if (opt.id === "ira_later") {
        state.flags.iraDeclinedOnce = true;
        if (!state.encounter.refuseHelpBattleDone) {
          state.encounter.refuseHelpBattleDone = true;
          const tail = IRA_QUEST_RESOLUTION[opt.nextSceneId] ?? [];
          state.mode = "dialog";
          dialog.mount(tail, () => {
            startEncounterFromPending({ enemyId: "voice_must", lines: LINES_REFUSE_HELP_VOICE });
          });
          return;
        }
      }
      const tail = IRA_QUEST_RESOLUTION[opt.nextSceneId] ?? [];
      state.mode = "dialog";
      dialog.mount(tail, () => {
        resumeExplore();
      });
    });
  });
}

function openIraDialog() {
  if (!state.flags.iraHasSpoken || (!state.flags.iraQuestActive && state.flags.iraDeclinedOnce)) {
    openIraFirstOrReoffer();
    return;
  }

  state.mode = "dialog";
  dialog.mount(IRA_SHORT_RETURN, () => {
    resumeExplore();
  });
}

function goToRootFromLastCamp() {
  const spawn = ZONE_LAYOUT.root.spawnIn;
  state.currentZoneId = "root";
  state.playerTileX = spawn.x;
  state.playerTileY = spawn.y;
  handleZoneEnterAfterTransition("root");
}

function openLastCampFork() {
  state.mode = "choice";
  storyChoice.mount(LAST_CAMP_FORK_PROMPT, LAST_CAMP_FORK_OPTIONS, (opt) => {
    state.acceptance += opt.acceptanceDelta;
    state.absorption += opt.absorptionDelta;
    if (opt.id === "fork_left" || opt.id === "fork_right") {
      state.flags.lastCampForkDone = true;
      resumeExplore();
      goToRootFromLastCamp();
      return;
    }
    if (opt.id === "fork_back") {
      resumeExplore();
      return;
    }
    if (opt.id === "fork_stand") {
      state.mode = "dialog";
      dialog.mount([{ speaker: "Тропа", text: "Тишина. Ветка не шевелится." }], () => {
        resumeExplore();
      });
    }
  });
}

function tryOpenLastCampForkGate(): boolean {
  if (state.mode !== "explore") return false;
  if (state.currentZoneId !== "last_camp" || state.flags.lastCampForkDone) return false;
  if (!onZoneExitTile(state)) return false;
  if (!consumePress("KeyE") && !consumePress("Space")) return false;
  openLastCampFork();
  return true;
}

function mapLinDuskChoiceToFinale(id: string): LinFinaleChoice {
  if (id === "lin_new") return "new";
  if (id === "lin_flowers") return "flowers";
  if (id === "lin_push") return "gone";
  return "neutral";
}

function openStoryNpc(kind: StoryNpcKind) {
  switch (kind) {
    case "hermit_ravine": {
      state.mode = "dialog";
      dialog.mount(HERMIT_RAVINE_INTRO, () => {
        state.mode = "choice";
        storyChoice.mount(HERMIT_RAVINE_QUESTION, HERMIT_RAVINE_OPTIONS, (opt) => {
          state.acceptance += opt.acceptanceDelta;
          state.absorption += opt.absorptionDelta;
          const react = HERMIT_RAVINE_REACTION[opt.nextSceneId] ?? [];
          state.mode = "dialog";
          dialog.mount([...react, ...HERMIT_RAVINE_OUTRO], () => {
            state.flags.hermitSecondMeetingDone = true;
            resumeExplore();
          });
        });
      });
      break;
    }
    case "lin_dusk_second": {
      state.mode = "dialog";
      dialog.mount(LIN_DUSK_INTRO, () => {
        state.mode = "choice";
        storyChoice.mount(LIN_DUSK_PROMPT, LIN_DUSK_OPTIONS, (opt) => {
          state.acceptance += opt.acceptanceDelta;
          state.absorption += opt.absorptionDelta;
          state.flags.linFinaleChoice = mapLinDuskChoiceToFinale(opt.id);
          const mid = LIN_DUSK_RESOLUTION[opt.nextSceneId] ?? [];
          state.mode = "dialog";
          dialog.mount([...mid, ...LIN_DUSK_OUTRO], () => {
            state.flags.linSecondMeetingDone = true;
            resumeExplore();
          });
        });
      });
      break;
    }
    case "vera_cross_second": {
      state.mode = "dialog";
      dialog.mount(VERA_CROSS_INTRO, () => {
        state.mode = "choice";
        storyChoice.mount(VERA_CROSS_PROMPT, VERA_CROSS_OPTIONS, (opt) => {
          state.acceptance += opt.acceptanceDelta;
          state.absorption += opt.absorptionDelta;
          const react = VERA_CROSS_REACTION[opt.nextSceneId] ?? [];
          state.mode = "dialog";
          dialog.mount([...react, ...VERA_CROSS_OUTRO], () => {
            state.flags.veraSecondMeetingDone = true;
            resumeExplore();
          });
        });
      });
      break;
    }
    case "ira_cross_second": {
      state.mode = "dialog";
      dialog.mount(IRA_CROSS_INTRO, () => {
        state.mode = "choice";
        storyChoice.mount(IRA_CROSS_PROMPT, IRA_CROSS_OPTIONS, (opt) => {
          state.acceptance += opt.acceptanceDelta;
          state.absorption += opt.absorptionDelta;
          state.mode = "dialog";
          dialog.mount(IRA_CROSS_OUTRO, () => {
            state.flags.iraCrossroadsDone = true;
            resumeExplore();
          });
        });
      });
      break;
    }
    case "vera_camp_final": {
      state.mode = "dialog";
      dialog.mount(VERA_CAMP_INTRO, () => {
        state.mode = "choice";
        storyChoice.mount(VERA_CAMP_PROMPT, VERA_CAMP_OPTIONS, (pathOpt) => {
          state.acceptance += pathOpt.acceptanceDelta;
          state.absorption += pathOpt.absorptionDelta;
          state.mode = "choice";
          storyChoice.mount(VERA_CAMP_HONESTY_PROMPT, VERA_CAMP_HONESTY_OPTIONS, (honOpt) => {
            state.acceptance += honOpt.acceptanceDelta;
            state.absorption += honOpt.absorptionDelta;
            const honest = honOpt.id === "camp_truth";
            state.flags.veraCampHonest = honest;
            const tail = honest ? VERA_CAMP_RESOLUTION_HONEST : VERA_CAMP_RESOLUTION_LIE;
            if (honest) {
              state.flags.veraMapReady = true;
            }
            state.mode = "dialog";
            dialog.mount(tail, () => {
              state.flags.veraLastCampDone = true;
              if (!honest && !state.encounter.hurtfulTruthTriggered) {
                state.encounter.hurtfulTruthTriggered = true;
                startEncounterFromPending({
                  enemyId: "expectation_judgment",
                  lines: LINES_HURTFUL_TRUTH,
                });
                return;
              }
              resumeExplore();
            });
          });
        });
      });
      break;
    }
    case "lin_camp_final": {
      const c = state.flags.linFinaleChoice;
      let lines =
        c === "new"
          ? LIN_CAMP_NEW
          : c === "flowers"
            ? LIN_CAMP_FLOWERS
            : c === "gone"
              ? LIN_CAMP_GONE
              : LIN_CAMP_NEUTRAL;
      state.mode = "dialog";
      dialog.mount(lines, () => {
        state.flags.linLastCampDone = true;
        resumeExplore();
      });
      break;
    }
    case "ira_camp_final": {
      const full = state.integratedEnemyIds.length >= 2;
      state.mode = "dialog";
      dialog.mount(full ? IRA_CAMP_FULL : IRA_CAMP_HALF, () => {
        state.flags.iraLastCampDone = true;
        resumeExplore();
      });
      break;
    }
    case "hermit_camp_third": {
      state.mode = "dialog";
      dialog.mount(HERMIT_CAMP_INTRO, () => {
        state.mode = "choice";
        storyChoice.mount(HERMIT_CAMP_QUESTION, HERMIT_CAMP_OPTIONS, (opt) => {
          state.acceptance += opt.acceptanceDelta;
          state.absorption += opt.absorptionDelta;
          const react = HERMIT_CAMP_REACTION[opt.nextSceneId] ?? [];
          state.mode = "dialog";
          dialog.mount([...react, ...HERMIT_CAMP_OUTRO], () => {
            state.flags.hermitThirdMeetingDone = true;
            resumeExplore();
          });
        });
      });
      break;
    }
    case "figure_camp": {
      state.mode = "dialog";
      dialog.mount(FIGURE_INTRO, () => {
        state.mode = "choice";
        storyChoice.mount(FIGURE_PROMPT, FIGURE_OPTIONS, (opt) => {
          state.acceptance += opt.acceptanceDelta;
          state.absorption += opt.absorptionDelta;
          const tail = FIGURE_RESOLUTION[opt.nextSceneId] ?? [];
          state.mode = "dialog";
          dialog.mount(tail, () => {
            state.flags.metFigure = true;
            resumeExplore();
          });
        });
      });
      break;
    }
    default:
      break;
  }
}

function handleZoneEnterAfterTransition(zone: WorldZoneId) {
  const first = !state.visitedZoneIds.includes(zone);
  if (first) {
    state.visitedZoneIds.push(zone);
  }
  const lines = first ? ZONE_FIRST_ENTER_LINES[zone] : undefined;

  const finishExplore = () => {
    if (zone === "root" && !state.flags.finaleComplete) {
      beginRootFinale();
      return;
    }
    const lieEnc = tryConsumeShadowLieEncounter(state, zone);
    if (lieEnc) {
      startEncounterFromPending(lieEnc);
      return;
    }
    const zEnc = encounterOnZoneEntered(state, zone, first);
    if (zEnc) {
      startEncounterFromPending(zEnc);
      return;
    }
    resumeExplore();
  };

  if (lines && lines.length) {
    state.mode = "dialog";
    dialog.mount(lines, finishExplore);
    return;
  }

  finishExplore();
}

function openRestAtCamp() {
  state.mode = "choice";
  storyChoice.mount("Сделать привал?", REST_CHOICE_OPTIONS, (opt) => {
    if (opt.id === "rest_yes") {
      signalEncounterRestPause(state);
      if (!state.encounter.restVoiceBattleDone && !state.defeatedEnemyIds.includes("voice_must")) {
        state.encounter.restVoiceBattleDone = true;
        startEncounterFromPending({ enemyId: "voice_must", lines: LINES_REST_VOICE });
      } else {
        resumeExplore();
      }
    } else {
      state.encounter.restDeclines += 1;
      if (state.encounter.restDeclines >= 3) {
        state.encounter.pendingRestInsomnia = true;
      }
      resumeExplore();
    }
  });
}

function updateExploreInteractions() {
  if (state.mode !== "explore") return;

  if (tryOpenLastCampForkGate()) {
    return;
  }

  if (tryStartRest(state)) {
    openRestAtCamp();
    return;
  }

  if (consumePress("KeyI")) {
    openDeckViewUi();
    return;
  }

  if (tryConsumeZoneTransition(state)) {
    resetEncounterStandTile(state);
    handleZoneEnterAfterTransition(state.currentZoneId);
    return;
  }

  if (tryStartHermitDialog(state)) {
    openHermitDialog();
    return;
  }
  if (tryStartVeraDialog(state)) {
    openVeraDialog();
    return;
  }
  if (tryStartLinDialog(state)) {
    openLinDialog();
    return;
  }
  if (tryStartIraDialog(state)) {
    openIraDialog();
    return;
  }

  const storyKind = tryConsumeStoryNpcInteraction(state);
  if (storyKind) {
    openStoryNpc(storyKind);
  }
}

function startPrologueFlow() {
  intro.mount(INTRO_SCREENS, () => {
    state.mode = "choice";
    storyChoice.mount(CHOICE_FORK_CLEARING.prompt, CHOICE_FORK_CLEARING.options, (opt) => {
      state.acceptance += opt.acceptanceDelta;
      state.absorption += opt.absorptionDelta;
      state.storySceneId = opt.nextSceneId;
      state.activeChoiceId = null;
      const lines = AFTER_FORK_LINES[opt.nextSceneId];
      state.mode = "dialog";
      dialog.mount(lines, () => {
        resumeExplore();
        if (!state.visitedZoneIds.includes("clearing")) {
          state.visitedZoneIds.push("clearing");
        }
      });
    });
  });
}

let last = performance.now();
let prevGameMode: GameMode | null = null;

function frame(now: number) {
  const dt = Math.min(50, now - last);
  last = now;

  if (state.mode !== prevGameMode) {
    syncThemeFromGameMode(state.mode);
    prevGameMode = state.mode;
  }

  if (state.mode === "explore") {
    tickExploreEncounterIdle(state, dt);
    updateOverworld(state, dt);
    const enc = evaluateExploreEncounters(state);
    if (enc) {
      startEncounterFromPending(enc);
    }
    updateExploreInteractions();
  } else if (state.mode === "deck_view") {
    deckViewAccumMs += dt;
    if (deckViewAccumMs >= 20_000 && !state.encounter.compareInventoryDone) {
      state.encounter.compareInventoryDone = true;
      closeDeckViewUi();
      startEncounterFromPending({ enemyId: "compare_others", lines: LINES_INVENTORY_COMPARE });
    }
    if (consumePress("KeyI") || consumePress("Escape")) {
      closeDeckViewUi();
      resumeExplore();
    }
  }

  renderOverworld(worldCtx, state);
  requestAnimationFrame(frame);
}

syncThemeFromGameMode(state.mode);
prevGameMode = state.mode;
startPrologueFlow();
requestAnimationFrame(frame);
