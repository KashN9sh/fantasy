import Phaser from 'phaser';
import { SCENE_KEYS } from '../config';
import { RitualEngine, RitualStep } from '../systems/RitualEngine';
import { getRitual } from '../data/rituals';

interface RitualSceneData {
  ritualId: string;
  returnScene: string;
}

export class RitualScene extends Phaser.Scene {
  private engine = new RitualEngine();
  private overlay!: HTMLDivElement;
  private container!: HTMLDivElement;
  private returnScene: string = SCENE_KEYS.WORLD;

  constructor() {
    super(SCENE_KEYS.RITUAL);
  }

  init(data: RitualSceneData): void {
    this.returnScene = data.returnScene;
    const ritual = getRitual(data.ritualId);
    if (ritual) {
      this.engine.load(ritual);
    }
  }

  create(): void {
    this.overlay = document.getElementById('ui-overlay') as HTMLDivElement;
    this.overlay.classList.add('active');
    this.overlay.innerHTML = '';

    this.container = document.createElement('div');
    this.container.className = 'ritual-overlay';
    this.overlay.appendChild(this.container);

    const step = this.engine.getCurrentStep();
    if (step) {
      this.renderStep(step);
    } else {
      this.close();
    }
  }

  private renderStep(step: RitualStep): void {
    this.container.innerHTML = '';

    const prompt = document.createElement('div');
    prompt.className = 'ritual-prompt';

    const textEl = document.createElement('div');
    textEl.textContent = step.text;
    prompt.appendChild(textEl);

    if (step.action === 'wait' && step.duration) {
      const instr = document.createElement('div');
      instr.className = 'instruction';
      instr.textContent = '...';
      prompt.appendChild(instr);

      this.container.appendChild(prompt);

      this.time.delayedCall(step.duration, () => {
        const next = this.engine.advanceStep();
        if (next) {
          this.renderStep(next);
        } else {
          this.showComplete();
        }
      });
    } else if (step.action === 'press-e') {
      const instr = document.createElement('div');
      instr.className = 'instruction';
      instr.textContent = '[ E ]';
      prompt.appendChild(instr);

      this.container.appendChild(prompt);

      const eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      eKey.once('down', () => {
        const next = this.engine.advanceStep();
        if (next) {
          this.renderStep(next);
        } else {
          this.showComplete();
        }
      });
    } else if (step.action === 'hold-space') {
      const instr = document.createElement('div');
      instr.className = 'instruction';
      instr.textContent = '[ удерживай пробел ]';
      prompt.appendChild(instr);

      this.container.appendChild(prompt);

      const duration = step.duration ?? 2000;
      let held = 0;
      const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

      const timer = this.time.addEvent({
        delay: 50,
        loop: true,
        callback: () => {
          if (spaceKey.isDown) {
            held += 50;
            if (held >= duration) {
              timer.destroy();
              const next = this.engine.advanceStep();
              if (next) this.renderStep(next);
              else this.showComplete();
            }
          }
        },
      });
    }
  }

  private showComplete(): void {
    this.container.innerHTML = '';
    const prompt = document.createElement('div');
    prompt.className = 'ritual-prompt';

    const name = this.engine.getRitualName();
    const textEl = document.createElement('div');
    textEl.textContent = name ? `${name} — завершено` : 'Завершено';
    prompt.appendChild(textEl);

    const instr = document.createElement('div');
    instr.className = 'instruction';
    instr.textContent = '[ E — вернуться ]';
    prompt.appendChild(instr);

    this.container.appendChild(prompt);

    const eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    eKey.once('down', () => this.close());
  }

  private close(): void {
    this.overlay.classList.remove('active');
    this.overlay.innerHTML = '';
    this.scene.resume(this.returnScene);
    this.scene.stop();
  }
}
