/** §2.1 ENCOUNTER_SYSTEM: короткий визуальный пролог перед текстом предупреждения */
export function runEncounterPrelude(root: HTMLElement, then: () => void): void {
  const el = document.createElement("div");
  el.className = "encounter-prelude";
  el.setAttribute("aria-hidden", "true");
  root.appendChild(el);
  requestAnimationFrame(() => {
    el.classList.add("encounter-prelude--on");
  });
  window.setTimeout(() => {
    el.classList.remove("encounter-prelude--on");
    window.setTimeout(() => {
      el.remove();
      then();
    }, 450);
  }, 1100);
}
