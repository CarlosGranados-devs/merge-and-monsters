import { describe, expect, it, vi } from 'vitest';
import { useGameStore } from '../store/useGameStore';
import { GameLoop, advanceAnimation, applyCombatEvent, eventTypeToSfxType } from './GameLoop';
import {
  ATTACK_FRAMES,
  COLORS,
  FLOATING_NUMBER_LIFETIME,
  PARTICLE_COUNT,
  PARTICLE_LIFETIME,
  SHAKE_INTENSITY,
  createAnimationState,
} from './Renderer';

const WIDTH = 800;
const HEIGHT = 450;

function createMockContext() {
  const calls: string[] = [];
  const record =
    (method: string) =>
    (..._args: unknown[]) => {
      calls.push(method);
    };

  return {
    calls,
    ctx: {
      save: record('save'),
      restore: record('restore'),
      translate: record('translate'),
      fillRect: record('fillRect'),
      strokeRect: record('strokeRect'),
      beginPath: record('beginPath'),
      closePath: record('closePath'),
      ellipse: record('ellipse'),
      arc: record('arc'),
      fill: record('fill'),
      stroke: record('stroke'),
      moveTo: record('moveTo'),
      lineTo: record('lineTo'),
      fillText: record('fillText'),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: '',
      textBaseline: '',
      globalAlpha: 1,
    } as unknown as CanvasRenderingContext2D,
  };
}

describe('GameLoop animation', () => {
  it('reacts to a hero attack with a gold damage number and particles', () => {
    const anim = createAnimationState();

    applyCombatEvent(anim, { type: 'heroAttack', damage: 20, timestamp: 0 }, WIDTH, HEIGHT);

    expect(anim.heroAttacking).toBe(true);
    expect(anim.heroAttackTick).toBe(0);
    expect(anim.shakeIntensity).toBe(0);
    expect(anim.particles).toHaveLength(PARTICLE_COUNT);
    expect(anim.floatingNumbers).toHaveLength(1);
    expect(anim.floatingNumbers[0]?.text).toBe('-20');
    expect(anim.floatingNumbers[0]?.color).toBe(COLORS.gold);
  });

  it('shakes the screen only on critical damage', () => {
    const anim = createAnimationState();

    applyCombatEvent(anim, { type: 'heroAttack', damage: 50, timestamp: 0 }, WIDTH, HEIGHT);

    expect(anim.shakeIntensity).toBe(SHAKE_INTENSITY);
  });

  it('reacts to a monster attack with a red number above the hero', () => {
    const anim = createAnimationState();

    applyCombatEvent(anim, { type: 'monsterAttack', damage: 12, timestamp: 0 }, WIDTH, HEIGHT);

    expect(anim.monsterAttacking).toBe(true);
    expect(anim.floatingNumbers[0]?.color).toBe(COLORS.danger);
    expect(anim.floatingNumbers[0]?.text).toBe('-12');
  });

  it('shows XP gains and level ups as floating text', () => {
    const anim = createAnimationState();

    applyCombatEvent(anim, { type: 'xpGain', xp: 59, timestamp: 0 }, WIDTH, HEIGHT);
    applyCombatEvent(anim, { type: 'levelUp', level: 3, timestamp: 0 }, WIDTH, HEIGHT);

    expect(anim.floatingNumbers.map((number) => number.text)).toEqual(['+59 XP', 'LVL 3']);
  });

  it('bursts particles when a monster is defeated', () => {
    const anim = createAnimationState();

    applyCombatEvent(anim, { type: 'monsterDefeated', gold: 13, timestamp: 0 }, WIDTH, HEIGHT);

    expect(anim.particles.length).toBeGreaterThan(PARTICLE_COUNT);
  });

  it('advances attack, shake, and floating number timers', () => {
    const anim = createAnimationState();
    applyCombatEvent(anim, { type: 'heroAttack', damage: 60, timestamp: 0 }, WIDTH, HEIGHT);

    for (let frame = 0; frame < ATTACK_FRAMES; frame += 1) {
      advanceAnimation(anim);
    }

    expect(anim.heroAttacking).toBe(false);
    expect(anim.heroAttackTick).toBe(0);
    expect(anim.shakeIntensity).toBeLessThan(SHAKE_INTENSITY);
    expect(anim.shakeIntensity).toBeGreaterThan(0);
    expect(anim.floatingNumbers[0]?.life).toBe(FLOATING_NUMBER_LIFETIME - ATTACK_FRAMES);
  });

  it('expires floating numbers and particles after their lifetime', () => {
    const anim = createAnimationState();
    applyCombatEvent(anim, { type: 'heroAttack', damage: 10, timestamp: 0 }, WIDTH, HEIGHT);

    for (let frame = 0; frame < PARTICLE_LIFETIME; frame += 1) {
      advanceAnimation(anim);
    }
    expect(anim.particles).toHaveLength(0);

    for (let frame = 0; frame < FLOATING_NUMBER_LIFETIME; frame += 1) {
      advanceAnimation(anim);
    }
    expect(anim.floatingNumbers).toHaveLength(0);
    expect(anim.shakeIntensity).toBe(0);
  });
});

describe('GameLoop lifecycle', () => {
  it('draws one frame per animation callback and stops cleanly', () => {
    const frames: FrameRequestCallback[] = [];
    const cancel = vi.fn();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', cancel);

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const { calls, ctx } = createMockContext();
    vi.spyOn(canvas, 'getContext').mockReturnValue(ctx);

    GameLoop.start(canvas);
    expect(frames).toHaveLength(1);

    frames.shift()?.(0);
    expect(calls.length).toBeGreaterThan(10);
    expect(frames).toHaveLength(1);

    GameLoop.stop();
    expect(cancel).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('does not draw when the canvas has no 2D context', () => {
    vi.stubGlobal('requestAnimationFrame', vi.fn());
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getContext').mockReturnValue(null);

    GameLoop.start(canvas);
    GameLoop.stop();

    vi.unstubAllGlobals();
  });

  it('clears the store attack flag once the attack animation ends', () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const { ctx } = createMockContext();
    vi.spyOn(canvas, 'getContext').mockReturnValue(ctx);

    useGameStore.setState({
      attacking: true,
      pendingEvents: [{ type: 'heroAttack', damage: 12, timestamp: 0 }],
    });

    GameLoop.start(canvas);
    expect(useGameStore.getState().attacking).toBe(true);

    for (let frame = 0; frame < ATTACK_FRAMES; frame += 1) {
      frames.shift()?.(0);
    }

    expect(useGameStore.getState().attacking).toBe(false);
    GameLoop.stop();
    vi.unstubAllGlobals();
  });
});

describe('eventTypeToSfxType', () => {
  it('maps attacks to their SFX and critical hits to crit', () => {
    expect(eventTypeToSfxType({ type: 'heroAttack', damage: 20, timestamp: 0 })).toBe('attack');
    expect(eventTypeToSfxType({ type: 'heroAttack', damage: 50, timestamp: 0 })).toBe('crit');
    expect(eventTypeToSfxType({ type: 'monsterAttack', damage: 10, timestamp: 0 })).toBe(
      'monsterHit'
    );
  });

  it('maps defeats and level ups', () => {
    expect(eventTypeToSfxType({ type: 'monsterDefeated', gold: 13, timestamp: 0 })).toBe(
      'monsterSlain'
    );
    expect(eventTypeToSfxType({ type: 'levelUp', level: 3, timestamp: 0 })).toBe('levelUp');
  });

  it('keeps XP gains silent', () => {
    expect(eventTypeToSfxType({ type: 'xpGain', xp: 59, timestamp: 0 })).toBeNull();
  });
});
