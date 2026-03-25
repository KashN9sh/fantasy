import type { DialogLine } from "../game/types";

export type DialogEncounterExtra = "silence" | "interrupt";

export interface DialogController {
  mount: (
    lines: DialogLine[],
    onClose: () => void,
    extras?: Partial<Record<DialogEncounterExtra, () => void>>,
  ) => void;
  unmount: () => void;
}

export function createDialogController(root: HTMLElement): DialogController {
  let wrap: HTMLDivElement | null = null;
  let index = 0;
  let linesRef: DialogLine[] = [];
  let onCloseRef: (() => void) | null = null;

  function renderLine() {
    if (!wrap) return;
    const box = wrap.querySelector(".dialog-box");
    if (!(box instanceof HTMLElement)) return;
    const line = linesRef[index];
    if (!line) return;
    const extraRow =
      index === 0 && (wrap.dataset.exSilence === "1" || wrap.dataset.exInterrupt === "1")
        ? `<div class="dialog-extras">
            ${wrap.dataset.exSilence === "1" ? '<button type="button" class="dialog-extra-btn" data-extra="silence">Молчать…</button>' : ""}
            ${wrap.dataset.exInterrupt === "1" ? '<button type="button" class="dialog-extra-btn" data-extra="interrupt">Перебить</button>' : ""}
          </div>`
        : "";
    box.innerHTML = `
      <div class="dialog-speaker">${escapeHtml(line.speaker)}</div>
      <p class="dialog-text">${escapeHtml(line.text)}</p>
      ${extraRow}
      <div class="dialog-hint">Enter или клик — дальше</div>
    `;
    box.querySelectorAll("[data-extra]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const kind = (el as HTMLElement).dataset.extra as DialogEncounterExtra;
        const fn = extraFnsRef[kind];
        if (fn) {
          hardClose();
          fn();
        }
      });
    });
  }

  let extraFnsRef: Partial<Record<DialogEncounterExtra, () => void>> = {};

  function advance() {
    index++;
    if (index >= linesRef.length) {
      const cb = onCloseRef;
      hardClose();
      cb?.();
      return;
    }
    renderLine();
  }

  function onKey(e: KeyboardEvent) {
    if (e.code === "Enter" || e.code === "Space") {
      e.preventDefault();
      advance();
    }
  }

  function hardClose() {
    window.removeEventListener("keydown", onKey);
    wrap?.remove();
    wrap = null;
    linesRef = [];
    onCloseRef = null;
    index = 0;
    extraFnsRef = {};
  }

  function unmount() {
    hardClose();
  }

  function mount(
    lines: DialogLine[],
    onClose: () => void,
    extras?: Partial<Record<DialogEncounterExtra, () => void>>,
  ) {
    unmount();
    linesRef = lines;
    onCloseRef = onClose;
    extraFnsRef = extras ?? {};
    index = 0;
    wrap = document.createElement("div");
    wrap.className = "dialog-overlay pixel-overlay pixel-overlay--bottom";
    wrap.dataset.exSilence = extras?.silence ? "1" : "0";
    wrap.dataset.exInterrupt = extras?.interrupt ? "1" : "0";
    const box = document.createElement("div");
    box.className = "dialog-box pixel-panel pixel-panel--strong pixel-stack";
    box.tabIndex = 0;
    wrap.appendChild(box);
    root.appendChild(wrap);
    box.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest(".dialog-extra-btn")) return;
      advance();
    });
    window.addEventListener("keydown", onKey);
    renderLine();
    box.focus();
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
