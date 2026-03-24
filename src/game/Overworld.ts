import { surfaceWorld } from "../theme/canvasPalette";
import type { GameState } from "./types";
import { consumePress, isDown } from "./input";

export const TILE = 16;
export const MAP_W = 20;
export const MAP_H = 15;

/** 0 вода, 1 трава, 2 тропа, 3 дерево (стена) */
const TILES: number[] = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
  0, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 0,
  0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0,
  0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 3, 3, 1, 1, 1, 1, 1, 0,
  0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0,
  0, 1, 3, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 3, 1, 1, 0,
  0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 0,
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0,
  0, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0,
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0,
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0,
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

export const NPC_TILE = { x: 12, y: 5 };
/** Тренировочная тень — карточный бой */
export const TRAINER_TILE = { x: 8, y: 8 };

const COLORS: Record<number, string> = {
  0: surfaceWorld.water,
  1: surfaceWorld.grass,
  2: surfaceWorld.path,
  3: surfaceWorld.tree,
};

let moveCooldownMs = 0;

function tileAt(tx: number, ty: number): number {
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return 0;
  return TILES[ty * MAP_W + tx] ?? 0;
}

function isBlocked(tx: number, ty: number): boolean {
  const t = tileAt(tx, ty);
  if (t === 0 || t === 3) return true;
  if (tx === NPC_TILE.x && ty === NPC_TILE.y) return true;
  if (tx === TRAINER_TILE.x && ty === TRAINER_TILE.y) return true;
  return false;
}

function adjacentToNpc(px: number, py: number): boolean {
  const dx = Math.abs(px - NPC_TILE.x);
  const dy = Math.abs(py - NPC_TILE.y);
  return dx + dy === 1;
}

export function tryStartHermitDialog(state: GameState): boolean {
  if (!adjacentToNpc(state.playerTileX, state.playerTileY)) return false;
  return consumePress("KeyE") || consumePress("Space");
}

function adjacentToTrainer(px: number, py: number): boolean {
  const dx = Math.abs(px - TRAINER_TILE.x);
  const dy = Math.abs(py - TRAINER_TILE.y);
  return dx + dy === 1;
}

export function tryStartTrainerBattle(state: GameState): boolean {
  if (!adjacentToTrainer(state.playerTileX, state.playerTileY)) return false;
  return consumePress("KeyE") || consumePress("Space");
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
      if (!isBlocked(nx, ny)) {
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
      const t = tileAt(tx, ty);
      ctx.fillStyle = COLORS[t] ?? "#333";
      ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE);
    }
  }

  // мягкая сетка на траве для «пиксельности»
  ctx.strokeStyle = surfaceWorld.gridLine;
  ctx.lineWidth = 1;
  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      ctx.strokeRect(tx * TILE + 0.5, ty * TILE + 0.5, TILE - 1, TILE - 1);
    }
  }

  // NPC
  ctx.fillStyle = surfaceWorld.npcBody;
  ctx.fillRect(NPC_TILE.x * TILE + 4, NPC_TILE.y * TILE + 2, 8, 12);
  ctx.fillStyle = surfaceWorld.npcHair;
  ctx.fillRect(NPC_TILE.x * TILE + 3, NPC_TILE.y * TILE + 2, 10, 4);

  // тренер (тень)
  ctx.fillStyle = surfaceWorld.trainerBody;
  ctx.fillRect(TRAINER_TILE.x * TILE + 3, TRAINER_TILE.y * TILE + 2, 10, 12);
  ctx.fillStyle = surfaceWorld.trainerAccent;
  ctx.fillRect(TRAINER_TILE.x * TILE + 5, TRAINER_TILE.y * TILE + 4, 3, 3);
  ctx.fillRect(TRAINER_TILE.x * TILE + 9, TRAINER_TILE.y * TILE + 4, 3, 3);

  // игрок
  ctx.fillStyle = surfaceWorld.player;
  ctx.fillRect(state.playerTileX * TILE + 4, state.playerTileY * TILE + 2, 8, 12);
  ctx.fillStyle = surfaceWorld.playerFace;
  ctx.fillRect(state.playerTileX * TILE + 5, state.playerTileY * TILE + 3, 6, 3);

  // подсказка рядом с NPC
  if (state.mode === "explore" && adjacentToNpc(state.playerTileX, state.playerTileY)) {
    ctx.fillStyle = surfaceWorld.hintBg;
    ctx.fillRect(4, MAP_H * TILE - 18, MAP_W * TILE - 8, 14);
    ctx.fillStyle = surfaceWorld.hintText;
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText("E / Пробел — поговорить", 8, MAP_H * TILE - 7);
  } else if (state.mode === "explore" && adjacentToTrainer(state.playerTileX, state.playerTileY)) {
    ctx.fillStyle = surfaceWorld.hintBg;
    ctx.fillRect(4, MAP_H * TILE - 18, MAP_W * TILE - 8, 14);
    ctx.fillStyle = surfaceWorld.hintText;
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText("E / Пробел — карточный бой", 8, MAP_H * TILE - 7);
  }
}
