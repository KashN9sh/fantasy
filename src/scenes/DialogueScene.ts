import Phaser from 'phaser';
import { SCENE_KEYS } from '../config';
import { DialogueEngine, DialogueNode } from '../systems/DialogueEngine';
import { getDialogue } from '../data/dialogues/index';
import { AudioManager } from '../systems/AudioManager';

interface DialogueSceneData {
  dialogueId?: string;
  examineText?: string;
  speakerName?: string;
  returnScene: string;
}

export class DialogueScene extends Phaser.Scene {
  private engine = new DialogueEngine();
  private overlay!: HTMLDivElement;
  private box!: HTMLDivElement;
  private returnScene: string = SCENE_KEYS.WORLD;
  private advanceKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super(SCENE_KEYS.DIALOGUE);
  }

  init(data: DialogueSceneData): void {
    this.returnScene = data.returnScene;

    if (data.examineText) {
      this.showExamine(data.speakerName ?? '', data.examineText);
      return;
    }

    if (data.dialogueId) {
      const tree = getDialogue(data.dialogueId);
      if (tree) {
        const node = this.engine.load(tree);
        if (node) {
          this.events.once('create', () => this.renderNode(node, data.speakerName));
        }
      } else {
        this.showExamine(data.speakerName ?? '', '...');
      }
    }
  }

  create(): void {
    this.overlay = document.getElementById('ui-overlay') as HTMLDivElement;
    this.overlay.classList.add('active');
    this.overlay.innerHTML = '';

    this.box = document.createElement('div');
    this.box.className = 'dialogue-box';
    this.overlay.appendChild(this.box);

    AudioManager.playUiSound('ui-open');
    this.advanceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    const node = this.engine.getCurrent();
    if (node) {
      this.renderNode(node);
    }
  }

  private showExamine(name: string, text: string): void {
    this.events.once('create', () => {
      this.box.innerHTML = '';
      if (name) {
        const sp = document.createElement('div');
        sp.className = 'speaker';
        sp.textContent = name;
        this.box.appendChild(sp);
      }
      const t = document.createElement('div');
      t.className = 'text';
      t.textContent = text;
      this.box.appendChild(t);

      const hint = document.createElement('div');
      hint.className = 'continue-hint';
      hint.textContent = '[ E — закрыть ]';
      this.box.appendChild(hint);

      this.advanceKey.once('down', () => this.closeDialogue());
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).once('down', () => this.closeDialogue());
    });
  }

  private renderNode(node: DialogueNode, overrideSpeaker?: string): void {
    this.box.innerHTML = '';

    const speaker = node.speaker ?? overrideSpeaker;
    if (speaker) {
      const sp = document.createElement('div');
      sp.className = 'speaker';
      sp.textContent = speaker;
      this.box.appendChild(sp);
    }

    const textEl = document.createElement('div');
    textEl.className = 'text';
    textEl.textContent = node.text;
    this.box.appendChild(textEl);

    if (node.choices && node.choices.length > 0) {
      const choicesEl = document.createElement('div');
      choicesEl.className = 'choices';
      node.choices.forEach((choice, i) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.text;
        btn.addEventListener('click', () => this.selectChoice(i));
        choicesEl.appendChild(btn);
      });
      this.box.appendChild(choicesEl);
    } else {
      const hint = document.createElement('div');
      hint.className = 'continue-hint';
      hint.textContent = '[ E — продолжить ]';
      this.box.appendChild(hint);

      this.advanceKey.once('down', () => this.advanceDialogue());
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).once('down', () => this.advanceDialogue());
    }
  }

  private selectChoice(index: number): void {
    AudioManager.playUiSound('ui-select');
    const next = this.engine.advance(index);
    if (next) {
      this.renderNode(next);
    } else {
      this.closeDialogue();
    }
  }

  private advanceDialogue(): void {
    const next = this.engine.advance();
    if (next) {
      this.renderNode(next);
    } else {
      this.closeDialogue();
    }
  }

  private closeDialogue(): void {
    AudioManager.playUiSound('ui-close');
    this.overlay.classList.remove('active');
    this.overlay.innerHTML = '';
    this.scene.resume(this.returnScene);
    this.scene.stop();
  }
}
