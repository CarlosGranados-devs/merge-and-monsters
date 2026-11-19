import type {
  CombatEvent,
  MonsterArchetype,
  MonsterEntity,
  RawCommit,
  RawIssue,
  RawPr,
  WeaponClass,
} from '../types/index';

// -------------------------------------
// XP Calculation
// -------------------------------------

/** Number of merged PRs (after filtering already-processed IDs). */
function countNewPrs(mergedPrs: RawPr[], processedIds: Set<string>): number {
  return mergedPrs.filter((pr) => !processedIds.has(pr.toString())).length;
}

/**
 * Calculate XP from commits and PRs.
 * Returns `{ totalXp, newProcessedIds }`.
 *
 * Formula: floor(25 * ln(1 + delta_lines)) + 50 * n_pr
 * delta_lines is clamped to [1, 2000].
 * XP is not awarded for IDs already in processedIds.
 */
export function calculateXp(
  commits: RawCommit[],
  mergedPrs: RawPr[],
  processedIds: Set<string>
): { totalXp: number; newProcessedIds: Set<string> } {
  // delta_lines clamped to [1, 2000] per acceptance criteria:
  // "delta_lines = 0 clamps to 1 and returns floor(25 * ln(2)) = 17"
  const rawDelta = commits.reduce((sum, c) => sum + c.stats.additions - c.stats.deletions, 0);
  const deltaLines = Math.max(1, Math.min(2000, rawDelta));
  const nPr = countNewPrs(mergedPrs, processedIds);
  const totalXp = Math.floor(25 * Math.log(1 + deltaLines)) + 50 * nPr;

  // Collect new IDs from commits and PRs that are not already processed
  const newIds: string[] = [];
  for (const commit of commits) {
    if (!processedIds.has(commit.sha)) {
      newIds.push(commit.sha);
    }
  }
  for (const pr of mergedPrs) {
    if (!processedIds.has(pr.toString())) {
      newIds.push(pr.toString());
    }
  }

  const newProcessedIds = new Set([...processedIds, ...newIds]);
  return { totalXp, newProcessedIds };
}

// -------------------------------------
// Weapon Class Derivation
// -------------------------------------

/** Map a repository's primary language to a weapon class. */
export function deriveWeaponClass(language: string | null): WeaponClass {
  const mapping: Record<string, WeaponClass> = {
    TypeScript: 'strictBlade',
    JavaScript: 'scriptDagger',
    Python: 'scriptStaff',
    Rust: 'ironFang',
    Go: 'goHammer',
    Java: 'castMace',
    'C++': 'rawEdge',
    C: 'rawEdge',
    Dockerfile: 'containerShield',
    Shell: 'containerShield',
    Ruby: 'gemRod',
  };
  if (language === null) return 'adventurerFist';
  const normalized = language.trim();
  return mapping[normalized] ?? 'adventurerFist';
}

// -------------------------------------
// Max HP Calculation
// -------------------------------------

/**
 * Calculate max HP based on repository health.
 * Returns a value in [100, 500].
 *
 * Formula uses closed issue ratio and presence of README/CI.
 */
export function calculateMaxHp(
  closedIssues: number,
  totalIssues: number,
  hasReadme: boolean,
  hasCi: boolean
): number {
  if (totalIssues === 0) return 100; // default minimal HP

  const ratio = closedIssues / totalIssues; // [0, 1]
  // Base HP scales with the close ratio; README and CI give small bonuses
  let base = Math.round(100 + ratio * 200); // [100, 300]

  if (hasReadme) base += 20;
  if (hasCi) base += 20;

  // Clamp to [100, 500]
  return Math.max(100, Math.min(500, base));
}

// -------------------------------------
// Monster Queue Building
// -------------------------------------

/** Build the monster queue from open issues, sorted by severity (highest HP first). */
export function buildMonsterQueue(openIssues: RawIssue[]): MonsterEntity[] {
  if (openIssues.length === 0) {
    return [
      {
        id: -1,
        archetype: 'trainingDummy',
        name: 'Training Dummy',
        hp: 10,
        maxHp: 10,
        goldReward: 5,
        issueNumber: 0,
      },
    ];
  }

  return openIssues
    .filter((issue) => !issue.labels.some((l) => l.name === 'pull_request'))
    .sort((a, b) => {
      // Sort by severity: issues with "bug" label first, then by age (created_at)
      const aIsBug = a.labels.some((l) => l.name === 'bug');
      const bIsBug = b.labels.some((l) => l.name === 'bug');
      if (aIsBug && !bIsBug) return -1;
      if (!aIsBug && bIsBug) return 1;

      // Compare by age (older = more severe)
      const aDate = new Date(a.created_at).getTime();
      const bDate = new Date(b.created_at).getTime();
      return bDate - aDate; // oldest first
    })
    .map((issue, index) => {
      const ageDays = Math.max(
        0,
        Math.floor((Date.now() - new Date(issue.created_at).getTime()) / 86400000)
      );
      const isBug = issue.labels.some((l) => l.name === 'bug');
      const archetype: MonsterArchetype = isBug ? 'regressionGolem' : 'backlogWraith';
      const baseHp = isBug ? 150 : 100;
      const maxHp = Math.max(100, Math.min(1500, baseHp * (1 + 0.15 * Math.min(ageDays, 60))));

      return {
        id: issue.number,
        archetype,
        name: issue.title || `Issue #${issue.number}`,
        hp: Math.round(maxHp - index * 5), // slight decrease for queue diversity
        maxHp,
        goldReward: Math.max(1, 10 + index),
        issueNumber: issue.number,
      };
    });
}

// -------------------------------------
// Combat Event Mapping
// -------------------------------------

/** Map new commits, PRs, and closed issues to combat events. */
export function mapToCombatEvents(
  newCommits: RawCommit[],
  newPrs: RawPr[],
  closedIssues: RawIssue[]
): CombatEvent[] {
  const events: CombatEvent[] = [];

  // XP gain events from new commits
  for (const _commit of newCommits) {
    events.push({
      type: 'xpGain',
      xp: 1, // minimal XP per commit; actual XP calculated at checkpoint
      timestamp: Date.now(),
    });
  }

  // Level-up event for each merged PR
  for (const _pr of newPrs) {
    events.push({
      type: 'levelUp',
      level: 1, // will be updated by the store
      timestamp: Date.now(),
    });
  }

  // Monster defeated events for closed issues
  for (const _issue of closedIssues) {
    events.push({
      type: 'monsterDefeated',
      gold: 10,
      timestamp: Date.now(),
    });
  }

  return events;
}
