import type { DialogLine } from "../game/types";

export interface DialogController {
  mount: (lines: DialogLine[], onClose: () => void) => void;
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
    box.innerHTML = `
      <div class="dialog-speaker">${escapeHtml(line.speaker)}</div>
      <p class="dialog-text">${escapeHtml(line.text)}</p>
      <div class="dialog-hint">Enter или клик — дальше</div>
    `;
  }

  function advance() {
    index++;
    if (index >= linesRef.length) {
      const cb = onCloseRef;
      unmount();
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

  function unmount() {
    window.removeEventListener("keydown", onKey);
    wrap?.remove();
    wrap = null;
    linesRef = [];
    onCloseRef = null;
    index = 0;
  }

  function mount(lines: DialogLine[], onClose: () => void) {
    unmount();
    linesRef = lines;
    onCloseRef = onClose;
    index = 0;
    wrap = document.createElement("div");
    wrap.className = "dialog-overlay";
    const box = document.createElement("div");
    box.className = "dialog-box";
    box.tabIndex = 0;
    wrap.appendChild(box);
    root.appendChild(wrap);
    box.addEventListener("click", () => advance());
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
