import Phaser from 'phaser';
import { SCENE_KEYS } from '../config';
import { GameState } from '../systems/GameState';
import { QuestManager } from '../systems/QuestManager';
import { AudioManager } from '../systems/AudioManager';

interface DiarySceneData {
  returnScene: string;
}

export class DiaryScene extends Phaser.Scene {
  private overlay!: HTMLDivElement;
  private returnScene: string = SCENE_KEYS.WORLD;

  constructor() {
    super(SCENE_KEYS.DIARY);
  }

  init(data: DiarySceneData): void {
    this.returnScene = data.returnScene;
  }

  create(): void {
    AudioManager.playUiSound('ui-open');
    this.overlay = document.getElementById('ui-overlay') as HTMLDivElement;
    this.overlay.classList.add('active');
    this.overlay.innerHTML = '';

    const panel = document.createElement('div');
    panel.className = 'diary-panel';

    const title = document.createElement('h2');
    title.textContent = 'Дневник тропы';
    panel.appendChild(title);

    const state = GameState.get();

    const stats = document.createElement('div');
    stats.className = 'diary-entry';
    stats.innerHTML = `
      <div class="entry-title">Внутренний компас</div>
      <div>Принятие: ${state.acceptance} · Забота: ${state.care}</div>
      <div>Самопознание: ${state.selfKnowledge} · Доверие: ${state.trust}</div>
    `;
    panel.appendChild(stats);

    const active = QuestManager.getActiveQuests();
    if (active.length > 0) {
      const qSection = document.createElement('div');
      qSection.className = 'diary-entry';
      const qTitle = document.createElement('div');
      qTitle.className = 'entry-title';
      qTitle.textContent = 'Текущие задачи';
      qSection.appendChild(qTitle);
      active.forEach(q => {
        const line = document.createElement('div');
        const desc = QuestManager.getPhaseDescription(q.id);
        line.textContent = `· ${q.title}${desc ? ' — ' + desc : ''}`;
        qSection.appendChild(line);
      });
      panel.appendChild(qSection);
    }

    if (state.inventory.length > 0) {
      const inv = document.createElement('div');
      inv.className = 'diary-entry';
      const invTitle = document.createElement('div');
      invTitle.className = 'entry-title';
      invTitle.textContent = 'Находки';
      inv.appendChild(invTitle);
      const invList = document.createElement('div');
      invList.textContent = state.inventory.join(', ');
      inv.appendChild(invList);
      panel.appendChild(inv);
    }

    const entries = [...state.diaryEntries].reverse();
    if (entries.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'diary-entry';
      empty.textContent = 'Пока пусто. Иди по тропе — записи появятся.';
      panel.appendChild(empty);
    } else {
      entries.forEach(entry => {
        const el = document.createElement('div');
        el.className = 'diary-entry';
        const t = document.createElement('div');
        t.className = 'entry-title';
        t.textContent = entry.title;
        el.appendChild(t);
        const txt = document.createElement('div');
        txt.textContent = entry.text;
        el.appendChild(txt);
        panel.appendChild(el);
      });
    }

    const hint = document.createElement('div');
    hint.style.cssText = 'text-align:center;color:#605040;font-size:11px;margin-top:16px;';
    hint.textContent = '[ TAB — закрыть ]';
    panel.appendChild(hint);

    this.overlay.appendChild(panel);

    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TAB).once('down', () => {
      this.close();
    });
    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).once('down', () => {
      this.close();
    });
  }

  private close(): void {
    AudioManager.playUiSound('ui-close');
    this.overlay.classList.remove('active');
    this.overlay.innerHTML = '';
    this.scene.resume(this.returnScene);
    this.scene.stop();
  }
}
