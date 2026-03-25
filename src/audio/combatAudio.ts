let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function blip(freq: number, ms: number, gain = 0.03): void {
  const ac = ensureCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + ms / 1000);
}

export type CombatAudioEvent = "battle_open" | "card_play" | "turn_end" | "battle_close";

export function playCombatAudioEvent(event: CombatAudioEvent): void {
  if (event === "battle_open") blip(120, 220, 0.04);
  else if (event === "card_play") blip(320, 80, 0.025);
  else if (event === "turn_end") blip(220, 120, 0.03);
  else blip(170, 160, 0.03);
}
