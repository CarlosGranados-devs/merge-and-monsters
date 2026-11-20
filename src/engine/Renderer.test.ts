import { describe, expect, it } from 'vitest';
import type { HeroState, MonsterEntity } from '../types';
import { COLORS, computeLayout, createAnimationState, drawScene, spriteScale } from './Renderer';

interface RecordedCall {
  method: string;
  args: unknown[];
}

function createMockContext() {
  const calls: RecordedCall[] = [];
  const record =
    (method: string) =>
    (...args: unknown[]) => {
      calls.push({ method, args });
    };

  const context = {
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
  };

  return { ctx: context as unknown as CanvasRenderingContext2D, calls };
}

const hero: HeroState = {
  name: 'Adventurer',
  xp: 120,
  level: 2,
  hp: 50,
  maxHp: 100,
  gold: 15,
  weaponClass: 'strictBlade',
};

const monster: MonsterEntity = {
  id: 104,
  archetype: 'mysteryCrawler',
  name: 'Mystery Crawler',
  hp: 375,
  maxHp: 750,
  goldReward: 13,
  issueNumber: 104,
};

describe('Renderer', () => {
  it('computes a bounded sprite scale and centered layout', () => {
    expect(spriteScale(100)).toBe(2);
    expect(spriteScale(450)).toBe(2);
    expect(spriteScale(720)).toBe(4);
    expect(spriteScale(4000)).toBe(4);

    const layout = computeLayout(800, 450);
    expect(layout.scale).toBe(2);
    expect(layout.hero.x).toBe(240);
    expect(layout.monster.x).toBe(560);
    expect(layout.hero.y).toBe(324);
  });

  it('paints the dungeon floor and walls', () => {
    const { ctx, calls } = createMockContext();

    drawScene(ctx, 800, 450, { hero, activeMonster: null }, createAnimationState());

    const fills = calls.filter((call) => call.method === 'fillRect');
    expect(fills.length).toBeGreaterThan(20);
    expect(calls.some((call) => call.method === 'save')).toBe(true);
    expect(calls.some((call) => call.method === 'restore')).toBe(true);
  });

  it('draws the hero HP bar with the current ratio', () => {
    const { ctx, calls } = createMockContext();

    drawScene(ctx, 800, 450, { hero, activeMonster: null }, createAnimationState());

    const bar = calls.find(
      (call) =>
        call.method === 'fillRect' &&
        call.args[2] === 56 &&
        call.args[3] === 12 &&
        typeof call.args[0] === 'number'
    );
    expect(bar).toBeDefined();
    expect(calls.filter((call) => call.method === 'strokeRect')).toHaveLength(1);
  });

  it('draws the monster sprite and its HP bar when a monster is active', () => {
    const { ctx, calls } = createMockContext();

    drawScene(ctx, 800, 450, { hero, activeMonster: monster }, createAnimationState());

    expect(calls.filter((call) => call.method === 'strokeRect')).toHaveLength(2);
    expect(calls.filter((call) => call.method === 'moveTo').length).toBeGreaterThan(0);
  });

  it('applies the screen shake as a canvas translation', () => {
    const { ctx, calls } = createMockContext();
    const anim = createAnimationState();
    anim.shakeIntensity = 8;

    drawScene(ctx, 800, 450, { hero, activeMonster: monster }, anim);

    const translate = calls.find((call) => call.method === 'translate');
    expect(translate).toBeDefined();
    expect(Math.abs(Number(translate?.args[0]))).toBeLessThanOrEqual(8);
    expect(Math.abs(Number(translate?.args[1]))).toBeLessThanOrEqual(8);
  });

  it('renders floating numbers with fading alpha', () => {
    const { ctx, calls } = createMockContext();
    const anim = createAnimationState();
    anim.floatingNumbers.push({
      x: 560,
      y: 300,
      text: '-120',
      color: COLORS.gold,
      life: 20,
    });

    drawScene(ctx, 800, 450, { hero, activeMonster: monster }, anim);

    const text = calls.find((call) => call.method === 'fillText');
    expect(text?.args[0]).toBe('-120');
    expect(ctx.globalAlpha).toBe(1);
  });
});
