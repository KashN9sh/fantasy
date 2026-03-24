/** Чёрный экран пролога (сцена 0, SCENARIO) */

export interface IntroOverlayApi {
  mount: (screens: { text: string }[], onDone: () => void) => void;
  unmount: () => void;
}

export function createIntroOverlay(root: HTMLElement): IntroOverlayApi {
  let wrap: HTMLDivElement | null = null;
  let index = 0;
  let screensRef: { text: string }[] = [];
  let onDoneRef: (() => void) | null = null;

  function render() {
    if (!wrap) return;
    const s = screensRef[index];
    if (!s) return;
    wrap.innerHTML = `
      <div class="intro-box">
        <p class="intro-text">${escapeHtml(s.text)}</p>
        <p class="intro-hint">Enter, Пробел или клик — дальше</p>
      </div>
    `;
  }

  function advance() {
    index++;
    if (index >= screensRef.length) {
      const cb = onDoneRef;
      unmount();
      cb?.();
      return;
    }
    render();
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
    screensRef = [];
    onDoneRef = null;
    index = 0;
  }

  function mount(screens: { text: string }[], onDone: () => void) {
    unmount();
    screensRef = screens;
    onDoneRef = onDone;
    index = 0;
    wrap = document.createElement("div");
    wrap.className = "intro-overlay";
    root.appendChild(wrap);
    wrap.addEventListener("click", () => advance());
    window.addEventListener("keydown", onKey);
    render();
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
