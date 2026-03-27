import Phaser from 'phaser';

const AMBIENCE_VOLUME = 0.35;
const UI_VOLUME = 0.5;
const RITUAL_VOLUME = 0.3;
const DEFAULT_FADE_MS = 800;

let scene: Phaser.Scene | null = null;
let currentAmbience: Phaser.Sound.BaseSound | null = null;
let currentAmbienceKey: string | null = null;
let currentRitual: Phaser.Sound.BaseSound | null = null;

function getSound(key: string): Phaser.Sound.WebAudioSound | null {
  if (!scene || !scene.cache.audio.exists(key)) return null;
  return scene.sound.add(key) as Phaser.Sound.WebAudioSound;
}

function fadeOut(
  sound: Phaser.Sound.BaseSound,
  duration: number,
  onComplete?: () => void,
): void {
  if (!scene) return;
  const webSound = sound as Phaser.Sound.WebAudioSound;
  scene.tweens.add({
    targets: webSound,
    volume: 0,
    duration,
    onComplete: () => {
      webSound.stop();
      webSound.destroy();
      onComplete?.();
    },
  });
}

function fadeIn(sound: Phaser.Sound.WebAudioSound, target: number, duration: number): void {
  if (!scene) return;
  sound.play({ loop: true, volume: 0 });
  scene.tweens.add({
    targets: sound,
    volume: target,
    duration,
  });
}

export const AudioManager = {
  init(s: Phaser.Scene): void {
    scene = s;
  },

  playAmbience(key: string, fadeDuration = DEFAULT_FADE_MS): void {
    if (currentAmbienceKey === key) return;
    if (currentAmbience) {
      fadeOut(currentAmbience, fadeDuration);
    }
    currentAmbienceKey = key;
    const snd = getSound(key);
    if (!snd) {
      currentAmbience = null;
      return;
    }
    currentAmbience = snd;
    fadeIn(snd, AMBIENCE_VOLUME, fadeDuration);
  },

  crossfadeTo(key: string, duration = DEFAULT_FADE_MS): void {
    if (currentAmbienceKey === key) return;

    const newSound = getSound(key);
    if (!newSound) {
      if (currentAmbience) fadeOut(currentAmbience, duration);
      currentAmbience = null;
      currentAmbienceKey = key;
      return;
    }

    if (currentAmbience) {
      fadeOut(currentAmbience, duration);
    }

    currentAmbienceKey = key;
    currentAmbience = newSound;
    fadeIn(newSound, AMBIENCE_VOLUME, duration);
  },

  stopAmbience(fadeDuration = 400): void {
    if (currentAmbience) {
      fadeOut(currentAmbience, fadeDuration);
      currentAmbience = null;
      currentAmbienceKey = null;
    }
  },

  playUiSound(key: string): void {
    if (!scene || !scene.cache.audio.exists(key)) return;
    scene.sound.play(key, { volume: UI_VOLUME });
  },

  playRitualLoop(key: string): void {
    this.stopRitualLoop(200);
    const snd = getSound(key);
    if (!snd) return;
    currentRitual = snd;
    fadeIn(snd, RITUAL_VOLUME, 400);
  },

  stopRitualLoop(fadeDuration = 400): void {
    if (currentRitual) {
      fadeOut(currentRitual, fadeDuration);
      currentRitual = null;
    }
  },

  isPlaying(): boolean {
    return currentAmbience !== null && (currentAmbience as Phaser.Sound.WebAudioSound).isPlaying;
  },
};
