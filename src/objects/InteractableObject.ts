import Phaser from 'phaser';
import { InteractableDef, GroundPoint } from '../levels/types';
import { Player } from './Player';
import { INTERACTION_RANGE } from '../config';

export class InteractableObject extends Phaser.GameObjects.Sprite {
  readonly def: InteractableDef;

  constructor(scene: Phaser.Scene, def: InteractableDef, groundLine: GroundPoint[]) {
    const groundY = Player.getGroundY(def.x, groundLine);
    super(scene, def.x, groundY - 5, def.spriteKey);
    this.def = def;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(INTERACTION_RANGE, INTERACTION_RANGE);
    body.setOffset(
      -(INTERACTION_RANGE - this.width) / 2,
      -(INTERACTION_RANGE - this.height) / 2,
    );
  }
}
