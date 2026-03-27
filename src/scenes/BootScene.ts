import Phaser from 'phaser';
import { SCENE_KEYS, CANVAS_W, CANVAS_H } from '../config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.BOOT);
  }

  preload(): void {
    this.generatePlaceholderTextures();
    this.loadAudio();
  }

  create(): void {
    this.scene.start(SCENE_KEYS.PRELOAD);
  }

  private generatePlaceholderTextures(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    g.fillStyle(0x5a4a3a);
    g.fillRect(0, 0, 12, 20);
    g.fillStyle(0xc8a870);
    g.fillRect(3, 2, 6, 6);
    g.generateTexture('player', 12, 20);
    g.clear();

    g.fillStyle(0x6a8a5a);
    g.fillRect(0, 0, 14, 22);
    g.fillStyle(0xd4c8a0);
    g.fillRect(4, 3, 6, 6);
    g.generateTexture('npc', 14, 22);
    g.clear();

    g.fillStyle(0x8a7a5a);
    g.fillRect(0, 0, 10, 10);
    g.generateTexture('object', 10, 10);
    g.clear();

    this.generateParallaxLayers(g);

    g.destroy();
  }

  private loadAudio(): void {
    const ambience: Record<string, string> = {
      threshold: 'mp3', quietMeadow: 'ogg', foggyGrove: 'mp3',
      fireflyVillage: 'ogg', quietRiver: 'ogg', whisperHills: 'ogg',
      mirrorGrove: 'mp3', mountainPath: 'ogg', gardenOfSilence: 'ogg',
    };
    for (const [id, ext] of Object.entries(ambience)) {
      this.load.audio(`amb-${id}`, `assets/audio/ambience/${id}.${ext}`);
    }

    this.load.audio('ui-open', 'assets/audio/ui/ui-open.wav');
    this.load.audio('ui-select', 'assets/audio/ui/ui-select.wav');
    this.load.audio('ui-close', 'assets/audio/ui/ui-close.wav');

    this.load.audio('ritual-water', 'assets/audio/ritual/ritual-water.ogg');
    this.load.audio('ritual-breath', 'assets/audio/ritual/ritual-breath.wav');
    this.load.audio('ritual-fire', 'assets/audio/ritual/ritual-fire.wav');
    this.load.audio('ritual-wind', 'assets/audio/ritual/ritual-wind.wav');
  }

  private generateParallaxLayers(g: Phaser.GameObjects.Graphics): void {
    const w = CANVAS_W;
    const h = CANVAS_H;

    g.fillStyle(0x2a2040);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0x3a3060);
    g.fillCircle(60, 30, 12);
    g.fillCircle(200, 40, 8);
    g.fillCircle(280, 25, 6);
    g.generateTexture('bg-sky', w, h);
    g.clear();

    g.fillStyle(0x3a3858);
    for (let i = 0; i < w; i += 40) {
      const mh = 30 + Math.sin(i * 0.05) * 15;
      g.fillTriangle(i, h, i + 20, h - mh, i + 40, h);
    }
    g.generateTexture('bg-mountains', w, h);
    g.clear();

    g.fillStyle(0x2a4a2a);
    for (let i = 0; i < w; i += 24) {
      const th = 20 + Math.sin(i * 0.08) * 10;
      g.fillRect(i + 8, h - th - 20, 4, th);
      g.fillCircle(i + 10, h - th - 20, 8);
    }
    g.generateTexture('bg-trees', w, h);
    g.clear();

    g.fillStyle(0x4a6a3a);
    g.fillRect(0, h - 20, w, 20);
    g.fillStyle(0x5a7a4a);
    for (let i = 0; i < w; i += 6) {
      g.fillRect(i, h - 22 + Math.sin(i * 0.3) * 2, 3, 4);
    }
    g.generateTexture('bg-ground', w, h);
    g.clear();
  }
}
