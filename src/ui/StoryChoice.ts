import type { StoryChoiceOption } from "../game/types";

export interface StoryChoiceApi {
  mount: (
    prompt: string,
    options: StoryChoiceOption[],
    onPick: (opt: StoryChoiceOption) => void,
  ) => void;
  unmount: () => void;
}

export function createStoryChoice(root: HTMLElement): StoryChoiceApi {
  let wrap: HTMLDivElement | null = null;

  function unmount() {
    wrap?.remove();
    wrap = null;
  }

  function mount(
    prompt: string,
    options: StoryChoiceOption[],
    onPick: (opt: StoryChoiceOption) => void,
  ) {
    unmount();
    wrap = document.createElement("div");
    wrap.className = "choice-overlay";
    wrap.innerHTML = `
      <div class="choice-box">
        <p class="choice-prompt">${escapeHtml(prompt)}</p>
        <div class="choice-buttons">
          ${options
            .map(
              (o) =>
                `<button type="button" class="choice-btn" data-opt-id="${escapeHtml(o.id)}">${escapeHtml(o.label)}</button>`,
            )
            .join("")}
        </div>
      </div>
    `;
    root.appendChild(wrap);
    wrap.querySelectorAll(".choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = (btn as HTMLElement).dataset.optId;
        const opt = options.find((o) => o.id === id);
        if (!opt) return;
        unmount();
        onPick(opt);
      });
    });
  }

  return { mount, unmount };
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
