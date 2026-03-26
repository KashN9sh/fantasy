import Phaser from 'phaser';
import { CANVAS_W, CANVAS_H } from './config';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { TitleScene } from './scenes/TitleScene';
import { WorldScene } from './scenes/WorldScene';
import { DialogueScene } from './scenes/DialogueScene';
import { RitualScene } from './scenes/RitualScene';
import { DiaryScene } from './scenes/DiaryScene';
import { EndingScene } from './scenes/EndingScene';

new Phaser.Game({
  type: Phaser.AUTO,
  width: CANVAS_W,
  height: CANVAS_H,
  parent: 'game-container',
  pixelArt: true,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, PreloadScene, TitleScene, WorldScene, DialogueScene, RitualScene, DiaryScene, EndingScene],
});
