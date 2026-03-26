import { LevelData } from './types';
import { threshold } from './threshold';
import { quietMeadow } from './quietMeadow';
import { foggyGrove } from './foggyGrove';
import { fireflyVillage } from './fireflyVillage';
import { quietRiver } from './quietRiver';
import { whisperHills } from './whisperHills';
import { mirrorGrove } from './mirrorGrove';
import { mountainPath } from './mountainPath';
import { gardenOfSilence } from './gardenOfSilence';

const levels: Record<string, LevelData> = {
  threshold,
  quietMeadow,
  foggyGrove,
  fireflyVillage,
  quietRiver,
  whisperHills,
  mirrorGrove,
  mountainPath,
  gardenOfSilence,
};

export function getLevel(id: string): LevelData {
  const level = levels[id];
  if (!level) throw new Error(`Unknown level: ${id}`);
  return level;
}

export function getAllLevelIds(): string[] {
  return Object.keys(levels);
}
