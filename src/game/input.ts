const keys = new Set<string>();

export function initInput(): void {
  window.addEventListener("keydown", (e) => {
    keys.add(e.code);
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
      e.preventDefault();
    }
  });
  window.addEventListener("keyup", (e) => {
    keys.delete(e.code);
  });
}

export function isDown(code: string): boolean {
  return keys.has(code);
}

export function consumePress(code: string): boolean {
  if (!keys.has(code)) return false;
  keys.delete(code);
  return true;
}
