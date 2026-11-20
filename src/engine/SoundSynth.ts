import { useGameStore } from '../store/useGameStore';
import type { SfxType } from '../types';

/**
 * SoundSynth produces every in-game SFX from oscillators at runtime.
 * No audio files are loaded or bundled (see docs/adr/v0.1.0/04-audio-web-audio-api.md).
 */

const ATTACK_TIME = 0.01;
const PEAK_GAIN = 0.3;
const STOP_TAIL = 0.02;

interface FrequencyPoint {
  /** Offset from the start of the sound, in seconds. */
  at: number;
  /** Target frequency in hertz. */
  frequency: number;
}

interface SfxSpec {
  waveform: OscillatorType;
  frequencies: FrequencyPoint[];
  /** Total duration in seconds. */
  duration: number;
}

const SFX_LIBRARY: Record<SfxType, SfxSpec> = {
  attack: {
    waveform: 'square',
    frequencies: [
      { at: 0, frequency: 220 },
      { at: 0.12, frequency: 110 },
    ],
    duration: 0.12,
  },
  crit: {
    waveform: 'square',
    frequencies: [
      { at: 0, frequency: 440 },
      { at: 0.125, frequency: 880 },
      { at: 0.25, frequency: 220 },
    ],
    duration: 0.25,
  },
  monsterHit: {
    waveform: 'triangle',
    frequencies: [
      { at: 0, frequency: 180 },
      { at: 0.1, frequency: 90 },
    ],
    duration: 0.1,
  },
  levelUp: {
    waveform: 'square',
    frequencies: [
      { at: 0, frequency: 220 },
      { at: 0.166, frequency: 330 },
      { at: 0.333, frequency: 440 },
      { at: 0.5, frequency: 660 },
    ],
    duration: 0.5,
  },
  monsterSlain: {
    waveform: 'square',
    frequencies: [
      { at: 0, frequency: 440 },
      { at: 0.133, frequency: 330 },
      { at: 0.266, frequency: 220 },
      { at: 0.4, frequency: 110 },
    ],
    duration: 0.4,
  },
  gold: {
    waveform: 'triangle',
    frequencies: [
      { at: 0, frequency: 880 },
      { at: 0.08, frequency: 1100 },
    ],
    duration: 0.08,
  },
  uiClick: {
    waveform: 'square',
    frequencies: [{ at: 0, frequency: 440 }],
    duration: 0.05,
  },
};

type AudioContextConstructor = new () => AudioContext;

let audioContext: AudioContext | null = null;

function resolveAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === 'undefined') return null;
  const scope = window as unknown as {
    AudioContext?: AudioContextConstructor;
    webkitAudioContext?: AudioContextConstructor;
  };
  return scope.AudioContext ?? scope.webkitAudioContext ?? null;
}

/** Create the shared AudioContext on first use (browser autoplay policy). */
function getAudioContext(): AudioContext | null {
  if (audioContext) return audioContext;
  const Constructor = resolveAudioContextConstructor();
  if (!Constructor) return null;
  audioContext = new Constructor();
  return audioContext;
}

function scheduleFrequency(
  oscillator: OscillatorNode,
  frequencies: FrequencyPoint[],
  startAt: number
): void {
  const first = frequencies[0];
  if (!first) return;
  oscillator.frequency.setValueAtTime(first.frequency, startAt);
  for (let index = 1; index < frequencies.length; index += 1) {
    const point = frequencies[index];
    if (!point) continue;
    oscillator.frequency.linearRampToValueAtTime(point.frequency, startAt + point.at);
  }
}

function scheduleEnvelope(gain: GainNode, startAt: number, duration: number): void {
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(PEAK_GAIN, startAt + ATTACK_TIME);
  gain.gain.linearRampToValueAtTime(0, startAt + duration);
}

function play(type: SfxType): void {
  if (isMuted()) return;

  const context = getAudioContext();
  if (!context) return;

  if (context.state === 'suspended') {
    void context.resume();
  }

  const spec = SFX_LIBRARY[type];
  const now = context.currentTime;

  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = spec.waveform;
  scheduleFrequency(oscillator, spec.frequencies, now);
  scheduleEnvelope(gain, now, spec.duration);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
  };

  oscillator.start(now);
  oscillator.stop(now + spec.duration + STOP_TAIL);
}

function setMuted(muted: boolean): void {
  useGameStore.getState().setMuted(muted);
}

function isMuted(): boolean {
  return useGameStore.getState().muted;
}

export const SoundSynth = Object.freeze({ play, setMuted, isMuted });
