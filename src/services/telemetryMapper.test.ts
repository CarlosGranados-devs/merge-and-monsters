import { describe, expect, it } from 'vitest';
import type { RawCommit, RawIssue, RawPr } from '../types/index';
import {
  buildMonsterQueue,
  calculateMaxHp,
  calculateXp,
  deriveWeaponClass,
  mapToCombatEvents,
} from './telemetryMapper';

describe('telemetryMapper', () => {
  // ---- calculateXp ----

  describe('calculateXp', () => {
    it('clamps delta_lines to [1, 2000] and computes XP correctly', () => {
      // delta_lines = 0 → clamped to 1 → floor(25 * ln(2)) = 17
      const zeroDelta: RawCommit[] = [
        {
          sha: 'zero-delta',
          message: 'chore: noop',
          author: { login: 'user', avatar_url: '' },
          stats: { additions: 0, deletions: 0 },
          date: '2024-01-01T00:00:00Z',
        },
      ];
      expect(calculateXp(zeroDelta, [], new Set()).totalXp).toBe(17);
      expect(calculateXp([], [], new Set()).totalXp).toBe(0);
    });

    it('with delta_lines = 3000 clamped to 2000 returns 190', () => {
      const commits: RawCommit[] = [
        {
          sha: 'abc123',
          message: 'feat: add stuff',
          author: { login: 'user', avatar_url: '' },
          stats: { additions: 3000, deletions: 0 },
          date: '2024-01-01T00:00:00Z',
        },
      ];
      // delta_lines = 2000 (clamped) → floor(25 * ln(2001)) = 190
      const { totalXp } = calculateXp(commits, [], new Set());
      expect(totalXp).toBe(190);
    });

    it('uses diff churn (additions + deletions), not the net line count', () => {
      const commits: RawCommit[] = [
        {
          sha: 'churn',
          message: 'refactor: rewrite file',
          author: { login: 'user', avatar_url: '' },
          stats: { additions: 100, deletions: 100 },
          date: '2024-01-01T00:00:00Z',
        },
      ];
      // churn = 200 → floor(25 * ln(201)) = 132, net would clamp to 1 → 17
      expect(calculateXp(commits, [], new Set()).totalXp).toBe(132);
    });

    it('sums XP per commit instead of applying one log to the whole window', () => {
      const commits: RawCommit[] = [
        {
          sha: 'small-a',
          message: 'fix: a',
          author: { login: 'user', avatar_url: '' },
          stats: { additions: 10, deletions: 0 },
          date: '2024-01-01T00:00:00Z',
        },
        {
          sha: 'small-b',
          message: 'fix: b',
          author: { login: 'user', avatar_url: '' },
          stats: { additions: 10, deletions: 0 },
          date: '2024-01-02T00:00:00Z',
        },
      ];
      // 2 * floor(25 * ln(11)) = 2 * 59 = 118
      expect(calculateXp(commits, [], new Set()).totalXp).toBe(118);
    });

    it('does not award XP for already-processed IDs', () => {
      const processed = new Set(['abc123']);
      const { totalXp, newProcessedIds } = calculateXp(
        [
          {
            sha: 'abc123',
            message: 'feat: add stuff',
            author: { login: 'user', avatar_url: '' },
            stats: { additions: 10, deletions: 0 },
            date: '2024-01-01T00:00:00Z',
          },
        ],
        [],
        processed
      );
      expect(totalXp).toBe(0);
      expect(newProcessedIds.has('abc123')).toBe(true);
      expect(newProcessedIds.size).toBe(1);
    });

    it('deduplicates merged PRs by numeric id', () => {
      const prs: RawPr[] = [
        {
          id: 42,
          number: 7,
          title: 'Fix bug',
          merged_at: '2024-01-01',
          user: { login: 'user' },
          labels: [],
        },
      ];
      const first = calculateXp([], prs, new Set());
      expect(first.totalXp).toBe(50);
      expect(first.newProcessedIds.has('42')).toBe(true);

      const second = calculateXp([], prs, first.newProcessedIds);
      expect(second.totalXp).toBe(0);
    });

    it('awards 50 XP per new merged PR', () => {
      const { totalXp } = calculateXp(
        [],
        [
          {
            id: 1,
            number: 1,
            title: 'Fix bug',
            merged_at: '2024-01-01',
            user: { login: 'user' },
            labels: [],
          },
        ],
        new Set()
      );
      expect(totalXp).toBe(50);
    });
  });

  // ---- deriveWeaponClass ----

  describe('deriveWeaponClass', () => {
    it('maps TypeScript to strictBlade', () => {
      expect(deriveWeaponClass('TypeScript')).toBe('strictBlade');
    });

    it('maps null to adventurerFist', () => {
      expect(deriveWeaponClass(null)).toBe('adventurerFist');
    });

    it('maps JavaScript to scriptDagger', () => {
      expect(deriveWeaponClass('JavaScript')).toBe('scriptDagger');
    });

    it('maps Python to scriptStaff', () => {
      expect(deriveWeaponClass('Python')).toBe('scriptStaff');
    });

    it('maps Rust to ironFang', () => {
      expect(deriveWeaponClass('Rust')).toBe('ironFang');
    });

    it('maps Go to goHammer', () => {
      expect(deriveWeaponClass('Go')).toBe('goHammer');
    });

    it('maps Java to castMace', () => {
      expect(deriveWeaponClass('Java')).toBe('castMace');
    });

    it('maps C to rawEdge', () => {
      expect(deriveWeaponClass('C')).toBe('rawEdge');
    });

    it('maps C++ to rawEdge', () => {
      expect(deriveWeaponClass('C++')).toBe('rawEdge');
    });

    it('maps Dockerfile to containerShield', () => {
      expect(deriveWeaponClass('Dockerfile')).toBe('containerShield');
    });

    it('maps Ruby to gemRod', () => {
      expect(deriveWeaponClass('Ruby')).toBe('gemRod');
    });

    it('returns adventurerFist for unknown language', () => {
      expect(deriveWeaponClass('Unknown')).toBe('adventurerFist');
    });
  });

  // ---- calculateMaxHp ----

  describe('calculateMaxHp', () => {
    it('returns 100 when there are no total issues', () => {
      const hp = calculateMaxHp(0, 0, false, false);
      expect(hp).toBe(100);
    });

    it('returns a value in [100, 500]', () => {
      const hp = calculateMaxHp(10, 20, true, true);
      expect(hp).toBeGreaterThanOrEqual(100);
      expect(hp).toBeLessThanOrEqual(500);
    });

    it('higher close ratio gives higher HP', () => {
      const hpHigh = calculateMaxHp(100, 100, true, true); // 100% close ratio
      const lpLow = calculateMaxHp(0, 100, false, false); // 0% close ratio
      expect(hpHigh).toBeGreaterThan(lpLow);
    });
  });

  // ---- buildMonsterQueue ----

  describe('buildMonsterQueue', () => {
    it('returns a single Training Dummy when no open issues', () => {
      const queue = buildMonsterQueue([]);
      expect(queue).toHaveLength(1);
      expect(queue[0].archetype).toBe('trainingDummy');
      expect(queue[0].name).toBe('Training Dummy');
      expect(queue[0].hp).toBe(50);
      expect(queue[0].maxHp).toBe(50);
      expect(queue[0].goldReward).toBe(0);
    });

    it('builds monster queue from open issues', () => {
      const issues: RawIssue[] = [
        {
          id: 1,
          number: 1,
          title: 'Bug: crash on startup',
          body: null,
          created_at: '2025-01-01T00:00:00Z',
          labels: [{ name: 'bug' }],
          user: { login: 'user' },
        },
        {
          id: 2,
          number: 2,
          title: 'Feature: dark mode',
          body: null,
          created_at: '2025-02-01T00:00:00Z',
          labels: [{ name: 'enhancement' }],
          user: { login: 'user' },
        },
      ];

      const queue = buildMonsterQueue(issues);
      expect(queue).toHaveLength(2);
      expect(queue[0].archetype).toBe('regressionGolem'); // bug is first
      expect(queue[1].archetype).toBe('backlogWraith'); // enhancement is second
      expect(queue[0].hp).toBe(queue[0].maxHp);
      expect(queue[1].hp).toBe(queue[1].maxHp);
    });

    it('maps documentation labels to debtSlime and unlabeled issues to mysteryCrawler', () => {
      const issues: RawIssue[] = [
        {
          id: 3,
          number: 3,
          title: 'Document the formulas',
          body: null,
          created_at: '2025-01-01T00:00:00Z',
          labels: [{ name: 'documentation' }],
          user: { login: 'user' },
        },
        {
          id: 4,
          number: 4,
          title: 'Unlabeled mystery',
          body: null,
          created_at: '2025-01-01T00:00:00Z',
          labels: [],
          user: { login: 'user' },
        },
      ];

      const queue = buildMonsterQueue(issues);
      expect(queue.map((monster) => monster.archetype).sort()).toEqual([
        'debtSlime',
        'mysteryCrawler',
      ]);
      expect(queue.every((monster) => Number.isInteger(monster.maxHp))).toBe(true);
    });

    it('rounds monster HP derived from a fractional age multiplier', () => {
      const fifteenDaysAgo = new Date(Date.now() - 15 * 86_400_000).toISOString();
      const queue = buildMonsterQueue([
        {
          id: 5,
          number: 5,
          title: 'Enhancement',
          body: null,
          created_at: fifteenDaysAgo,
          labels: [{ name: 'enhancement' }],
          user: { login: 'user' },
        },
      ]);

      // 100 * (1 + 0.15 * 15) = 325
      expect(queue[0].maxHp).toBe(325);
    });

    it('filters out pull_request labels', () => {
      const issues: RawIssue[] = [
        {
          id: 1,
          number: 1,
          title: 'Fix bug',
          body: null,
          created_at: '2025-01-01T00:00:00Z',
          labels: [{ name: 'bug' }, { name: 'pull_request' }],
          user: { login: 'user' },
        },
      ];

      const queue = buildMonsterQueue(issues);
      expect(queue).toHaveLength(0); // pull_request filtered out
    });
  });

  // ---- mapToCombatEvents ----

  describe('mapToCombatEvents', () => {
    it('maps new combat events from commits, PRs, and closed issues', () => {
      const commits: RawCommit[] = [
        {
          sha: 'abc123',
          message: 'feat: add stuff',
          author: { login: 'user', avatar_url: '' },
          stats: { additions: 10, deletions: 0 },
          date: '2024-01-01T00:00:00Z',
        },
      ];
      const prs: RawPr[] = [
        {
          id: 1,
          number: 1,
          title: 'Fix bug',
          merged_at: '2024-01-01',
          user: { login: 'user' },
          labels: [],
        },
      ];
      const closed: RawIssue[] = [
        {
          id: 1,
          number: 1,
          title: 'Old issue',
          body: null,
          created_at: '2024-01-01T00:00:00Z',
          labels: [{ name: 'bug' }],
          user: { login: 'user' },
        },
      ];

      const events = mapToCombatEvents(commits, prs, closed);
      expect(events.map((event) => event.type)).toEqual(['xpGain', 'xpGain', 'monsterDefeated']);
      // commit: floor(25 * ln(11)) = 59, PR: 50
      expect(events[0].xp).toBe(59);
      expect(events[1].xp).toBe(50);
    });
  });
});
