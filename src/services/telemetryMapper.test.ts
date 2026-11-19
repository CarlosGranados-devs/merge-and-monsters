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
      // no PRs in this test, so totalXp = 17
      const { totalXp } = calculateXp([], [], new Set());
      expect(totalXp).toBe(17);
    });

    it('with delta_lines = 3000 clamped to 2000 returns 190', () => {
      const commits: RawCommit[] = [
        {
          sha: 'abc123',
          message: 'feat: add stuff',
          author: { login: 'user', avatar_url: '' },
          stats: { additions: 2000, deletions: 0 },
          date: '2024-01-01T00:00:00Z',
        },
      ];
      // delta_lines = 2000 (clamped) → floor(25 * ln(2001)) = 190
      const { totalXp } = calculateXp(commits, [], new Set());
      expect(totalXp).toBe(190);
    });

    it('does not award XP for already-processed IDs', () => {
      const processed = new Set(['abc123']);
      const { newProcessedIds } = calculateXp(
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
      expect(newProcessedIds.has('abc123')).toBe(true);
      // New ID should not be added since it was already processed
      expect(newProcessedIds.size).toBe(1);
    });

    it('awards 50 XP per new merged PR', () => {
      // delta_lines clamped to 1 → floor(25 * ln(2)) = 17, plus 50 XP from PR = 67 total
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
      expect(totalXp).toBe(67);
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
      expect(events).toHaveLength(3); // 1 xpGain + 1 levelUp + 1 monsterDefeated
      expect(events[0].type).toBe('xpGain');
      expect(events[1].type).toBe('levelUp');
      expect(events[2].type).toBe('monsterDefeated');
    });
  });
});
