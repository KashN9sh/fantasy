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
  conditionFlag?: string;
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
