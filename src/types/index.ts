// ============================================================================
// Weapon classes (based on repository primary language)
// ============================================================================

export type WeaponClass =
  | 'strictBlade' // TypeScript
  | 'scriptDagger' // JavaScript
  | 'scriptStaff' // Python
  | 'ironFang' // Rust
  | 'goHammer' // Go
  | 'castMace' // Java
  | 'rawEdge' // C / C++
  | 'containerShield' // Dockerfile / Shell
  | 'gemRod' // Ruby
  | 'adventurerFist'; // Other / null

// ============================================================================
// Monster archetypes (based on GitHub issue labels)
// ============================================================================

export type MonsterArchetype =
  | 'regressionGolem' // bug, critical
  | 'backlogWraith' // enhancement, feature
  | 'debtSlime' // documentation, chore, debt
  | 'mysteryCrawler' // no matching label
  | 'trainingDummy'; // no open issues

// ============================================================================
// GitHub raw data (from API)
// ============================================================================

export interface RawCommit {
  sha: string;
  message: string;
  author: { login: string; avatar_url: string };
  stats: { additions: number; deletions: number };
  date: string;
}

export interface RawPr {
  id: number;
  number: number;
  title: string;
  merged_at: string | null;
  user: { login: string };
  labels: Array<{ name: string }>;
}

export interface RawIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  created_at: string;
  labels: Array<{ name: string }>;
  user: { login: string };
}

export interface RepoData {
  slug: string;
  primaryLanguage: string | null;
  openIssueCount: number;
  closedIssueCount: number;
  hasReadme: boolean;
  hasCiWorkflows: boolean;
  commits: RawCommit[];
  mergedPrs: RawPr[];
  openIssues: RawIssue[];
}

// ============================================================================
// Game state
// ============================================================================

export interface HeroState {
  name: string;
  xp: number;
  level: number;
  hp: number;
  maxHp: number;
  gold: number;
  weaponClass: WeaponClass;
}

export interface MonsterEntity {
  id: number;
  archetype: MonsterArchetype;
  name: string;
  hp: number;
  maxHp: number;
  goldReward: number;
  issueNumber: number;
}

export type SfxType =
  | 'attack'
  | 'crit'
  | 'monsterHit'
  | 'levelUp'
  | 'monsterSlain'
  | 'gold'
  | 'uiClick';

export interface CombatEvent {
  type: 'heroAttack' | 'monsterAttack' | 'monsterDefeated' | 'levelUp' | 'xpGain';
  damage?: number;
  xp?: number;
  gold?: number;
  level?: number;
  timestamp: number;
}

export interface CombatLogEntry {
  id: string;
  timestamp: number;
  messageKey: string;
  params: Record<string, string | number>;
}

// ============================================================================
// Store shape (partial preview; full interface in useGameStore.ts)
// ============================================================================

export interface GameStore {
  repoSlug: string | null;
  connected: boolean;
  sandboxMode: boolean;
  hero: HeroState;
  monsterQueue: MonsterEntity[];
  activeMonster: MonsterEntity | null;
  combatLog: CombatLogEntry[];
  muted: boolean;
  processedIds: Set<string>;

  // actions will be defined in the store
}
