import { getBattleCardDef, getBattleCardFrame } from "../combat/battleCardDefs";
import { canPlayCard, createBattle, endPlayerTurn, minionAttack, playCard } from "../combat/engine";
import type { CreateBattleOptions } from "../combat/engine";
import type { BattleState, TargetRef } from "../combat/types";

export interface BattleUIApi {
  mount: () => void;
  unmount: () => void;
}

type Pending =
  | { type: "card"; handIndex: number }
  | { type: "minion"; uid: string };

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
    /** Если не задано — бой с гулом и базовой колодой */
    getBattleOptions?: () => CreateBattleOptions | undefined;
    getShift?: () => { acceptance: number; absorption: number };
    getTutorialStep?: () => number;
    markTutorialStepDone?: () => void;
    onEvent?: (event: "battle_open" | "card_play" | "turn_end" | "battle_close") => void;
  },
): BattleUIApi {
  let wrap: HTMLDivElement | null = null;
  let pending: Pending | null = null;
  let onKeyEsc: ((e: KeyboardEvent) => void) | null = null;

  function unmount() {
    if (onKeyEsc) {
      window.removeEventListener("keydown", onKeyEsc);
      onKeyEsc = null;
    }
    wrap?.remove();
    wrap = null;
    pending = null;
  }

  function render() {
    const state = opts.getBattle();
    if (!wrap || !state) return;

    const targeting = pending?.type === "card";
    const minionPick = pending?.type === "minion";
    const shift = opts.getShift?.() ?? { acceptance: 0, absorption: 0 };
    const calmSegments = 10;
    const calmFilled = Math.max(
      0,
      Math.min(
        calmSegments,
        Math.round((state.player.calm / Math.max(1, state.player.maxCalm)) * calmSegments),
      ),
    );
    const lowHp = state.player.calm / Math.max(1, state.player.maxCalm) <= 0.3;
    const tutorialStep = opts.getTutorialStep?.() ?? 99;
    const integrationWin = state.phase === "won" && state.enemy.resistance > 0;
    const enemyLow = state.enemy.resistance / Math.max(1, state.enemy.maxResistance) <= 0.3;
    const debuffs = Object.entries(state.debuffs)
      .filter(([, turns]) => turns > 0)
      .map(([id, turns]) => `${id}:${turns}`)
      .join(" · ");
    const deckPreview = state.drawPile
      .slice(-5)
      .map((id) => getBattleCardDef(id)?.name ?? id)
      .join(" · ");

    wrap.innerHTML = `
      <div class="battle-layout battle-layout--retro ${lowHp ? "battle-layout--lowhp" : ""}">
        <header class="battle-header">
          <div class="battle-head-block">
            <span class="battle-title">Спокойствие</span>
            <span class="battle-calm-bar">${Array.from({ length: calmSegments })
              .map((_, i) => `<i class="${i < calmFilled ? "on" : ""}"></i>`)
              .join("")}</span>
            <span class="battle-calm-num">${calmFilled}/10</span>
          </div>
          <div class="battle-head-block">Ход: ${state.turnNumber}</div>
          <div class="battle-head-block">Сдвиг: ${shift.acceptance >= shift.absorption ? "◉◉○" : "○◉◉"}</div>
        </header>
        <div class="battle-intent">Намерение (${state.enemy.intentTier}): ${state.enemy.intentDamage} урона</div>
        <div class="battle-enemy-hero ${targeting || minionPick ? "targetable" : ""}" data-target="enemyHero">
          <div class="enemy-silhouette ${enemyLow ? "enemy-silhouette--cracked" : ""}" aria-hidden="true">▓▒░▓▒░</div>
          <div class="hero-name">${escapeHtml(state.enemy.name)}</div>
          <div class="hero-level">Уровень: ${state.enemy.level}</div>
          <div class="hero-stats">${state.enemy.resistance}/${state.enemy.maxResistance} устойчивости
            ${state.enemy.block ? ` · ${state.enemy.block} блок` : ""}
            ${state.enemy.poison ? ` · ☠${state.enemy.poison}` : ""}</div>
        </div>
        <div class="battle-minions battle-enemy-minions">
          ${state.enemyMinions
            .map(
              (m) => `
            <div class="minion ${targeting || minionPick ? "targetable" : ""}" data-target="enemyMinion" data-uid="${escapeHtml(m.uid)}">
              <span class="minion-name">${escapeHtml(m.name)}</span>
              <span class="minion-atk-hp">${m.atk}/${m.hp}</span>
              ${m.taunt ? '<span class="badge">Провокация</span>' : ""}
              ${m.poison ? `<span class="badge poison">☠${m.poison}</span>` : ""}
            </div>`,
            )
            .join("")}
        </div>
        <div class="battle-log">${state.log.map((l) => `<div>${escapeHtml(l)}</div>`).join("")}</div>
        <div class="battle-minions battle-player-minions">
          ${state.playerMinions
            .map(
              (m) => `
            <div class="minion player-minion ${m.canAttack ? "can-attack" : ""} ${minionPick && m.canAttack ? "pick-minion" : ""}" data-minion="${escapeHtml(m.uid)}">
              <span class="minion-name">${escapeHtml(m.name)}</span>
              <span class="minion-atk-hp">${m.atk}/${m.hp}</span>
              ${m.poison ? `<span class="badge poison">☠${m.poison}</span>` : ""}
            </div>`,
            )
            .join("")}
        </div>
        <div class="battle-player-bar">
          <div class="hero-stats">${state.player.calm}/${state.player.maxCalm} спокойствия
            · ${state.player.block} блок
            ${state.player.poison ? ` · ☠${state.player.poison}` : ""}</div>
          ${debuffs ? `<div class="hero-level">Эффекты: ${escapeHtml(debuffs)}</div>` : ""}
          ${
            state.poisonOnNextAttack > 0
              ? `<div class="blade-poison">На клинке яда: ${state.poisonOnNextAttack}</div>`
              : ""
          }
        </div>
        <div class="battle-hand">
          ${state.hand
            .map((h, i) => {
              const d = getBattleCardDef(h.defId);
              if (!d) return "";
              const playable = canPlayCard(state, i);
              const frame = getBattleCardFrame(d);
              return `<button type="button" class="battle-card retro-card ${playable ? "" : "disabled"}" data-hand="${i}" ${playable ? "" : "disabled"}>
                <div class="retro-card-name">${escapeHtml(d.name)}</div>
                <div class="retro-card-icon">${d.icon}</div>
                <div class="retro-card-desc">${escapeHtml(d.desc)}</div>
                <div class="retro-card-stats">ATK ${frame.atk} · DEF ${frame.def} · C ${d.cost}</div>
              </button>`;
            })
            .join("")}
        </div>
        <footer class="battle-footer">
          ${
            pending
              ? `<span class="pending-hint">${
                  pending.type === "card"
                    ? "Выбери цель на стороне врага."
                    : "Выбери цель для атаки миньона."
                }</span>`
              : `<span class="pending-hint">Колода: ${state.drawPile.length} · Сброс: ${state.discardPile.length}</span>`
          }
          <span class="deck-preview" title="${escapeHtml(deckPreview || "Колода пуста")}">Превью колоды</span>
          <button type="button" class="battle-endturn pixel-button pixel-button--accent" ${state.phase === "player" ? "" : "disabled"}>Конец хода</button>
        </footer>
      </div>
      ${
        state.phase === "won" || state.phase === "lost"
          ? `<div class="battle-modal">
          <p>${
            state.phase === "won"
              ? integrationWin
                ? "Ты понял(а). Враг стал тише."
                : "Ты подавил(а). Но это вернётся."
              : "Спокойствие упало до нуля. Что-то потеряно."
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
                  ? "Сыграй любую карту."
                  : tutorialStep === 1
                    ? "Теперь заверши ход кнопкой справа."
                    : "Враг атакует в свой ход. Следи за полоской спокойствия."
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

    wrap.querySelectorAll("[data-hand]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const st = opts.getBattle();
        if (!st || st.phase !== "player") return;
        const i = Number((btn as HTMLElement).dataset.hand);
        if (Number.isNaN(i)) return;
        const def = getBattleCardDef(st.hand[i]?.defId ?? "");
        if (!def || !canPlayCard(st, i)) return;

        if (def.needsEnemyTarget) {
          pending = { type: "card", handIndex: i };
          render();
          return;
        }

        const err = playCard(st, i);
        if (err) errToast(err);
        else {
          opts.onEvent?.("card_play");
          opts.markTutorialStepDone?.();
        }
        pending = null;
        render();
      });
    });

    wrap.querySelectorAll("[data-target]").forEach((el) => {
      el.addEventListener("click", () => {
        const st = opts.getBattle();
        if (!st || st.phase !== "player") return;
        const kind = (el as HTMLElement).dataset.target as TargetRef["kind"];
        const uid = (el as HTMLElement).dataset.uid;
        const ref: TargetRef =
          kind === "enemyHero"
            ? { kind: "enemyHero" }
            : { kind: "enemyMinion", uid: uid! };

        if (pending?.type === "card") {
          const err = playCard(st, pending.handIndex, ref);
          if (err) errToast(err);
          pending = null;
          render();
          return;
        }

        if (pending?.type === "minion") {
          const err = minionAttack(st, pending.uid, ref);
          if (err) errToast(err);
          pending = null;
          render();
        }
      });
    });

    wrap.querySelectorAll("[data-minion]").forEach((el) => {
      el.addEventListener("click", () => {
        const st = opts.getBattle();
        if (!st || st.phase !== "player") return;
        const uid = (el as HTMLElement).dataset.minion;
        if (!uid) return;
        const m = st.playerMinions.find((x) => x.uid === uid);
        if (!m?.canAttack) return;
        pending = { type: "minion", uid };
        render();
      });
    });

    wrap.querySelector(".battle-endturn")?.addEventListener("click", () => {
      const st = opts.getBattle();
      if (!st) return;
      pending = null;
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
    const o = opts.getBattleOptions?.();
    opts.setBattle(createBattle(o ?? {}));
    pending = null;
    wrap = document.createElement("div");
    wrap.className = "battle-overlay";
    root.appendChild(wrap);
    opts.onEvent?.("battle_open");
    onKeyEsc = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        pending = null;
        render();
      }
    };
    window.addEventListener("keydown", onKeyEsc);
    render();
  }

  return { mount, unmount };
}
