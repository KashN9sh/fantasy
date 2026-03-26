import Phaser from 'phaser';
import { SCENE_KEYS, CANVAS_W, CANVAS_H } from '../config';
import { GameState } from '../systems/GameState';
import { SaveManager } from '../systems/SaveManager';

interface Ending {
  title: string;
  text: string;
}

function determineEnding(): Ending {
  const s = GameState.get();

  if (s.flags['ending-acceptance']) {
    return {
      title: 'Дыхание',
      text: 'Тревога осталась. Но ты научился с ней дышать.\nНе победа и не проигрыш — просто жизнь.\nТропа не кончается. Она становится тише.',
    };
  }

  if (s.flags['ending-connection']) {
    return {
      title: 'Тропа — это мы',
      text: 'Ты не один. Тропа — это все, кто прошёл.\nВера, Лин, Ира, Отшельник — часть тебя теперь.\nТревога тише, когда рядом тёплые люди.',
    };
  }

  if (s.flags['ending-seeking']) {
    return {
      title: 'Вопрос без ответа',
      text: 'Ответа нет. Но стоять и спрашивать — уже достаточно.\nТропа не дала готовых решений.\nОна дала право не знать — и всё равно идти.',
    };
  }

  if (s.care >= 60 && s.acceptance >= 40) {
    return {
      title: 'Сад внутри',
      text: 'Ты заботился. О цветах, о людях, о себе.\nВнутри выросло что-то тёплое.\nНе ответ — а пространство, в котором можно быть.',
    };
  }

  if (s.selfKnowledge >= 60) {
    return {
      title: 'Зеркало',
      text: 'Ты увидел себя — не идеального, настоящего.\nТревога стала понятнее. Не тише — понятнее.\nИ в этом «понятнее» — начало покоя.',
    };
  }

  if (s.trust >= 50) {
    return {
      title: 'Не один',
      text: 'Ты научился доверять. Не слепо — бережно.\nВ чужих руках оказалась часть груза.\nИ стало легче дышать.',
    };
  }

  return {
    title: 'Тропа продолжается',
    text: 'Ты прошёл тропу. Не всю — но свою часть.\nТревога никуда не делась. Но ты — здесь.\nА это уже много. Даже если так не кажется.',
  };
}

export class EndingScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.ENDING);
  }

  create(): void {
    const ending = determineEnding();
    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2;

    this.cameras.main.setBackgroundColor('#1a1a2e');
    this.cameras.main.fadeIn(1500);

    const titleText = this.add.text(cx, cy - 30, ending.title, {
      fontSize: '10px',
      color: '#c8a870',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setAlpha(0);

    const bodyText = this.add.text(cx, cy + 5, ending.text, {
      fontSize: '6px',
      color: '#a09080',
      fontFamily: 'monospace',
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5).setAlpha(0);

    const thankYou = this.add.text(cx, cy + 55, 'Спасибо, что прошёл тропу.', {
      fontSize: '5px',
      color: '#605848',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setAlpha(0);

    const prompt = this.add.text(cx, cy + 70, '[ любая клавиша — в начало ]', {
      fontSize: '5px',
      color: '#403830',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: titleText, alpha: 1, duration: 2000, delay: 500 });
    this.tweens.add({ targets: bodyText, alpha: 1, duration: 2000, delay: 1500 });
    this.tweens.add({ targets: thankYou, alpha: 0.7, duration: 1500, delay: 3500 });
    this.tweens.add({
      targets: prompt,
      alpha: { from: 0, to: 0.5 },
      duration: 800,
      delay: 5000,
      yoyo: true,
      repeat: -1,
      hold: 1200,
    });

    this.time.delayedCall(5000, () => {
      this.input.keyboard!.once('keydown', () => {
        SaveManager.deleteSave();
        this.cameras.main.fadeOut(1000, 26, 26, 46);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENE_KEYS.TITLE);
        });
      });
    });

    const s = GameState.get();
    const statsText = [
      `Принятие: ${s.acceptance}`,
      `Забота: ${s.care}`,
      `Самопознание: ${s.selfKnowledge}`,
      `Доверие: ${s.trust}`,
      `Записей в дневнике: ${s.diaryEntries.length}`,
    ].join(' · ');

    this.add.text(cx, CANVAS_H - 8, statsText, {
      fontSize: '4px',
      color: '#403830',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setAlpha(0.5);
  }
}
