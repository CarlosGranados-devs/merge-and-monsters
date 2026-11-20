import type { HeroState, MonsterEntity } from '../types';

export const BOB_PERIOD = 60;
export const BOB_AMPLITUDE = 2;
export const ATTACK_FRAMES = 15;
export const FLOATING_NUMBER_LIFETIME = 40;
export const FLOATING_NUMBER_RISE = 2;
export const PARTICLE_LIFETIME = 30;
export const PARTICLE_COUNT = 10;
export const SHAKE_INTENSITY = 8;
export const SHAKE_DECAY = 0.85;
export const CRIT_DAMAGE_THRESHOLD = 50;

export const COLORS = {
  background: '#0D0D0F',
  floorLight: '#15151B',
  floorDark: '#101015',
  wall: '#1B1B22',
  wallHighlight: '#2A2A33',
  gold: '#D4AF37',
  text: '#E8E8E8',
  danger: '#C0392B',
  shadow: 'rgba(0, 0, 0, 0.35)',
  heroBody: '#4A90D9',
  heroSkin: '#F5CBA7',
  heroBoot: '#2C3E50',
  golemBody: '#6E6E78',
  golemCrack: '#3A3A44',
  wraithBody: '#3A2E4A',
  slimeBody: '#4E8C4A',
  crawlerBody: '#2B2B33',
  dummyBody: '#8B5A2B',
} as const;

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface FloatingNumber {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export interface AnimationState {
  tick: number;
  heroBobTick: number;
  monsterBobTick: number;
  heroAttacking: boolean;
  heroAttackTick: number;
  monsterAttacking: boolean;
  monsterAttackTick: number;
  shakeIntensity: number;
  particles: Particle[];
  floatingNumbers: FloatingNumber[];
}

export interface RenderSnapshot {
  hero: HeroState;
  activeMonster: MonsterEntity | null;
}

export interface LayoutPoint {
  x: number;
  y: number;
}

export interface SceneLayout {
  scale: number;
  hero: LayoutPoint;
  monster: LayoutPoint;
}

export function createAnimationState(): AnimationState {
  return {
    tick: 0,
    heroBobTick: 0,
    monsterBobTick: 0,
    heroAttacking: false,
    heroAttackTick: 0,
    monsterAttacking: false,
    monsterAttackTick: 0,
    shakeIntensity: 0,
    particles: [],
    floatingNumbers: [],
  };
}

export function spriteScale(height: number): number {
  return Math.max(2, Math.min(4, Math.floor(height / 180)));
}

export function computeLayout(width: number, height: number): SceneLayout {
  return {
    scale: spriteScale(height),
    hero: { x: Math.round(width * 0.3), y: Math.round(height * 0.72) },
    monster: { x: Math.round(width * 0.7), y: Math.round(height * 0.72) },
  };
}

function drawFloor(ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) {
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, width, height);

  const tile = 48 * scale;
  for (let row = 0; row * tile < height; row += 1) {
    for (let column = 0; column * tile < width; column += 1) {
      ctx.fillStyle = (row + column) % 2 === 0 ? COLORS.floorLight : COLORS.floorDark;
      ctx.fillRect(column * tile, row * tile, tile, tile);
    }
  }
}

function drawWalls(ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) {
  const topWall = Math.round(height * 0.16);
  const sideWall = 8 * scale;

  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, width, topWall);
  ctx.fillRect(0, 0, sideWall, height);
  ctx.fillRect(width - sideWall, 0, sideWall, height);

  ctx.fillStyle = COLORS.wallHighlight;
  ctx.fillRect(0, topWall - 3 * scale, width, 3 * scale);

  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(0, topWall, width, Math.max(1, Math.round(scale / 2)));
}

function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.fillStyle = COLORS.shadow;
  ctx.beginPath();
  ctx.ellipse(x, y + 2 * scale, 16 * scale, 4 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHpBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  current: number,
  max: number,
  fill: string,
  scale: number
) {
  const barWidth = 56 * scale;
  const barHeight = 6 * scale;
  const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;

  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);
  ctx.fillStyle = fill;
  ctx.fillRect(x - barWidth / 2, y, barWidth * ratio, barHeight);
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = Math.max(1, scale / 2);
  ctx.strokeRect(x - barWidth / 2, y, barWidth, barHeight);
}

function drawHero(
  ctx: CanvasRenderingContext2D,
  hero: HeroState,
  point: LayoutPoint,
  anim: AnimationState,
  scale: number
) {
  const bob = anim.heroBobTick % BOB_PERIOD < BOB_PERIOD / 2 ? 0 : -BOB_AMPLITUDE * scale;
  const attackProgress = anim.heroAttacking ? 1 - anim.heroAttackTick / ATTACK_FRAMES : 0;
  const lunge = Math.round(10 * scale * attackProgress);
  const x = point.x + lunge;
  const y = point.y + bob;

  drawShadow(ctx, point.x, point.y, scale);

  const bodyWidth = 20 * scale;
  const bodyHeight = 26 * scale;
  const headSize = 16 * scale;
  const legHeight = 10 * scale;

  ctx.fillStyle = COLORS.heroBoot;
  ctx.fillRect(x - bodyWidth / 2 + 2 * scale, y - legHeight, 6 * scale, legHeight);
  ctx.fillRect(x + bodyWidth / 2 - 8 * scale, y - legHeight, 6 * scale, legHeight);

  ctx.fillStyle = COLORS.heroBody;
  ctx.fillRect(x - bodyWidth / 2, y - legHeight - bodyHeight, bodyWidth, bodyHeight);

  ctx.fillStyle = COLORS.heroSkin;
  ctx.fillRect(x - headSize / 2, y - legHeight - bodyHeight - headSize, headSize, headSize);

  ctx.fillStyle = COLORS.gold;
  if (anim.heroAttacking) {
    ctx.fillRect(x + bodyWidth / 2, y - legHeight - bodyHeight + 4 * scale, 18 * scale, 3 * scale);
  } else {
    const lift = anim.heroBobTick % BOB_PERIOD < BOB_PERIOD / 2 ? 0 : 2 * scale;
    ctx.fillRect(
      x + bodyWidth / 2 + 2 * scale,
      y - legHeight - bodyHeight - 2 * scale - lift,
      3 * scale,
      20 * scale
    );
  }

  const barY = y - legHeight - bodyHeight - headSize - 12 * scale;
  drawHpBar(ctx, x, barY, hero.hp, hero.maxHp, COLORS.gold, scale);
}

function drawGolem(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  const width = 34 * scale;
  const height = 40 * scale;

  ctx.fillStyle = COLORS.golemBody;
  ctx.fillRect(x - width / 2, y - height, width, height);

  ctx.strokeStyle = COLORS.golemCrack;
  ctx.lineWidth = Math.max(1, scale / 2);
  ctx.beginPath();
  ctx.moveTo(x - width / 4, y - height);
  ctx.lineTo(x - width / 8, y - height / 2);
  ctx.lineTo(x - width / 3, y - height / 4);
  ctx.moveTo(x + width / 4, y - height + 4 * scale);
  ctx.lineTo(x + width / 6, y - height / 3);
  ctx.stroke();

  ctx.fillStyle = COLORS.danger;
  ctx.fillRect(x - 10 * scale, y - height + 8 * scale, 5 * scale, 5 * scale);
  ctx.fillRect(x + 5 * scale, y - height + 8 * scale, 5 * scale, 5 * scale);
}

function drawWraith(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  const width = 32 * scale;
  const height = 42 * scale;

  ctx.globalAlpha = 0.75;
  ctx.fillStyle = COLORS.wraithBody;
  ctx.beginPath();
  ctx.moveTo(x, y - height);
  ctx.lineTo(x + width / 2, y - height / 3);
  ctx.lineTo(x + width / 4, y - height / 3);
  ctx.lineTo(x + width / 3, y);
  ctx.lineTo(x - width / 3, y);
  ctx.lineTo(x - width / 4, y - height / 3);
  ctx.lineTo(x - width / 2, y - height / 3);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = COLORS.text;
  ctx.fillRect(x - 8 * scale, y - height * 0.7, 4 * scale, 4 * scale);
  ctx.fillRect(x + 4 * scale, y - height * 0.7, 4 * scale, 4 * scale);
  ctx.globalAlpha = 1;
}

function drawSlime(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  const radius = 20 * scale;

  ctx.fillStyle = COLORS.slimeBody;
  ctx.beginPath();
  ctx.arc(x, y - radius, radius, Math.PI, 0);
  ctx.lineTo(x + radius, y);
  ctx.lineTo(x - radius, y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(x - 8 * scale, y - radius - 4 * scale, 4 * scale, 4 * scale);
  ctx.fillRect(x + 4 * scale, y - radius - 4 * scale, 4 * scale, 4 * scale);
}

function drawCrawler(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  const body = 16 * scale;
  const legLength = 20 * scale;

  ctx.strokeStyle = COLORS.crawlerBody;
  ctx.lineWidth = 2 * scale;
  for (let index = 0; index < 4; index += 1) {
    const offset = (index - 1.5) * 6 * scale;
    ctx.beginPath();
    ctx.moveTo(x, y - body);
    ctx.lineTo(x + offset, y);
    ctx.moveTo(x, y - body);
    ctx.lineTo(x - offset, y);
    ctx.stroke();
  }

  ctx.fillStyle = COLORS.crawlerBody;
  ctx.fillRect(x - body / 2, y - body - legLength / 2, body, body);

  ctx.fillStyle = COLORS.danger;
  ctx.fillRect(x - 5 * scale, y - body - legLength / 2 + 3 * scale, 3 * scale, 3 * scale);
  ctx.fillRect(x + 2 * scale, y - body - legLength / 2 + 3 * scale, 3 * scale, 3 * scale);
}

function drawDummy(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.fillStyle = COLORS.dummyBody;
  ctx.fillRect(x - 4 * scale, y - 40 * scale, 8 * scale, 40 * scale);
  ctx.fillRect(x - 18 * scale, y - 34 * scale, 36 * scale, 5 * scale);
  ctx.fillRect(x - 12 * scale, y - 44 * scale, 24 * scale, 6 * scale);

  ctx.fillStyle = COLORS.text;
  ctx.fillRect(x - 6 * scale, y - 30 * scale, 3 * scale, 3 * scale);
  ctx.fillRect(x + 3 * scale, y - 30 * scale, 3 * scale, 3 * scale);
}

function drawMonster(
  ctx: CanvasRenderingContext2D,
  monster: MonsterEntity,
  point: LayoutPoint,
  anim: AnimationState,
  scale: number
) {
  const bob = anim.monsterBobTick % BOB_PERIOD < BOB_PERIOD / 2 ? 0 : -BOB_AMPLITUDE * scale;
  const attackProgress = anim.monsterAttacking ? 1 - anim.monsterAttackTick / ATTACK_FRAMES : 0;
  const lunge = Math.round(10 * scale * attackProgress);
  const x = point.x - lunge;
  const y = point.y + bob;

  drawShadow(ctx, point.x, point.y, scale);

  switch (monster.archetype) {
    case 'regressionGolem':
      drawGolem(ctx, x, y, scale);
      break;
    case 'backlogWraith':
      drawWraith(ctx, x, y, scale);
      break;
    case 'debtSlime':
      drawSlime(ctx, x, y, scale);
      break;
    case 'mysteryCrawler':
      drawCrawler(ctx, x, y, scale);
      break;
    case 'trainingDummy':
      drawDummy(ctx, x, y, scale);
      break;
  }

  drawHpBar(ctx, x, y - 62 * scale, monster.hp, monster.maxHp, COLORS.danger, scale);
}

function drawFloatingNumbers(
  ctx: CanvasRenderingContext2D,
  numbers: FloatingNumber[],
  scale: number
) {
  ctx.font = `bold ${Math.round(8 * scale)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const number of numbers) {
    ctx.globalAlpha = Math.max(0, Math.min(1, number.life / FLOATING_NUMBER_LIFETIME));
    ctx.fillStyle = number.color;
    ctx.fillText(number.text, number.x, number.y);
  }

  ctx.globalAlpha = 1;
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[], scale: number) {
  const size = Math.max(2, Math.round(1.5 * scale));

  for (const particle of particles) {
    ctx.globalAlpha = Math.max(0, Math.min(1, particle.life / PARTICLE_LIFETIME));
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, size, size);
  }

  ctx.globalAlpha = 1;
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  snapshot: RenderSnapshot,
  anim: AnimationState
): void {
  if (width < 2 || height < 2) return;

  const layout = computeLayout(width, height);

  ctx.save();

  if (anim.shakeIntensity > 0) {
    ctx.translate(
      (Math.random() * 2 - 1) * anim.shakeIntensity,
      (Math.random() * 2 - 1) * anim.shakeIntensity
    );
  }

  drawFloor(ctx, width, height, layout.scale);
  drawWalls(ctx, width, height, layout.scale);

  if (snapshot.activeMonster) {
    drawMonster(ctx, snapshot.activeMonster, layout.monster, anim, layout.scale);
  }

  drawHero(ctx, snapshot.hero, layout.hero, anim, layout.scale);
  drawFloatingNumbers(ctx, anim.floatingNumbers, layout.scale);
  drawParticles(ctx, anim.particles, layout.scale);

  ctx.restore();
}
