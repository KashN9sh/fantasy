import Phaser from 'phaser';
import { PLAYER_SPEED, PLAYER_WIDTH, PLAYER_HEIGHT } from '../config';
import { GroundPoint } from '../levels/types';

export class Player extends Phaser.GameObjects.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private groundLine: GroundPoint[] = [];
  private frozen = false;

  constructor(scene: Phaser.Scene, x: number, groundLine: GroundPoint[]) {
    const y = Player.getGroundY(x, groundLine) - PLAYER_HEIGHT / 2;
    super(scene, x, y, 'player');
    this.groundLine = groundLine;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(PLAYER_WIDTH, PLAYER_HEIGHT);
    body.setAllowGravity(false);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = {
      left: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  freeze(): void {
    this.frozen = true;
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
  }

  unfreeze(): void {
    this.frozen = false;
  }

  update(): void {
    if (this.frozen) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;

    if (left && !right) {
      body.setVelocityX(-PLAYER_SPEED);
      this.setFlipX(true);
    } else if (right && !left) {
      body.setVelocityX(PLAYER_SPEED);
      this.setFlipX(false);
    } else {
      body.setVelocityX(0);
    }

    const groundY = Player.getGroundY(this.x, this.groundLine);
    this.y = groundY - PLAYER_HEIGHT / 2;
    body.y = this.y - PLAYER_HEIGHT / 2;
  }

  static getGroundY(x: number, groundLine: GroundPoint[]): number {
    if (groundLine.length === 0) return 150;
    if (x <= groundLine[0].x) return groundLine[0].y;
    if (x >= groundLine[groundLine.length - 1].x) return groundLine[groundLine.length - 1].y;

    for (let i = 0; i < groundLine.length - 1; i++) {
      const a = groundLine[i];
      const b = groundLine[i + 1];
      if (x >= a.x && x <= b.x) {
        const t = (x - a.x) / (b.x - a.x);
        return a.y + (b.y - a.y) * t;
      }
    }
    return 150;
  }
}
