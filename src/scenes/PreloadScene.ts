import Phaser from 'phaser';
import { SCENE_KEYS, CANVAS_W, CANVAS_H } from '../config';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.PRELOAD);
  }

  create(): void {
    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2;

    this.add.text(cx, cy - 12, 'Тихая тропа', {
      fontSize: '10px',
      color: '#c8a870',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(cx, cy + 6, 'загрузка...', {
      fontSize: '7px',
      color: '#807060',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.time.delayedCall(600, () => {
      this.scene.start(SCENE_KEYS.TITLE);
    });
  }
}
