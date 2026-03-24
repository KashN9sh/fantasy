import { HAND_CARD_IDS, getCardsByIds } from "../data/cards";
import { resolveCardPick } from "../data/story";

export interface CardSceneController {
  mountInteractive: (onDone: (won: boolean) => void) => void;
  unmount: () => void;
}

export function createCardSceneController(root: HTMLElement): CardSceneController {
  let scene: HTMLDivElement | null = null;

  function unmount() {
    scene?.remove();
    scene = null;
  }

  function mountInteractive(onDone: (won: boolean) => void) {
    unmount();
    scene = document.createElement("div");
    scene.className = "card-scene";
    scene.innerHTML = `
      <h3 class="card-scene-title">Что ты протянешь тревоге?</h3>
      <p class="card-scene-sub">Выбери одну карту. Тихие вещи подходят лучше громких.</p>
      <div class="card-hand" role="list"></div>
      <div class="card-outcome" hidden></div>
    `;

    const hand = scene.querySelector(".card-hand");
    const outcomeEl = scene.querySelector(".card-outcome");
    const cards = getCardsByIds([...HAND_CARD_IDS]);

    for (const c of cards) {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "card";
      el.setAttribute("aria-label", c.name);
      el.innerHTML = `
        <span class="card-icon">${c.icon}</span>
        <span class="card-name">${escapeHtml(c.name)}</span>
        <span class="card-desc">${escapeHtml(c.desc)}</span>
      `;
      el.addEventListener("click", () => {
        const { success, text } = resolveCardPick(c.element);
        if (hand) hand.innerHTML = "";
        if (outcomeEl instanceof HTMLElement) {
          outcomeEl.hidden = false;
          outcomeEl.innerHTML = `
            <p class="card-result">${escapeHtml(text)}</p>
            <button type="button" class="card-close">Дальше</button>
          `;
          outcomeEl.querySelector(".card-close")?.addEventListener("click", () => {
            unmount();
            onDone(success);
          });
        }
      });
      hand?.appendChild(el);
    }

    root.appendChild(scene);
  }

  return { mountInteractive, unmount };
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
