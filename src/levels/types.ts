import type { InteractableVisibility } from '../systems/QuestManager';

export interface GroundPoint {
  x: number;
  y: number;
}

export interface BackgroundLayer {
  key: string;
  scrollFactor: number;
}

export interface InteractableDef {
  id: string;
  type: 'npc' | 'object' | 'ritual' | 'examine' | 'transition';
  x: number;
  spriteKey: string;
  name?: string;
  dialogueId?: string;
  ritualId?: string;
  targetLevel?: string;
  examineText?: string;
  setFlagOnInteract?: string;
  addItemOnInteract?: string;
  conditionFlag?: string;
  conditionNotFlag?: string;
  questVisibility?: InteractableVisibility;
}

export interface PaletteConfig {
  bg: string;
  accent: string;
  fog: string;
}

export interface LevelData {
  id: string;
  name: string;
  width: number;
  groundLine: GroundPoint[];
  backgrounds: BackgroundLayer[];
  interactables: InteractableDef[];
  palette: PaletteConfig;
  ambience?: string;
  playerStartX?: number;
}
