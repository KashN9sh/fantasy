import { getBattleCardDef, getBattleCardFrame } from "../combat/battleCardDefs";
import { canPlayCard, createBattle, endPlayerTurn, minionAttack, playCard } from "../combat/engine";
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
    onClose: (won: boolean) => void;
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

    wrap.innerHTML = `
      <div class="battle-layout">
        <header class="battle-header">
          <span class="battle-title">Карточный бой</span>
          <span class="battle-intent">Намерение: ${state.enemy.intentDamage} урона по тебе или миньону</span>
        </header>
        <div class="battle-enemy-hero ${targeting || minionPick ? "targetable" : ""}" data-target="enemyHero">
          <div class="hero-name">${escapeHtml(state.enemy.name)}</div>
          <div class="hero-stats">${state.enemy.hp}/${state.enemy.maxHp} ОЗ
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
          <div class="hero-stats">${state.player.hp}/${state.player.maxHp} ОЗ
            · ${state.player.block} блок
            · энергия ${state.player.energy}/${state.player.maxEnergy}
            ${state.player.poison ? ` · ☠${state.player.poison}` : ""}</div>
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
              const affordable = state.player.energy >= d.cost;
              const playable = state.phase === "player" && affordable;
              const frame = getBattleCardFrame(d);
              const starsStr = "★".repeat(frame.stars);
              const attrMark: Record<typeof frame.attr, { sym: string; label: string }> = {
                dark: { sym: "D", label: "Тьма" },
                fire: { sym: "F", label: "Огонь" },
                earth: { sym: "G", label: "Земля" },
                light: { sym: "L", label: "Свет" },
                water: { sym: "W", label: "Вода" },
              };
              const am = attrMark[frame.attr];
              return `<button type="button" class="battle-card ygo-card ${playable ? "" : "disabled"} ${`ygo-attr--${frame.attr}`}" data-hand="${i}" ${playable ? "" : "disabled"}>
                <span class="ygo-cost-badge" aria-label="стоимость">${d.cost}</span>
                <div class="ygo-card-inner">
                  <header class="ygo-header">
                    <span class="ygo-name">${escapeHtml(d.name.toUpperCase())}</span>
                    <span class="ygo-attr-icon" title="${escapeHtml(am.label)}" aria-label="${escapeHtml(am.label)}">${am.sym}</span>
                  </header>
                  <div class="ygo-stars" aria-hidden="true">${starsStr}</div>
                  <div class="ygo-art">${d.icon}</div>
                  <div class="ygo-textbox">
                    <p class="ygo-desc">${escapeHtml(d.desc)}</p>
                    <div class="ygo-stats">
                      <span class="ygo-stat-atk">ATK / ${frame.atk}</span>
                      <span class="ygo-stat-def">DEF / ${frame.def}</span>
                    </div>
                  </div>
                </div>
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
              : `<span class="pending-hint">Карта «Яд на клинок», потом «Удар» или атака миньона — переносит яд.</span>`
          }
          <button type="button" class="battle-endturn" ${state.phase === "player" ? "" : "disabled"}>Конец хода</button>
        </footer>
      </div>
      ${
        state.phase === "won" || state.phase === "lost"
          ? `<div class="battle-modal">
          <p>${state.phase === "won" ? "Победа!" : "Поражение."}</p>
          <button type="button" class="card-close battle-exit">Закрыть</button>
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
      render();
    });

    wrap.querySelector(".battle-exit")?.addEventListener("click", () => {
      const st = opts.getBattle();
      const won = st?.phase === "won";
      opts.setBattle(null);
      unmount();
      opts.onClose(won);
    });
  }

  function mount() {
    unmount();
    opts.setBattle(createBattle());
    pending = null;
    wrap = document.createElement("div");
    wrap.className = "battle-overlay";
    root.appendChild(wrap);
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
