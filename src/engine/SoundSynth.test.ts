import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SfxType } from '../types';

class FakeAudioParam {
  events: Array<{ kind: 'set' | 'ramp'; value: number; time: number }> = [];

  setValueAtTime(value: number, time: number): void {
    this.events.push({ kind: 'set', value, time });
  }

  linearRampToValueAtTime(value: number, time: number): void {
    this.events.push({ kind: 'ramp', value, time });
  }
}

class FakeOscillator {
  type: OscillatorType = 'sine';
  frequency = new FakeAudioParam();
  onended: (() => void) | null = null;
  startedAt: number | null = null;
  stoppedAt: number | null = null;
  disconnected = false;
  connections: unknown[] = [];

  connect(node: unknown): void {
    this.connections.push(node);
  }

  disconnect(): void {
    this.disconnected = true;
  }

  start(time: number): void {
    this.startedAt = time;
  }

  stop(time: number): void {
    this.stoppedAt = time;
  }
}

class FakeGain {
  gain = new FakeAudioParam();
  disconnected = false;
  connections: unknown[] = [];

  connect(node: unknown): void {
    this.connections.push(node);
  }

  disconnect(): void {
    this.disconnected = true;
  }
}

class FakeAudioContext {
  state: AudioContextState = 'running';
  currentTime = 0;
  destination = {};
  oscillators: FakeOscillator[] = [];
  gains: FakeGain[] = [];
  resumeCalls = 0;

  resume = async (): Promise<void> => {
    this.resumeCalls += 1;
    this.state = 'running';
  };

  createOscillator(): FakeOscillator {
    const oscillator = new FakeOscillator();
    this.oscillators.push(oscillator);
    return oscillator;
  }

  createGain(): FakeGain {
    const gain = new FakeGain();
    this.gains.push(gain);
    return gain;
  }
}

interface LoadedSynth {
  play: (type: SfxType) => void;
  setMuted: (muted: boolean) => void;
  isMuted: () => boolean;
  setMutedStore: (muted: boolean) => void;
  contexts: FakeAudioContext[];
}

let createdContexts: FakeAudioContext[] = [];

async function loadSynth(options: { suspended?: boolean } = {}): Promise<LoadedSynth> {
  vi.resetModules();
  localStorage.clear();
  sessionStorage.clear();
  createdContexts = [];

  class ConfiguredContext extends FakeAudioContext {
    constructor() {
      super();
      if (options.suspended) this.state = 'suspended';
      createdContexts.push(this);
    }
  }

  Object.defineProperty(window, 'AudioContext', {
    configurable: true,
    writable: true,
    value: ConfiguredContext,
  });

  const storeModule = await import('../store/useGameStore');
  const synthModule = await import('./SoundSynth');

  return {
    play: synthModule.SoundSynth.play,
    setMuted: synthModule.SoundSynth.setMuted,
    isMuted: synthModule.SoundSynth.isMuted,
    setMutedStore: (muted: boolean) => storeModule.useGameStore.getState().setMuted(muted),
    contexts: createdContexts,
  };
}

afterEach(() => {
  Reflect.deleteProperty(window, 'AudioContext');
  vi.restoreAllMocks();
});

describe('SoundSynth', () => {
  it('does not create an AudioContext while muted', async () => {
    const synth = await loadSynth();
    synth.setMutedStore(true);

    synth.play('attack');

    expect(synth.contexts).toHaveLength(0);
  });

  it('creates the AudioContext lazily on the first play and reuses it', async () => {
    const synth = await loadSynth();

    expect(synth.contexts).toHaveLength(0);

    synth.play('attack');
    expect(synth.contexts).toHaveLength(1);

    synth.play('uiClick');
    expect(synth.contexts).toHaveLength(1);
  });

  it('resumes a suspended context before scheduling nodes', async () => {
    const synth = await loadSynth({ suspended: true });

    synth.play('attack');

    const context = synth.contexts[0];
    expect(context?.resumeCalls).toBe(1);
    expect(context?.oscillators).toHaveLength(1);
  });

  it('schedules the frequency sweep and gain envelope for a critical hit', async () => {
    const synth = await loadSynth();

    synth.play('crit');

    const context = synth.contexts[0];
    const oscillator = context?.oscillators[0];
    const gain = context?.gains[0];

    expect(oscillator?.type).toBe('square');
    expect(oscillator?.frequency.events.map((event) => event.value)).toEqual([440, 880, 220]);
    expect(gain?.gain.events[0]).toMatchObject({ kind: 'set', value: 0 });
    expect(gain?.gain.events[1]).toMatchObject({ kind: 'ramp', value: 0.3 });
    expect(gain?.gain.events[2]).toMatchObject({ kind: 'ramp', value: 0, time: 0.25 });
  });

  it('disconnects the oscillator and gain when the sound ends', async () => {
    const synth = await loadSynth();

    synth.play('attack');

    const context = synth.contexts[0];
    const oscillator = context?.oscillators[0];
    const gain = context?.gains[0];

    oscillator?.onended?.();

    expect(oscillator?.disconnected).toBe(true);
    expect(gain?.disconnected).toBe(true);
  });

  it('setMuted updates the store and isMuted reads it back', async () => {
    const synth = await loadSynth();

    expect(synth.isMuted()).toBe(false);

    synth.setMuted(true);

    expect(synth.isMuted()).toBe(true);
  });

  it('plays every SFX type without throwing', async () => {
    const synth = await loadSynth();
    const types: SfxType[] = [
      'attack',
      'crit',
      'monsterHit',
      'levelUp',
      'monsterSlain',
      'gold',
      'uiClick',
    ];

    for (const type of types) {
      expect(() => synth.play(type)).not.toThrow();
    }

    expect(synth.contexts[0]?.oscillators).toHaveLength(types.length);
  });
});
