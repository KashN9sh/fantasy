import { DialogueTree } from '../../systems/DialogueEngine';
import { hermitIntro } from './hermitIntro';
import { veraThreshold } from './veraThreshold';
import { linMeadow } from './linMeadow';
import { iraMeadow } from './iraMeadow';
import { veraGrove } from './veraGrove';
import { fedyaGrove } from './fedyaGrove';
import { milaVillage, yarikVillage, tomVillage } from './villageDialogues';
import { linRiver, tikhonRiver } from './riverDialogues';
import { hermitHills, solHills, markHills } from './hillsDialogues';
import { ninaMirrors } from './mirrorDialogues';
import { hermitMountain } from './mountainDialogues';
import { veraGarden, linGarden, hermitGarden } from './gardenDialogues';

const dialogues: Record<string, DialogueTree> = {
  'hermit-intro': hermitIntro,
  'vera-threshold': veraThreshold,
  'lin-meadow': linMeadow,
  'ira-meadow': iraMeadow,
  'vera-grove': veraGrove,
  'fedya-grove': fedyaGrove,
  'mila-village': milaVillage,
  'yarik-village': yarikVillage,
  'tom-village': tomVillage,
  'lin-river': linRiver,
  'tikhon-river': tikhonRiver,
  'hermit-hills': hermitHills,
  'sol-hills': solHills,
  'mark-hills': markHills,
  'nina-mirrors': ninaMirrors,
  'hermit-mountain': hermitMountain,
  'vera-garden': veraGarden,
  'lin-garden': linGarden,
  'hermit-garden': hermitGarden,
};

export function getDialogue(id: string): DialogueTree | null {
  return dialogues[id] ?? null;
}
