import { canSelectStance, canUseResponse, createBattle, endPlayerTurn, selectStance, useResponse } from "../combat/engine";
import type { CreateBattleOptions } from "../combat/engine";
import { getBattleResponseDef } from "../combat/responseDefs";
import { getBattleStanceDef, listAvailableStanceIds, listResponsesForStance } from "../combat/stanceDefs";
import type { BattleState } from "../combat/types";

export interface BattleUIApi {
  mount: () => void;
  unmount: () => void;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function createBattleUI(
  root: HTMLElement,
  opts: {
    getBattle: () => BattleState | null;
    setBattle: (b: BattleState | null) => void;
    onClose: (won: boolean, lastBattle: BattleState | null) => void;
    getBattleOptions?: () => CreateBattleOptions | undefined;
    getShift?: () => { acceptance: number; absorption: number };
    getTutorialStep?: () => number;
    markTutorialStepDone?: () => void;
    onEvent?: (event: "battle_open" | "card_play" | "turn_end" | "battle_close") => void;
  },
): BattleUIApi {
  let wrap: HTMLDivElement | null = null;
  let onKeyEsc: ((e: KeyboardEvent) => void) | null = null;

  function unmount() {
    if (onKeyEsc) {
      window.removeEventListener("keydown", onKeyEsc);
      onKeyEsc = null;
    }
    wrap?.remove();
    wrap = null;
  }

  function render() {
    const state = opts.getBattle();
    if (!wrap || !state) return;

    const shift = opts.getShift?.() ?? { acceptance: 0, absorption: 0 };
    const calmSegments = 10;
    const calmFilled = Math.max(
      0,
      Math.min(calmSegments, Math.round((state.player.calm / Math.max(1, state.player.maxCalm)) * calmSegments)),
    );
    const tutorialStep = opts.getTutorialStep?.() ?? 99;
    const enemyLow = state.enemy.resistance / Math.max(1, state.enemy.maxResistance) <= 0.3;
    const lowHp = state.player.calm / Math.max(1, state.player.maxCalm) <= 0.3;
    const integrationWin = state.phase === "won" && state.enemy.resistance > 0;
    const debuffs = Object.entries(state.debuffs)
      .filter(([, turns]) => turns > 0)
      .map(([id, turns]) => `${id}:${turns}`)
      .join(" · ");
    const stanceIds = listAvailableStanceIds(state.availableResponseIds);
    const stances = stanceIds
      .map((id) => {
        const def = getBattleStanceDef(id);
        const selectable = canSelectStance(state, id);
        const active = state.currentStanceId === id;
        return `<button type="button" class="battle-stance ${active ? "battle-stance--active" : ""} ${selectable || active ? "" : "disabled"}" data-stance="${id}" ${selectable || active ? "" : "disabled"}>
          <span class="battle-stance-icon">${escapeHtml(def.icon)}</span>
          <span class="battle-stance-copy">
            <span class="battle-stance-name">${escapeHtml(def.name)}</span>
            <span class="battle-stance-title">${escapeHtml(def.title)}</span>
          </span>
        </button>`;
      })
      .join("");
    const currentStance = state.currentStanceId ? getBattleStanceDef(state.currentStanceId) : null;
    const stanceResponseIds = state.currentStanceId
      ? listResponsesForStance(state.availableResponseIds, state.currentStanceId)
      : [];
    const responses = stanceResponseIds
      .map((id) => {
        const def = getBattleResponseDef(id);
        const usable = canUseResponse(state, id);
        return `<button type="button" class="battle-response battle-response--${def.style} ${usable ? "" : "disabled"}" data-response="${id}" ${usable ? "" : "disabled"}>
          <div class="battle-response-icon">${escapeHtml(def.icon)}</div>
          <div class="battle-response-copy">
            <div class="battle-response-name">${escapeHtml(def.name)}</div>
            <div class="battle-response-title">${escapeHtml(def.title)}</div>
            <div class="battle-response-hint">${escapeHtml(def.effectHint)}</div>
          </div>
        </button>`;
      })
      .join("");

    wrap.innerHTML = `
      <div class="battle-layout battle-layout--ritual ${lowHp ? "battle-layout--lowhp" : ""}">
        <header class="battle-header">
          <div class="battle-head-block">
            <span class="battle-title">Спокойствие</span>
            <span class="battle-calm-bar">${Array.from({ length: calmSegments })
              .map((_, i) => `<i class="${i < calmFilled ? "on" : ""}"></i>`)
              .join("")}</span>
            <span class="battle-calm-num">${state.player.calm}/10</span>
          </div>
          <div class="battle-head-block">Ход: ${state.turnNumber}</div>
          <div class="battle-head-block">Сдвиг: ${shift.acceptance >= shift.absorption ? "◉◉○" : "○◉◉"}</div>
        </header>
        <div class="battle-intent">Намерение (${state.enemy.intentTier}): ${escapeHtml(state.enemy.intentText)}${state.enemy.intentDamage > 0 ? ` · ${state.enemy.intentDamage} урона` : ""}</div>
        <div class="battle-enemy-hero">
          <div class="enemy-silhouette ${enemyLow ? "enemy-silhouette--cracked" : ""}" aria-hidden="true">▓▒░▓▒░</div>
          <div class="hero-name">${escapeHtml(state.enemy.name)}</div>
          <div class="hero-level">Уровень: ${state.enemy.level}</div>
          <div class="hero-stats">${state.enemy.resistance}/${state.enemy.maxResistance} устойчивости${state.enemy.block ? ` · ${state.enemy.block} блок` : ""}</div>
        </div>
        ${
          state.enemyEchoes.length > 0
            ? `<div class="battle-echoes">${state.enemyEchoes
                .map(
                  (echo) =>
                    `<div class="battle-echo"><span>${escapeHtml(echo.name)}</span><span>${echo.intentDamage} урона</span></div>`,
                )
                .join("")}</div>`
            : ""
        }
        <div class="battle-player-bar">
          <div class="hero-stats">${state.player.calm}/${state.player.maxCalm} спокойствия · ${state.player.block} блок · Понимание ${state.understanding}</div>
          ${currentStance ? `<div class="hero-level">Текущая стойка: ${escapeHtml(currentStance.name)} · ${escapeHtml(currentStance.title)}</div>` : ""}
          ${debuffs ? `<div class="hero-level">Эффекты: ${escapeHtml(debuffs)}</div>` : ""}
        </div>
        <div class="battle-log">${state.log.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}</div>
        <div class="battle-stance-grid">${stances}</div>
        ${
          currentStance
            ? `<div class="battle-stance-panel">
                <div class="battle-stance-panel-title">${escapeHtml(currentStance.name)} · ${escapeHtml(currentStance.title)}</div>
                <div class="battle-stance-panel-desc">${escapeHtml(currentStance.desc)}</div>
              </div>`
            : ""
        }
        <div class="battle-response-grid">${responses}</div>
        <footer class="battle-footer">
          <span class="pending-hint">${
            state.turnUsedResponse
              ? "Ответ выбран. Можно завершить ход."
              : currentStance
                ? "Стойка выбрана. Теперь выбери приём внутри неё."
                : "Сначала выбери стойку, в которой встретишь это давление."
          }</span>
          <button type="button" class="battle-endturn pixel-button pixel-button--accent" ${state.phase === "player" ? "" : "disabled"}>Конец хода</button>
        </footer>
      </div>
      ${
        state.phase === "won" || state.phase === "lost" || state.phase === "abandoned"
          ? `<div class="battle-modal">
          <p>${
            state.phase === "won"
              ? integrationWin
                ? "Ты понял(а) это давление. Оно стало тише."
                : "Ты продавил(а) давление. Оно отступило."
              : state.phase === "lost"
                ? "Спокойствие упало до нуля. Что-то внутри сместилось."
                : "Ты отошёл(шла) и не дал(а) бою стать всем."
          }</p>
          <button type="button" class="card-close pixel-button pixel-button--accent battle-exit">Закрыть</button>
        </div>`
          : ""
      }
      ${
        tutorialStep < 3
          ? `<div class="battle-tutorial">
              ${
                tutorialStep === 0
                  ? "Выбери любую стойку снизу."
                  : tutorialStep === 1
                    ? "Теперь выбери приём внутри стойки."
                    : "После приёма заверши ход кнопкой справа."
              }
            </div>`
          : ""
      }
    `;

    const errToast = (msg: string) => {
      const t = document.createElement("div");
      t.className = "battle-toast";
      t.textContent = msg;
      wrap?.appendChild(t);
      setTimeout(() => t.remove(), 2200);
    };

    wrap.querySelectorAll("[data-stance]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const st = opts.getBattle();
        if (!st || st.phase !== "player") return;
        const stanceId = (btn as HTMLElement).dataset.stance as typeof st.currentStanceId;
        if (!stanceId) return;
        const err = selectStance(st, stanceId);
        if (err) errToast(err);
        else opts.markTutorialStepDone?.();
        render();
      });
    });

    wrap.querySelectorAll("[data-response]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const st = opts.getBattle();
        if (!st || st.phase !== "player") return;
        const responseId = (btn as HTMLElement).dataset.response as typeof st.availableResponseIds[number];
        const err = useResponse(st, responseId);
        if (err) errToast(err);
        else {
          opts.onEvent?.("card_play");
          opts.markTutorialStepDone?.();
        }
        render();
      });
    });

    wrap.querySelector(".battle-endturn")?.addEventListener("click", () => {
      const st = opts.getBattle();
      if (!st) return;
      const err = endPlayerTurn(st);
      if (err) errToast(err);
      else {
        opts.onEvent?.("turn_end");
        opts.markTutorialStepDone?.();
      }
      render();
    });

    wrap.querySelector(".battle-exit")?.addEventListener("click", () => {
      const st = opts.getBattle();
      const won = st?.phase === "won";
      opts.onEvent?.("battle_close");
      opts.onClose(won, st);
      opts.setBattle(null);
      unmount();
    });
  }

  function mount() {
    unmount();
    const battleOptions = opts.getBattleOptions?.();
    opts.setBattle(createBattle(battleOptions ?? {}));
    wrap = document.createElement("div");
    wrap.className = "battle-overlay";
    root.appendChild(wrap);
    opts.onEvent?.("battle_open");
    onKeyEsc = (e: KeyboardEvent) => {
      if (e.code === "Escape") render();
    };
    window.addEventListener("keydown", onKeyEsc);
    render();
  }

  return { mount, unmount };
}
