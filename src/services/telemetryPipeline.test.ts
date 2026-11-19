import { describe, expect, it } from 'vitest';
import type { HeroState, RepoData } from '../types';
import { getSandboxData } from './githubClient';
import {
  buildMonsterQueue,
  calculateMaxHp,
  calculateXp,
  deriveWeaponClass,
  mapToCombatEvents,
} from './telemetryMapper';

function buildHero(data: RepoData, processedIds: Set<string>): HeroState {
  const { totalXp } = calculateXp(data.commits, data.mergedPrs, processedIds);
  const maxHp = calculateMaxHp(
    data.closedIssueCount,
    data.closedIssueCount + data.openIssueCount,
    data.hasReadme,
    data.hasCiWorkflows
  );

  return {
    name: 'Sandbox Hero',
    xp: totalXp,
    level: 1,
    hp: maxHp,
    maxHp,
    gold: 0,
    weaponClass: deriveWeaponClass(data.primaryLanguage),
  };
}

describe('telemetry pipeline (githubClient -> telemetryMapper)', () => {
  const data = getSandboxData();

  it('builds a valid HeroState from sandbox data', () => {
    const hero = buildHero(data, new Set());

    expect(hero.weaponClass).toBe('strictBlade');
    expect(hero.xp).toBe(693);
    expect(hero.maxHp).toBe(463);
    expect(hero.maxHp).toBeGreaterThanOrEqual(100);
    expect(hero.maxHp).toBeLessThanOrEqual(500);
    expect(hero.hp).toBe(hero.maxHp);
  });

  it('builds the monster queue ordered by descending HP', () => {
    const queue = buildMonsterQueue(data.openIssues);

    expect(queue.map((monster) => monster.archetype)).toEqual([
      'mysteryCrawler',
      'debtSlime',
      'backlogWraith',
      'regressionGolem',
    ]);
    expect(queue.map((monster) => monster.maxHp)).toEqual([750, 413, 325, 195]);
    expect(queue.map((monster) => monster.hp)).toEqual([750, 413, 325, 195]);
    expect(queue.every((monster) => Number.isInteger(monster.maxHp))).toBe(true);
    expect(queue.map((monster) => monster.issueNumber)).toEqual([104, 103, 102, 101]);

    const hps = queue.map((monster) => monster.maxHp);
    expect([...hps].sort((a, b) => b - a)).toEqual(hps);
  });

  it('does not award XP twice when the same payload is replayed', () => {
    const first = calculateXp(data.commits, data.mergedPrs, new Set());
    expect(first.totalXp).toBe(693);

    const second = calculateXp(data.commits, data.mergedPrs, first.newProcessedIds);
    expect(second.totalXp).toBe(0);
    expect(second.newProcessedIds).toEqual(first.newProcessedIds);

    const events = mapToCombatEvents([], [], []);
    expect(events).toEqual([]);
  });

  it('maps commit events whose XP matches the calculation', () => {
    const { totalXp } = calculateXp(data.commits, data.mergedPrs, new Set());
    const events = mapToCombatEvents(data.commits, [], []);

    const commitXp = events
      .filter((event) => event.type === 'xpGain')
      .reduce((sum, event) => sum + (event.xp ?? 0), 0);

    expect(events).toHaveLength(5);
    expect(commitXp).toBe(totalXp - 50 * data.mergedPrs.length);
  });

  it('returns a Training Dummy for a repository without open issues', () => {
    const queue = buildMonsterQueue([]);

    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({
      archetype: 'trainingDummy',
      hp: 50,
      maxHp: 50,
      goldReward: 0,
    });
  });
});
