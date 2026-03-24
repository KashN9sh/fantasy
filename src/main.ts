import "./style.css";
import type { BattleState } from "./combat/types";
import { syncThemeFromGameMode } from "./theme/syncGameTheme";
import { getHermitDialog } from "./data/story";
import { createInitialState, type GameMode, type GameState } from "./game/types";
import { initInput } from "./game/input";
import {
  renderOverworld,
  tryStartHermitDialog,
  tryStartTrainerBattle,
  updateOverworld,
} from "./game/Overworld";
import { createBattleUI } from "./ui/BattleUI";
import { createCardSceneController } from "./ui/CardScene";
import { createDialogController } from "./ui/Dialog";

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

const dialog = createDialogController(rootEl);
const cards = createCardSceneController(rootEl);
const battleUI = createBattleUI(rootEl, {
  getBattle: () => combatState,
  setBattle: (b) => {
    combatState = b;
  },
  onClose: () => {
    state.mode = "explore";
    combatState = null;
  },
});

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
    state.mode = "explore";
  });
  rootEl.appendChild(wrap);
}

function openHermitDialog() {
  const { lines, openCardAfter, openEndAfter } = getHermitDialog(state.flags);
  state.pendingAfterDialog = {
    openCard: openCardAfter,
    openEnd: openEndAfter,
  };
  state.mode = "dialog";
  dialog.mount(lines, () => {
    const pending = state.pendingAfterDialog;
    state.pendingAfterDialog = null;

    if (pending?.openCard) {
      state.mode = "card";
      cards.mountInteractive((won) => {
        if (won) state.flags.soothed = true;
        state.mode = "explore";
      });
      return;
    }

    if (pending?.openEnd) {
      state.flags.sawEnding = true;
      state.mode = "end";
      showEndScreen();
      return;
    }

    state.mode = "explore";
  });
}

function updateExploreInteractions() {
  if (state.mode !== "explore") return;
  if (tryStartTrainerBattle(state)) {
    state.mode = "battle";
    battleUI.mount();
    return;
  }
  if (tryStartHermitDialog(state)) {
    openHermitDialog();
  }
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
    updateOverworld(state, dt);
    updateExploreInteractions();
  }

  renderOverworld(worldCtx, state);
  requestAnimationFrame(frame);
}

syncThemeFromGameMode(state.mode);
prevGameMode = state.mode;
requestAnimationFrame(frame);
