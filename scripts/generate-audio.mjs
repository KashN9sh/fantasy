import { writeFileSync } from 'fs';

function createWav(samples, sampleRate = 44100) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  return buffer;
}

function envelope(t, attack, decay, sustain, release, total) {
  if (t < attack) return t / attack;
  if (t < attack + decay) return 1 - (1 - sustain) * ((t - attack) / decay);
  if (t < total - release) return sustain;
  return sustain * ((total - t) / release);
}

function generateUiOpen(rate = 44100) {
  const dur = 0.15;
  const samples = new Float64Array(Math.floor(dur * rate));
  for (let i = 0; i < samples.length; i++) {
    const t = i / rate;
    const freq = 800 + t * 2000;
    const env = envelope(t, 0.01, 0.05, 0.3, 0.06, dur);
    samples[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.4;
  }
  return createWav(samples, rate);
}

function generateUiSelect(rate = 44100) {
  const dur = 0.1;
  const samples = new Float64Array(Math.floor(dur * rate));
  for (let i = 0; i < samples.length; i++) {
    const t = i / rate;
    const freq = 1200;
    const env = envelope(t, 0.005, 0.03, 0.2, 0.05, dur);
    samples[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.35;
  }
  return createWav(samples, rate);
}

function generateUiClose(rate = 44100) {
  const dur = 0.12;
  const samples = new Float64Array(Math.floor(dur * rate));
  for (let i = 0; i < samples.length; i++) {
    const t = i / rate;
    const freq = 1400 - t * 3000;
    const env = envelope(t, 0.01, 0.04, 0.3, 0.05, dur);
    samples[i] = Math.sin(2 * Math.PI * Math.max(200, freq) * t) * env * 0.35;
  }
  return createWav(samples, rate);
}

function generateBreathLoop(rate = 44100) {
  const dur = 4.0;
  const samples = new Float64Array(Math.floor(dur * rate));
  for (let i = 0; i < samples.length; i++) {
    const t = i / rate;
    const breathCycle = Math.sin(2 * Math.PI * t / 4);
    const noise = (Math.random() * 2 - 1);
    const filtered = noise * (0.1 + 0.15 * Math.max(0, breathCycle));
    samples[i] = filtered * 0.5;
  }
  // smooth
  for (let i = 1; i < samples.length; i++) {
    samples[i] = samples[i] * 0.3 + samples[i - 1] * 0.7;
  }
  return createWav(samples, rate);
}

function generateFireLoop(rate = 44100) {
  const dur = 3.0;
  const samples = new Float64Array(Math.floor(dur * rate));
  for (let i = 0; i < samples.length; i++) {
    const t = i / rate;
    const noise = Math.random() * 2 - 1;
    const crackle = Math.random() < 0.002 ? (Math.random() - 0.5) * 0.8 : 0;
    samples[i] = noise * 0.08 + crackle;
  }
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 1; i < samples.length; i++) {
      samples[i] = samples[i] * 0.2 + samples[i - 1] * 0.8;
    }
  }
  return createWav(samples, rate);
}

function generateWindLoop(rate = 44100) {
  const dur = 5.0;
  const samples = new Float64Array(Math.floor(dur * rate));
  for (let i = 0; i < samples.length; i++) {
    const t = i / rate;
    const mod = 0.5 + 0.5 * Math.sin(2 * Math.PI * t * 0.3);
    samples[i] = (Math.random() * 2 - 1) * mod * 0.15;
  }
  for (let pass = 0; pass < 5; pass++) {
    for (let i = 1; i < samples.length; i++) {
      samples[i] = samples[i] * 0.15 + samples[i - 1] * 0.85;
    }
  }
  return createWav(samples, rate);
}

const base = 'public/assets/audio';
writeFileSync(`${base}/ui/ui-open.wav`, generateUiOpen());
writeFileSync(`${base}/ui/ui-select.wav`, generateUiSelect());
writeFileSync(`${base}/ui/ui-close.wav`, generateUiClose());
writeFileSync(`${base}/ritual/ritual-breath.wav`, generateBreathLoop());
writeFileSync(`${base}/ritual/ritual-fire.wav`, generateFireLoop());
writeFileSync(`${base}/ritual/ritual-wind.wav`, generateWindLoop());

console.log('Generated: ui-open, ui-select, ui-close, ritual-breath, ritual-fire, ritual-wind');
