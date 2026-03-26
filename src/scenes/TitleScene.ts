import Phaser from 'phaser';
import { SCENE_KEYS, CANVAS_W, CANVAS_H } from '../config';
import { SaveManager } from '../systems/SaveManager';
import { GameState } from '../systems/GameState';
import { QuestManager } from '../systems/QuestManager';
import { mainQuests } from '../data/quests/mainQuests';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.TITLE);
  }

  create(): void {
    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2;
    const hasSave = SaveManager.hasSave();

    this.cameras.main.setBackgroundColor('#1a1a2e');
    this.add.tileSprite(cx, cy, CANVAS_W, CANVAS_H, 'bg-sky');

    const title = this.add.text(cx, cy - 24, 'Тихая тропа', {
      fontSize: '12px',
      color: '#e8dcc8',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setAlpha(0);

    const subtitle = this.add.text(cx, cy - 8, 'игра-прогулка о тревоге и принятии', {
      fontSize: '7px',
      color: '#a08870',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setAlpha(0);

    const newGameText = hasSave ? '[ N — новая игра ]' : '[ нажмите любую клавишу ]';
    const newGame = this.add.text(cx, cy + 20, newGameText, {
      fontSize: '6px',
      color: '#605848',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setAlpha(0);

    let continueText: Phaser.GameObjects.Text | null = null;
    if (hasSave) {
      continueText = this.add.text(cx, cy + 32, '[ ENTER — продолжить ]', {
        fontSize: '6px',
        color: '#a09070',
        fontFamily: 'monospace',
      }).setOrigin(0.5).setAlpha(0);
    }

    this.tweens.add({ targets: title, alpha: 1, duration: 1200, ease: 'Sine.easeIn' });
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 1000, delay: 800, ease: 'Sine.easeIn' });
    this.tweens.add({
      targets: newGame,
      alpha: { from: 0, to: 0.7 },
      duration: 800,
      delay: 1600,
      ease: 'Sine.easeIn',
      yoyo: true,
      repeat: -1,
      hold: 1200,
    });
    if (continueText) {
      this.tweens.add({
        targets: continueText,
        alpha: { from: 0, to: 0.9 },
        duration: 800,
        delay: 1800,
        ease: 'Sine.easeIn',
        yoyo: true,
        repeat: -1,
        hold: 1200,
      });
    }

    if (hasSave) {
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).once('down', () => {
        this.startContinue();
      });
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.N).once('down', () => {
        this.startNewGame();
      });
    } else {
      this.input.keyboard!.once('keydown', () => {
        this.startNewGame();
      });
    }
  }

  private startNewGame(): void {
    GameState.reset();
    SaveManager.deleteSave();
    QuestManager.registerAll(mainQuests);
    QuestManager.activate('chapter-1-threshold');
    this.fadeToWorld('threshold');
  }

  private startContinue(): void {
    SaveManager.load();
    QuestManager.registerAll(mainQuests);
    const levelId = GameState.get().currentLevel;
    this.fadeToWorld(levelId);
  }

  private fadeToWorld(levelId: string): void {
    this.cameras.main.fadeOut(500, 26, 26, 46);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENE_KEYS.WORLD, { levelId });
    });
  }
}
