import Phaser from 'phaser';

export class InteractionPrompt extends Phaser.GameObjects.Text {
  private target: Phaser.GameObjects.Sprite | null = null;
  private floatOffset = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'E', {
      fontSize: '7px',
      color: '#e8dcc8',
      fontFamily: 'monospace',
      backgroundColor: '#3a3020',
      padding: { x: 3, y: 1 },
    });
    this.setOrigin(0.5);
    this.setVisible(false);
    this.setDepth(100);
    scene.add.existing(this);
  }

  show(target: Phaser.GameObjects.Sprite): void {
    this.target = target;
    this.setVisible(true);
  }

  hide(): void {
    this.target = null;
    this.setVisible(false);
  }

  update(_time: number, delta: number): void {
    if (!this.target || !this.visible) return;
    this.floatOffset += delta * 0.003;
    this.x = this.target.x;
    this.y = this.target.y - this.target.displayHeight / 2 - 8 + Math.sin(this.floatOffset) * 2;
  }
}
