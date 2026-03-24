import { surfaceWorld } from "../theme/canvasPalette";
import { isStoryNpcVisible, type StoryNpcKind } from "../data/scenarioParts5to8";
import type { GameState } from "./types";
import { consumePress, isDown } from "./input";
import { encounterRecordMove } from "./encounters";
import {
  MAP_H,
  MAP_W,
  TILE,
  ZONE_LAYOUT,
  ZONE_TILES,
  ZONE_TRANSITION,
  type StoryNpcSpawn,
} from "./overworldMaps";

export { TILE, MAP_W, MAP_H } from "./overworldMaps";

const COLORS: Record<number, string> = {
  0: surfaceWorld.water,
  1: surfaceWorld.grass,
  2: surfaceWorld.path,
  3: surfaceWorld.tree,
  4: "#c4a35a",
};

let moveCooldownMs = 0;

function tilesFor(state: GameState): number[] {
  return ZONE_TILES[state.currentZoneId] ?? ZONE_TILES.clearing;
}

function tileAt(state: GameState, tx: number, ty: number): number {
  const tiles = tilesFor(state);
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return 0;
  return tiles[ty * MAP_W + tx] ?? 0;
}

function isBlocked(state: GameState, tx: number, ty: number): boolean {
  const t = tileAt(state, tx, ty);
  if (t === 0 || t === 3) return true;
  const lay = ZONE_LAYOUT[state.currentZoneId];
  if (lay.hermit && tx === lay.hermit.x && ty === lay.hermit.y) return true;
  if (lay.vera && tx === lay.vera.x && ty === lay.vera.y) return true;
  if (lay.lin && tx === lay.lin.x && ty === lay.lin.y) return true;
  if (lay.ira && tx === lay.ira.x && ty === lay.ira.y) return true;
  for (const sn of lay.storyNpcs) {
    if (!isStoryNpcVisible(state, sn.kind)) continue;
    if (tx === sn.x && ty === sn.y) return true;
  }
  return false;
}

function adjacentToHermit(state: GameState): boolean {
  const h = ZONE_LAYOUT[state.currentZoneId].hermit;
  if (!h) return false;
  const dx = Math.abs(state.playerTileX - h.x);
  const dy = Math.abs(state.playerTileY - h.y);
  return dx + dy === 1;
}

/** Игрок стоит на невидимой точке встречи ([ENCOUNTER_SYSTEM.md](../../docs/ENCOUNTER_SYSTEM.md)) */
export function playerOnEncounterTrigger(state: GameState): boolean {
  const enc = ZONE_LAYOUT[state.currentZoneId].encounter;
  if (!enc || state.defeatedEnemyIds.includes(enc.enemyId)) return false;
  return state.playerTileX === enc.tileX && state.playerTileY === enc.tileY;
}

function adjacentToVera(state: GameState): boolean {
  const v = ZONE_LAYOUT[state.currentZoneId].vera;
  if (!v) return false;
  return Math.abs(state.playerTileX - v.x) + Math.abs(state.playerTileY - v.y) === 1;
}

function adjacentToLin(state: GameState): boolean {
  const p = ZONE_LAYOUT[state.currentZoneId].lin;
  if (!p) return false;
  return Math.abs(state.playerTileX - p.x) + Math.abs(state.playerTileY - p.y) === 1;
}

function adjacentToIra(state: GameState): boolean {
  const p = ZONE_LAYOUT[state.currentZoneId].ira;
  if (!p) return false;
  return Math.abs(state.playerTileX - p.x) + Math.abs(state.playerTileY - p.y) === 1;
}

export function tryStartHermitDialog(state: GameState): boolean {
  if (!adjacentToHermit(state)) return false;
  return consumePress("KeyE") || consumePress("Space");
}

export function tryStartVeraDialog(state: GameState): boolean {
  if (!adjacentToVera(state)) return false;
  return consumePress("KeyE") || consumePress("Space");
}

export function tryStartLinDialog(state: GameState): boolean {
  if (!adjacentToLin(state)) return false;
  return consumePress("KeyE") || consumePress("Space");
}

export function tryStartIraDialog(state: GameState): boolean {
  if (!adjacentToIra(state)) return false;
  return consumePress("KeyE") || consumePress("Space");
}

function visibleStorySpawns(state: GameState): StoryNpcSpawn[] {
  return ZONE_LAYOUT[state.currentZoneId].storyNpcs.filter((sn) =>
    isStoryNpcVisible(state, sn.kind),
  );
}

/** Соседняя видимая сюжетная точка (порядок — как в лейауте зоны). */
export function adjacentStoryNpcKind(state: GameState): StoryNpcKind | null {
  for (const sn of visibleStorySpawns(state)) {
    const d = Math.abs(state.playerTileX - sn.x) + Math.abs(state.playerTileY - sn.y);
    if (d === 1) return sn.kind;
  }
  return null;
}

/** E/Пробел у сюжетного NPC ч.5–8; возвращает kind и съедает нажатие. */
export function tryConsumeStoryNpcInteraction(state: GameState): StoryNpcKind | null {
  if (state.mode !== "explore") return null;
  const kind = adjacentStoryNpcKind(state);
  if (!kind) return null;
  if (!consumePress("KeyE") && !consumePress("Space")) return null;
  return kind;
}

export function playerOnRestSpot(state: GameState): boolean {
  const r = ZONE_LAYOUT[state.currentZoneId].restSpot;
  if (!r) return false;
  return state.playerTileX === r.x && state.playerTileY === r.y;
}

export function tryStartRest(state: GameState): boolean {
  if (state.mode !== "explore") return false;
  if (!playerOnRestSpot(state)) return false;
  return consumePress("KeyE") || consumePress("Space");
}

/** Игрок на клетке перехода в следующую зону */
export function onZoneExitTile(state: GameState): boolean {
  const tr = ZONE_TRANSITION[state.currentZoneId];
  if (!tr) return false;
  return state.playerTileX === tr.tileX && state.playerTileY === tr.tileY;
}

/** Переход по E / Пробел с клетки выхода */
export function tryConsumeZoneTransition(state: GameState): boolean {
  if (state.mode !== "explore") return false;
  const tr = ZONE_TRANSITION[state.currentZoneId];
  if (!tr) return false;
  if (state.playerTileX !== tr.tileX || state.playerTileY !== tr.tileY) return false;
  if (!consumePress("KeyE") && !consumePress("Space")) return false;
  const next = tr.to;
  const spawn = ZONE_LAYOUT[next].spawnIn;
  state.currentZoneId = next;
  state.playerTileX = spawn.x;
  state.playerTileY = spawn.y;
  return true;
}

export function updateOverworld(state: GameState, dtMs: number): void {
  if (state.mode !== "explore") return;

  moveCooldownMs = Math.max(0, moveCooldownMs - dtMs);

  let dx = 0;
  let dy = 0;
  if (moveCooldownMs <= 0) {
    if (isDown("KeyW") || isDown("ArrowUp")) dy = -1;
    else if (isDown("KeyS") || isDown("ArrowDown")) dy = 1;
    else if (isDown("KeyA") || isDown("ArrowLeft")) dx = -1;
    else if (isDown("KeyD") || isDown("ArrowRight")) dx = 1;

    if (dx !== 0 || dy !== 0) {
      const nx = state.playerTileX + dx;
      const ny = state.playerTileY + dy;
      if (!isBlocked(state, nx, ny)) {
        encounterRecordMove(state, dx, dy);
        state.playerTileX = nx;
        state.playerTileY = ny;
        moveCooldownMs = 140;
      } else {
        moveCooldownMs = 80;
      }
    }
  }
}

export function renderOverworld(
  ctx: CanvasRenderingContext2D,
  state: GameState,
): void {
  ctx.imageSmoothingEnabled = false;

  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      const t = tileAt(state, tx, ty);
      ctx.fillStyle = COLORS[t] ?? "#333";
      ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE);
    }
  }

  ctx.strokeStyle = surfaceWorld.gridLine;
  ctx.lineWidth = 1;
  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      ctx.strokeRect(tx * TILE + 0.5, ty * TILE + 0.5, TILE - 1, TILE - 1);
    }
  }

  const lay = ZONE_LAYOUT[state.currentZoneId];
  if (lay.hermit) {
    const hx = lay.hermit.x;
    const hy = lay.hermit.y;
    ctx.fillStyle = surfaceWorld.npcBody;
    ctx.fillRect(hx * TILE + 4, hy * TILE + 2, 8, 12);
    ctx.fillStyle = surfaceWorld.npcHair;
    ctx.fillRect(hx * TILE + 3, hy * TILE + 2, 10, 4);
  }

  if (lay.vera) {
    const vx = lay.vera.x;
    const vy = lay.vera.y;
    ctx.fillStyle = surfaceWorld.veraBody;
    ctx.fillRect(vx * TILE + 4, vy * TILE + 2, 8, 12);
    ctx.fillStyle = surfaceWorld.npcHair;
    ctx.fillRect(vx * TILE + 5, vy * TILE + 2, 6, 3);
  }
  if (lay.lin) {
    const lx = lay.lin.x;
    const ly = lay.lin.y;
    ctx.fillStyle = surfaceWorld.linBody;
    ctx.fillRect(lx * TILE + 4, ly * TILE + 2, 8, 12);
    ctx.fillStyle = "#C49A6E";
    ctx.fillRect(lx * TILE + 3, ly * TILE + 8, 3, 5);
  }
  if (lay.ira) {
    const ix = lay.ira.x;
    const iy = lay.ira.y;
    ctx.fillStyle = surfaceWorld.iraBody;
    ctx.fillRect(ix * TILE + 4, iy * TILE + 2, 8, 12);
    ctx.fillStyle = surfaceWorld.playerFace;
    ctx.fillRect(ix * TILE + 5, iy * TILE + 3, 6, 2);
  }

  for (const sn of visibleStorySpawns(state)) {
    const { x, y, kind } = sn;
    if (kind === "figure_camp") {
      ctx.fillStyle = "#6B5B8C";
      ctx.fillRect(x * TILE + 4, y * TILE + 2, 8, 12);
      ctx.fillStyle = "#3A3048";
      ctx.fillRect(x * TILE + 5, y * TILE + 3, 6, 4);
      continue;
    }
    if (kind === "vera_cross_second" || kind === "vera_camp_final") {
      ctx.fillStyle = surfaceWorld.veraBody;
      ctx.fillRect(x * TILE + 4, y * TILE + 2, 8, 12);
      ctx.fillStyle = surfaceWorld.npcHair;
      ctx.fillRect(x * TILE + 5, y * TILE + 2, 6, 3);
      continue;
    }
    if (kind === "lin_dusk_second" || kind === "lin_camp_final") {
      ctx.fillStyle = surfaceWorld.linBody;
      ctx.fillRect(x * TILE + 4, y * TILE + 2, 8, 12);
      ctx.fillStyle = "#C49A6E";
      ctx.fillRect(x * TILE + 3, y * TILE + 8, 3, 5);
      continue;
    }
    if (kind === "ira_cross_second" || kind === "ira_camp_final") {
      ctx.fillStyle = surfaceWorld.iraBody;
      ctx.fillRect(x * TILE + 4, y * TILE + 2, 8, 12);
      ctx.fillStyle = surfaceWorld.playerFace;
      ctx.fillRect(x * TILE + 5, y * TILE + 3, 6, 2);
      continue;
    }
    ctx.fillStyle = surfaceWorld.npcBody;
    ctx.fillRect(x * TILE + 4, y * TILE + 2, 8, 12);
    ctx.fillStyle = surfaceWorld.npcHair;
    ctx.fillRect(x * TILE + 3, y * TILE + 2, 10, 4);
  }

  ctx.fillStyle = surfaceWorld.player;
  ctx.fillRect(state.playerTileX * TILE + 4, state.playerTileY * TILE + 2, 8, 12);
  ctx.fillStyle = surfaceWorld.playerFace;
  ctx.fillRect(state.playerTileX * TILE + 5, state.playerTileY * TILE + 3, 6, 3);

  if (state.mode !== "explore") return;

  const hintY = MAP_H * TILE - 7;
  if (adjacentToHermit(state)) {
    ctx.fillStyle = surfaceWorld.hintBg;
    ctx.fillRect(4, MAP_H * TILE - 18, MAP_W * TILE - 8, 14);
    ctx.fillStyle = surfaceWorld.hintText;
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText("E / Пробел — поговорить", 8, hintY);
  } else if (adjacentToVera(state)) {
    ctx.fillStyle = surfaceWorld.hintBg;
    ctx.fillRect(4, MAP_H * TILE - 18, MAP_W * TILE - 8, 14);
    ctx.fillStyle = surfaceWorld.hintText;
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText("E / Пробел — Вера", 8, hintY);
  } else if (adjacentToLin(state)) {
    ctx.fillStyle = surfaceWorld.hintBg;
    ctx.fillRect(4, MAP_H * TILE - 18, MAP_W * TILE - 8, 14);
    ctx.fillStyle = surfaceWorld.hintText;
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText("E / Пробел — Лин", 8, hintY);
  } else if (adjacentToIra(state)) {
    ctx.fillStyle = surfaceWorld.hintBg;
    ctx.fillRect(4, MAP_H * TILE - 18, MAP_W * TILE - 8, 14);
    ctx.fillStyle = surfaceWorld.hintText;
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText("E / Пробел — Ира", 8, hintY);
  } else if (playerOnEncounterTrigger(state)) {
    ctx.fillStyle = surfaceWorld.hintBg;
    ctx.fillRect(4, MAP_H * TILE - 18, MAP_W * TILE - 8, 14);
    ctx.fillStyle = surfaceWorld.hintText;
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText("Здесь сгущается тишина — начнётся встреча", 8, hintY);
  } else if (playerOnRestSpot(state)) {
    ctx.fillStyle = surfaceWorld.hintBg;
    ctx.fillRect(4, MAP_H * TILE - 18, MAP_W * TILE - 8, 14);
    ctx.fillStyle = surfaceWorld.hintText;
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText("E / Пробел — привал (отдых)", 8, hintY);
  } else if (onZoneExitTile(state) && ZONE_TRANSITION[state.currentZoneId]) {
    const forkHint =
      state.currentZoneId === "last_camp" && !state.flags.lastCampForkDone
        ? "E / Пробел — развилка перед Корнем"
        : "E / Пробел — идти дальше по тропе";
    ctx.fillStyle = surfaceWorld.hintBg;
    ctx.fillRect(4, MAP_H * TILE - 18, MAP_W * TILE - 8, 14);
    ctx.fillStyle = surfaceWorld.hintText;
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText(forkHint, 8, hintY);
  } else {
    const sk = adjacentStoryNpcKind(state);
    if (sk) {
      const label: Record<StoryNpcKind, string> = {
        hermit_ravine: "E / Пробел — отшельник",
        lin_dusk_second: "E / Пробел — Лин",
        vera_cross_second: "E / Пробел — Вера",
        ira_cross_second: "E / Пробел — Ира",
        vera_camp_final: "E / Пробел — Вера",
        lin_camp_final: "E / Пробел — Лин / поляна",
        ira_camp_final: "E / Пробел — Ира",
        hermit_camp_third: "E / Пробел — отшельник",
        figure_camp: "E / Пробел — фигура",
      };
      ctx.fillStyle = surfaceWorld.hintBg;
      ctx.fillRect(4, MAP_H * TILE - 18, MAP_W * TILE - 8, 14);
      ctx.fillStyle = surfaceWorld.hintText;
      ctx.font = "10px monospace";
      ctx.textAlign = "left";
      ctx.fillText(label[sk], 8, hintY);
    }
  }
}
