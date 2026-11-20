import { useGameStore } from '../store/useGameStore';
import type { CombatEvent, SfxType } from '../types';
import {
  ATTACK_FRAMES,
  type AnimationState,
  BOB_PERIOD,
  COLORS,
  CRIT_DAMAGE_THRESHOLD,
  FLOATING_NUMBER_LIFETIME,
  FLOATING_NUMBER_RISE,
  PARTICLE_COUNT,
  PARTICLE_LIFETIME,
  SHAKE_DECAY,
  SHAKE_INTENSITY,
  computeLayout,
  createAnimationState,
  drawScene,
} from './Renderer';
import { SoundSynth } from './SoundSynth';

let canvas: HTMLCanvasElement | null = null;
let context: CanvasRenderingContext2D | null = null;
let animation = createAnimationState();
let frameHandle = 0;
let running = false;

function spawnParticles(
  x: number,
  y: number,
  color: string,
  count = PARTICLE_COUNT
): AnimationState['particles'] {
  return Array.from({ length: count }, () => ({
    x,
    y,
    vx: (Math.random() * 2 - 1) * 2.5,
    vy: (Math.random() * 2 - 1) * 2.5 - 1,
    life: PARTICLE_LIFETIME,
    color,
  }));
}

function spawnFloatingNumber(
  x: number,
  y: number,
  text: string,
  color: string
): AnimationState['floatingNumbers'][number] {
  return { x, y, text, color, life: FLOATING_NUMBER_LIFETIME };
}

/** Map a combat event to the SFX it should play. XP gains stay silent to avoid audio spam. */
export function eventTypeToSfxType(event: CombatEvent): SfxType | null {
  switch (event.type) {
    case 'heroAttack':
      return (event.damage ?? 0) >= CRIT_DAMAGE_THRESHOLD ? 'crit' : 'attack';
    case 'monsterAttack':
      return 'monsterHit';
    case 'monsterDefeated':
      return 'monsterSlain';
    case 'levelUp':
      return 'levelUp';
    case 'xpGain':
      return null;
  }
}

/** Translate one combat event into animation effects. Pure aside from the given animation state. */
export function applyCombatEvent(
  anim: AnimationState,
  event: CombatEvent,
  width: number,
  height: number
): void {
  const layout = computeLayout(width, height);
  const monsterPoint = { x: layout.monster.x, y: layout.monster.y - 40 * layout.scale };
  const heroPoint = { x: layout.hero.x, y: layout.hero.y - 40 * layout.scale };

  switch (event.type) {
    case 'heroAttack': {
      const damage = event.damage ?? 0;
      anim.heroAttacking = true;
      anim.heroAttackTick = 0;
      anim.floatingNumbers.push(
        spawnFloatingNumber(monsterPoint.x, monsterPoint.y, `-${damage}`, COLORS.gold)
      );
      anim.particles.push(...spawnParticles(monsterPoint.x, monsterPoint.y, COLORS.gold));
      if (damage >= CRIT_DAMAGE_THRESHOLD) anim.shakeIntensity = SHAKE_INTENSITY;
      break;
    }
    case 'monsterAttack': {
      const damage = event.damage ?? 0;
      anim.monsterAttacking = true;
      anim.monsterAttackTick = 0;
      anim.floatingNumbers.push(
        spawnFloatingNumber(heroPoint.x, heroPoint.y, `-${damage}`, COLORS.danger)
      );
      anim.particles.push(...spawnParticles(heroPoint.x, heroPoint.y, COLORS.danger));
      break;
    }
    case 'monsterDefeated': {
      anim.particles.push(...spawnParticles(monsterPoint.x, monsterPoint.y, COLORS.danger, 16));
      break;
    }
    case 'xpGain': {
      anim.floatingNumbers.push(
        spawnFloatingNumber(heroPoint.x, heroPoint.y, `+${event.xp ?? 0} XP`, COLORS.gold)
      );
      break;
    }
    case 'levelUp': {
      anim.floatingNumbers.push(
        spawnFloatingNumber(heroPoint.x, heroPoint.y - 20, `LVL ${event.level ?? 1}`, COLORS.gold)
      );
      anim.particles.push(...spawnParticles(heroPoint.x, heroPoint.y, COLORS.gold, 12));
      break;
    }
  }
}

/** Advance every animation timer by one frame. */
export function advanceAnimation(anim: AnimationState): void {
  anim.tick += 1;
  anim.heroBobTick = (anim.heroBobTick + 1) % BOB_PERIOD;
  anim.monsterBobTick = (anim.monsterBobTick + 1) % BOB_PERIOD;

  if (anim.heroAttacking) {
    anim.heroAttackTick += 1;
    if (anim.heroAttackTick >= ATTACK_FRAMES) {
      anim.heroAttacking = false;
      anim.heroAttackTick = 0;
    }
  }

  if (anim.monsterAttacking) {
    anim.monsterAttackTick += 1;
    if (anim.monsterAttackTick >= ATTACK_FRAMES) {
      anim.monsterAttacking = false;
      anim.monsterAttackTick = 0;
    }
  }

  anim.shakeIntensity = anim.shakeIntensity > 0.1 ? anim.shakeIntensity * SHAKE_DECAY : 0;

  for (const number of anim.floatingNumbers) {
    number.life -= 1;
    number.y -= FLOATING_NUMBER_RISE;
  }
  anim.floatingNumbers = anim.floatingNumbers.filter((number) => number.life > 0);

  for (const particle of anim.particles) {
    particle.life -= 1;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.25;
  }
  anim.particles = anim.particles.filter((particle) => particle.life > 0);
}

function renderFrame(): void {
  if (!canvas || !context) return;

  const state = useGameStore.getState();

  for (const event of state.drainCombatEvents()) {
    applyCombatEvent(animation, event, canvas.width, canvas.height);
    const sfx = eventTypeToSfxType(event);
    if (sfx) SoundSynth.play(sfx);
  }

  advanceAnimation(animation);
  drawScene(
    context,
    canvas.width,
    canvas.height,
    { hero: state.hero, activeMonster: state.activeMonster },
    animation
  );
}

function frame(): void {
  if (!running) return;
  renderFrame();
  frameHandle = requestAnimationFrame(frame);
}

function start(target: HTMLCanvasElement): void {
  stop();
  canvas = target;
  context = target.getContext('2d');
  if (!context) return;

  animation = createAnimationState();
  running = true;
  renderFrame();
  frameHandle = requestAnimationFrame(frame);
}

/** Draw one frame immediately (used after a canvas resize). */
function render(): void {
  renderFrame();
}

function stop(): void {
  running = false;
  if (frameHandle !== 0) cancelAnimationFrame(frameHandle);
  frameHandle = 0;
  canvas = null;
  context = null;
}

export const GameLoop = { start, stop, render };
