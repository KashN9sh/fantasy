import { DialogueTree } from '../../systems/DialogueEngine';
import { hermitIntro } from './hermitIntro';
import { veraThreshold } from './veraThreshold';
import { linMeadow } from './linMeadow';
import { iraMeadow } from './iraMeadow';
import { veraGrove } from './veraGrove';
import { fedyaGrove } from './fedyaGrove';
import { milaVillage, yarikVillage, tomVillage } from './villageDialogues';
import { kostyaVillage, polinaVillage, rayaVillage } from './villageExtraDialogues';
import { linRiver, tikhonRiver } from './riverDialogues';
import { hermitHills, solHills, markHills } from './hillsDialogues';
import { ninaMirrors } from './mirrorDialogues';
import { hermitMountain } from './mountainDialogues';
import { veraGarden, linGarden, hermitGarden } from './gardenDialogues';
import { glashaTeahouse, glashaReturn } from './glashaDialogues';
import { zoyaMirrors, zoyaGathering, zoyaComplete, zoyaExpired } from './zoyaDialogues';

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
  'kostya-village': kostyaVillage,
  'polina-village': polinaVillage,
  'raya-village': rayaVillage,
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
  'glasha-teahouse': glashaTeahouse,
  'glasha-return': glashaReturn,
  'zoya-mirrors': zoyaMirrors,
  'zoya-gathering': zoyaGathering,
  'zoya-complete': zoyaComplete,
  'zoya-expired': zoyaExpired,
};

export function getDialogue(id: string): DialogueTree | null {
  return dialogues[id] ?? null;
}
