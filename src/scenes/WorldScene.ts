import Phaser from 'phaser';
import { SCENE_KEYS, CANVAS_W, CANVAS_H } from '../config';
import { Player } from '../objects/Player';
import { NPC } from '../objects/NPC';
import { InteractableObject } from '../objects/InteractableObject';
import { InteractionPrompt } from '../objects/InteractionPrompt';
import { LevelData } from '../levels/types';
import { getLevel } from '../levels/registry';
import { GameState } from '../systems/GameState';
import { SaveManager } from '../systems/SaveManager';
import { QuestManager } from '../systems/QuestManager';
import { AudioManager } from '../systems/AudioManager';
import { allQuests } from '../data/quests/allQuests';

const LEVEL_ENTRY_FLAGS: Record<string, string[]> = {
  threshold: ['entered-threshold'],
  quietMeadow: ['entered-threshold'],
  foggyGrove: ['entered-foggy-grove'],
  fireflyVillage: ['entered-firefly-village'],
  quietRiver: ['entered-quiet-river'],
  whisperHills: ['entered-whisper-hills'],
  mirrorGrove: ['entered-mirror-grove'],
  mountainPath: ['entered-mountain-path'],
  gardenOfSilence: ['entered-garden'],
};

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private npcs: NPC[] = [];
  private objects: InteractableObject[] = [];
  private prompt!: InteractionPrompt;
  private currentOverlap: (NPC | InteractableObject) | null = null;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private diaryKey!: Phaser.Input.Keyboard.Key;
  private bgLayers: Phaser.GameObjects.TileSprite[] = [];
  private currentLevel!: LevelData;
  private overlayActive = false;

  constructor() {
    super(SCENE_KEYS.WORLD);
  }

  init(data: { levelId?: string }): void {
    const levelId = data.levelId ?? GameState.get().currentLevel;
    this.currentLevel = getLevel(levelId);
    GameState.get().currentLevel = levelId;
    QuestManager.registerAll(allQuests);
  }

  create(): void {
    this.overlayActive = false;
    this.currentOverlap = null;

    const level = this.currentLevel;

    AudioManager.init(this);
    AudioManager.crossfadeTo(`amb-${level.id}`);

    this.cameras.main.fadeIn(500);
    this.cameras.main.setBackgroundColor(level.palette.bg);

    this.createBackgrounds(level);
    this.createInteractables(level);

    this.player = new Player(this, level.playerStartX ?? 80, level.groundLine);
    this.player.setDepth(50);

    this.cameras.main.startFollow(this.player, true, 0.08, 0);
    this.cameras.main.setBounds(0, 0, level.width, CANVAS_H);
    this.physics.world.setBounds(0, 0, level.width, CANVAS_H);

    this.prompt = new InteractionPrompt(this);

    this.setupOverlaps();

    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.diaryKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);

    this.interactKey.on('down', () => this.handleInteraction());
    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).on('down', () => this.handleInteraction());
    this.diaryKey.on('down', () => this.toggleDiary());

    this.events.on('resume', () => {
      this.overlayActive = false;
      this.player.unfreeze();
      this.activateQuestsByFlags();
      QuestManager.checkAllProgress();
      this.checkEnding();
    });

    this.addFogEffect(level);
    this.addParticles();
    this.addControlsHint();
    this.addLevelNameDisplay(level.name);

    const entryFlags = LEVEL_ENTRY_FLAGS[level.id];
    if (entryFlags) {
      entryFlags.forEach(f => GameState.setFlag(f));
    }
    this.activateQuestsByFlags();
    QuestManager.checkAllProgress();
  }

  update(time: number, delta: number): void {
    if (this.overlayActive) return;

    this.player.update();
    this.npcs.forEach(n => n.update(time));
    this.prompt.update(time, delta);
    this.updateParallax();
  }

  private createBackgrounds(level: LevelData): void {
    this.bgLayers = [];
    level.backgrounds.forEach((bg, i) => {
      const layer = this.add.tileSprite(
        CANVAS_W / 2, CANVAS_H / 2,
        CANVAS_W, CANVAS_H,
        bg.key,
      );
      layer.setScrollFactor(0);
      layer.setDepth(i);
      this.bgLayers.push(layer);
    });
  }

  private updateParallax(): void {
    const camX = this.cameras.main.scrollX;
    this.currentLevel.backgrounds.forEach((bg, i) => {
      if (this.bgLayers[i]) {
        this.bgLayers[i].tilePositionX = camX * bg.scrollFactor;
      }
    });
  }

  private createInteractables(level: LevelData): void {
    this.npcs = [];
    this.objects = [];

    level.interactables.forEach(def => {
      if (def.conditionFlag && !GameState.hasFlag(def.conditionFlag)) return;
      if (def.conditionNotFlag && GameState.hasFlag(def.conditionNotFlag)) return;
      if (!QuestManager.isInteractableVisible(def.questVisibility)) return;

      if (def.type === 'npc') {
        const npc = new NPC(this, def, level.groundLine);
        npc.setDepth(40);
        this.npcs.push(npc);
      } else {
        const obj = new InteractableObject(this, def, level.groundLine);
        obj.setDepth(30);
        this.objects.push(obj);
      }
    });
  }

  private setupOverlaps(): void {
    const allInteractables = [...this.npcs, ...this.objects];
    allInteractables.forEach(target => {
      this.physics.add.overlap(this.player, target, () => {
        if (this.overlayActive) return;
        this.currentOverlap = target;
        this.prompt.show(target);
      });
    });
  }

  preUpdate(): void {
    if (!this.overlayActive) {
      const prev = this.currentOverlap;
      this.currentOverlap = null;

      const allInteractables = [...this.npcs, ...this.objects];
      let found = false;
      allInteractables.forEach(target => {
        if (found) return;
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
        if (dist < 24) {
          this.currentOverlap = target;
          found = true;
        }
      });

      if (!this.currentOverlap && prev) {
        this.prompt.hide();
      } else if (this.currentOverlap) {
        this.prompt.show(this.currentOverlap);
      }
    }
  }

  private handleInteraction(): void {
    if (this.overlayActive || !this.currentOverlap) return;

    const def = this.currentOverlap.def;
    this.overlayActive = true;
    this.player.freeze();

    if (def.setFlagOnInteract) GameState.setFlag(def.setFlagOnInteract);
    if (def.addItemOnInteract) GameState.addItem(def.addItemOnInteract);

    switch (def.type) {
      case 'npc': {
        const questDialogue = QuestManager.getDialogueForNpc(def.id);
        const dialogueId = questDialogue ?? def.dialogueId;
        if (dialogueId) {
          this.scene.launch(SCENE_KEYS.DIALOGUE, {
            dialogueId,
            speakerName: def.name,
            returnScene: SCENE_KEYS.WORLD,
          });
          this.scene.pause();
        } else {
          this.overlayActive = false;
          this.player.unfreeze();
        }
        break;
      }

      case 'examine':
        this.scene.launch(SCENE_KEYS.DIALOGUE, {
          examineText: def.examineText,
          speakerName: def.name,
          returnScene: SCENE_KEYS.WORLD,
        });
        this.scene.pause();
        break;

      case 'ritual':
        if (def.ritualId) {
          this.scene.launch(SCENE_KEYS.RITUAL, {
            ritualId: def.ritualId,
            returnScene: SCENE_KEYS.WORLD,
          });
          this.scene.pause();
        }
        break;

      case 'transition':
        if (def.targetLevel) {
          QuestManager.onTransition();
          SaveManager.save();
          AudioManager.stopAmbience(400);
          this.cameras.main.fadeOut(400, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.cleanup();
            this.scene.restart({ levelId: def.targetLevel });
          });
        }
        break;

      default:
        this.overlayActive = false;
        this.player.unfreeze();
    }
  }

  private toggleDiary(): void {
    if (this.overlayActive) return;
    this.overlayActive = true;
    this.player.freeze();
    this.scene.launch(SCENE_KEYS.DIARY, { returnScene: SCENE_KEYS.WORLD });
    this.scene.pause();
  }

  private addLevelNameDisplay(name: string): void {
    const text = this.add.text(CANVAS_W / 2, 16, name, {
      fontSize: '8px',
      color: '#c8a870',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    this.tweens.add({
      targets: text,
      alpha: { from: 0, to: 1 },
      duration: 800,
      hold: 1500,
      yoyo: true,
      onComplete: () => text.destroy(),
    });
  }

  private addFogEffect(level: LevelData): void {
    const fogColor = Phaser.Display.Color.HexStringToColor(level.palette.fog);
    const fog = this.add.rectangle(
      CANVAS_W / 2, CANVAS_H / 2,
      CANVAS_W, CANVAS_H,
      fogColor.color, 0.15,
    );
    fog.setScrollFactor(0);
    fog.setDepth(90);

    this.tweens.add({
      targets: fog,
      alpha: { from: 0.1, to: 0.2 },
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private checkEnding(): void {
    if (this.currentLevel.id !== 'gardenOfSilence') return;
    const hasEnding = GameState.hasFlag('ending-acceptance')
      || GameState.hasFlag('ending-seeking')
      || GameState.hasFlag('ending-connection')
      || GameState.hasFlag('ending-care')
      || GameState.hasFlag('ending-trust');
    const hasPlanted = GameState.hasFlag('ritual-plant-done');

    if (hasEnding || hasPlanted) {
      this.time.delayedCall(1500, () => {
        SaveManager.save();
        this.cameras.main.fadeOut(1500, 26, 26, 46);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENE_KEYS.ENDING);
        });
      });
    }
  }

  private addParticles(): void {
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(0, CANVAS_W);
      const y = Phaser.Math.Between(40, CANVAS_H - 40);
      const dot = this.add.circle(x, y, 1, 0xc8a870, 0.3);
      dot.setScrollFactor(0.4 + Math.random() * 0.3);
      dot.setDepth(80);

      this.tweens.add({
        targets: dot,
        y: y - 10 - Math.random() * 20,
        alpha: { from: 0.15, to: 0.5 },
        duration: 3000 + Math.random() * 4000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 3000,
      });
    }
  }

  private addControlsHint(): void {
    const state = GameState.get();
    if (state.flags['controls-shown']) return;

    const hint = this.add.text(CANVAS_W / 2, CANVAS_H - 12,
      'A/D — идти · E — взаимодействие · TAB — дневник', {
        fontSize: '5px',
        color: '#807060',
        fontFamily: 'monospace',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    this.tweens.add({
      targets: hint,
      alpha: { from: 0, to: 0.8 },
      duration: 1000,
      delay: 2000,
      hold: 4000,
      yoyo: true,
      onComplete: () => {
        hint.destroy();
        GameState.setFlag('controls-shown');
      },
    });
  }

  private activateQuestsByFlags(): void {
    const triggers: [string, string][] = [
      ['vera-met', 'vera-map'],
      ['lin-tree-heard', 'lin-tree'],
      ['mila-met', 'mila-tea'],
      ['tom-try-wind', 'tom-melody'],
      ['tom-try-fire', 'tom-melody'],
      ['tom-try-note', 'tom-melody'],
      ['fedya-met', 'fedya-letter'],
      ['kostya-bread-given', 'kostya-bread'],
      ['anchor-forged', 'yarik-anchor'],
      ['polina-quest-given', 'polina-book'],
      ['raya-offered', 'raya-garden'],
      ['star-named', 'mark-star'],
      ['nina-met', 'nina-thread'],
      ['zoya-dew-started', 'zoya-dew'],
    ];
    for (const [flag, questId] of triggers) {
      if (GameState.hasFlag(flag)) {
        QuestManager.activate(questId);
      }
    }

    const levelQuests: Record<string, string[]> = {
      threshold: ['chapter-1'],
      quietMeadow: ['chapter-1'],
      foggyGrove: ['chapter-2'],
      fireflyVillage: ['chapter-3'],
      quietRiver: ['chapter-4'],
      whisperHills: ['chapter-5'],
      mirrorGrove: ['chapter-6'],
      mountainPath: ['chapter-7'],
      gardenOfSilence: ['chapter-8'],
    };
    const chapterQuests = levelQuests[this.currentLevel.id];
    if (chapterQuests) {
      chapterQuests.forEach(q => QuestManager.activate(q));
    }
  }

  private cleanup(): void {
    this.bgLayers = [];
    this.npcs = [];
    this.objects = [];
    this.currentOverlap = null;
  }
}
