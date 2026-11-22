import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { fetchRepoData, getSandboxData, setSandboxMode } from '../services/githubClient';
import {
  buildMonsterQueue,
  calculateMaxHp,
  calculateXp,
  deriveWeaponClass,
  mapToCombatEvents,
} from '../services/telemetryMapper';
import type {
  CombatEvent,
  CombatLogEntry,
  GameStore,
  HeroState,
  MonsterEntity,
  RawCommit,
  RepoData,
} from '../types';

export const STORE_STORAGE_KEY = 'm_and_m:state';
export const PAT_STORAGE_KEY = 'm_and_m:pat';

const MAX_LOG_ENTRIES = 100;
const XP_PER_LEVEL_STEP = 100;
const PR_XP = 50;

export interface GameStoreActions {
  connect: (slug: string, pat?: string) => Promise<void>;
  launchSandbox: () => void;
  simulateCommit: () => void;
  simulatePrMerge: () => void;
  simulateIssueClose: () => void;
  setMuted: (muted: boolean) => void;
  setAttacking: (attacking: boolean) => void;
  addCombatLogEntry: (entry: CombatLogEntry) => void;
  advanceMonsterQueue: () => void;
  drainCombatEvents: () => CombatEvent[];
  reset: () => void;
}

export interface GameStoreState extends GameStore, GameStoreActions {
  pendingEvents: CombatEvent[];
  /** True while the engine is playing a hero attack animation. Transient, never persisted. */
  attacking: boolean;
}

interface PersistedGameState {
  repoSlug: string | null;
  connected: boolean;
  sandboxMode: boolean;
  hero: HeroState;
  muted: boolean;
  processedIds: string[];
}

const INITIAL_HERO: HeroState = {
  name: 'Adventurer',
  xp: 0,
  level: 1,
  hp: 100,
  maxHp: 100,
  gold: 0,
  weaponClass: 'adventurerFist',
};

type GameStoreData = Omit<GameStoreState, keyof GameStoreActions>;

function initialData(): GameStoreData {
  return {
    repoSlug: null,
    connected: false,
    sandboxMode: false,
    hero: { ...INITIAL_HERO },
    monsterQueue: [],
    activeMonster: null,
    combatLog: [],
    muted: false,
    processedIds: new Set<string>(),
    pendingEvents: [],
    attacking: false,
  };
}

/** Total XP required to reach `level`: 0, 100, 300, 600, ... */
export function xpThresholdForLevel(level: number): number {
  const steps = Math.max(0, level - 1);
  return (XP_PER_LEVEL_STEP * steps * (steps + 1)) / 2;
}

/** Level thresholds grow by 100 XP per level: 100, 300, 600, ... cumulative. */
export function levelFromXp(xp: number): number {
  let level = 1;
  let threshold = XP_PER_LEVEL_STEP;
  while (xp >= threshold) {
    level += 1;
    threshold += level * XP_PER_LEVEL_STEP;
  }
  return level;
}

function createLogEntry(
  messageKey: string,
  params: Record<string, string | number>
): CombatLogEntry {
  const timestamp = Date.now();
  return {
    id: `${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp,
    messageKey,
    params,
  };
}

function commitXp(commit: RawCommit): number {
  return calculateXp([commit], [], new Set()).totalXp;
}

function damageMonster(monster: MonsterEntity | null, damage: number): MonsterEntity | null {
  if (!monster) return null;
  return { ...monster, hp: Math.max(0, monster.hp - damage) };
}

function awardXp(hero: HeroState, xp: number): HeroState {
  const total = hero.xp + xp;
  return { ...hero, xp: total, level: levelFromXp(total) };
}

interface MappedRepo {
  hero: HeroState;
  processedIds: Set<string>;
  activeMonster: MonsterEntity | null;
  monsterQueue: MonsterEntity[];
  events: CombatEvent[];
  logEntries: CombatLogEntry[];
}

function mapRepoData(data: RepoData, hero: HeroState, processedIds: Set<string>): MappedRepo {
  const newCommits = data.commits.filter((commit) => !processedIds.has(commit.sha));
  const newPrs = data.mergedPrs.filter((pr) => !processedIds.has(String(pr.id)));
  const { totalXp, newProcessedIds } = calculateXp(data.commits, data.mergedPrs, processedIds);

  const maxHp = calculateMaxHp(
    data.closedIssueCount,
    data.closedIssueCount + data.openIssueCount,
    data.hasReadme,
    data.hasCiWorkflows
  );

  const queue = buildMonsterQueue(data.openIssues);
  const xp = hero.xp + totalXp;

  return {
    hero: {
      ...hero,
      xp,
      level: levelFromXp(xp),
      hp: maxHp,
      maxHp,
      weaponClass: deriveWeaponClass(data.primaryLanguage),
    },
    processedIds: newProcessedIds,
    activeMonster: queue[0] ?? null,
    monsterQueue: queue.slice(1),
    events: mapToCombatEvents(newCommits, newPrs, []),
    logEntries: [
      ...newCommits.map((commit) =>
        createLogEntry('combat.commitXp', {
          sha: commit.sha.slice(0, 7),
          xp: commitXp(commit),
        })
      ),
      ...newPrs.map((pr) => createLogEntry('combat.prXp', { number: pr.number, xp: PR_XP })),
    ],
  };
}

export const useGameStore = create<GameStoreState>()(
  persist<GameStoreState, [], [], PersistedGameState>(
    (set, get) => ({
      ...initialData(),

      connect: async (slug, pat) => {
        setSandboxMode(false);
        const data = await fetchRepoData(slug, pat);
        if (pat) sessionStorage.setItem(PAT_STORAGE_KEY, pat);

        const mapped = mapRepoData(data, get().hero, get().processedIds);
        set((state) => ({
          repoSlug: data.slug,
          connected: true,
          sandboxMode: false,
          hero: mapped.hero,
          activeMonster: mapped.activeMonster,
          monsterQueue: mapped.monsterQueue,
          processedIds: mapped.processedIds,
          pendingEvents: [...state.pendingEvents, ...mapped.events],
          combatLog: [...mapped.logEntries, ...state.combatLog].slice(0, MAX_LOG_ENTRIES),
        }));
      },

      launchSandbox: () => {
        setSandboxMode(true);
        sessionStorage.removeItem(PAT_STORAGE_KEY);
        const data = getSandboxData();
        const mapped = mapRepoData(data, get().hero, get().processedIds);
        set((state) => ({
          repoSlug: data.slug,
          connected: true,
          sandboxMode: true,
          hero: mapped.hero,
          activeMonster: mapped.activeMonster,
          monsterQueue: mapped.monsterQueue,
          processedIds: mapped.processedIds,
          pendingEvents: [...state.pendingEvents, ...mapped.events],
          combatLog: [...mapped.logEntries, ...state.combatLog].slice(0, MAX_LOG_ENTRIES),
        }));
      },

      simulateCommit: () => {
        const state = get();
        if (!state.sandboxMode) return;

        const data = getSandboxData();
        const commit = data.commits[Math.floor(Math.random() * data.commits.length)];
        if (!commit) return;

        const xp = commitXp(commit);
        const damage = xp;
        const timestamp = Date.now();

        set({
          hero: awardXp(state.hero, xp),
          activeMonster: damageMonster(state.activeMonster, damage),
          attacking: true,
          pendingEvents: [
            ...state.pendingEvents,
            { type: 'xpGain', xp, timestamp },
            { type: 'heroAttack', damage, timestamp },
          ],
          combatLog: [
            createLogEntry('combat.commitXp', { sha: commit.sha.slice(0, 7), xp }),
            ...state.combatLog,
          ].slice(0, MAX_LOG_ENTRIES),
        });
      },

      simulatePrMerge: () => {
        const state = get();
        if (!state.sandboxMode) return;

        const pr = getSandboxData().mergedPrs[0];
        if (!pr) return;

        const timestamp = Date.now();

        set({
          hero: awardXp(state.hero, PR_XP),
          activeMonster: damageMonster(state.activeMonster, PR_XP),
          attacking: true,
          pendingEvents: [
            ...state.pendingEvents,
            { type: 'xpGain', xp: PR_XP, timestamp },
            { type: 'heroAttack', damage: PR_XP, timestamp },
          ],
          combatLog: [
            createLogEntry('combat.prXp', { number: pr.number, xp: PR_XP }),
            ...state.combatLog,
          ].slice(0, MAX_LOG_ENTRIES),
        });
      },

      simulateIssueClose: () => {
        const state = get();
        if (!state.sandboxMode) return;

        const monster = state.activeMonster;
        if (!monster) return;

        const [nextMonster, ...rest] = state.monsterQueue;
        const timestamp = Date.now();

        set({
          hero: { ...state.hero, gold: state.hero.gold + monster.goldReward },
          activeMonster: nextMonster ?? null,
          monsterQueue: rest,
          pendingEvents: [
            ...state.pendingEvents,
            { type: 'monsterDefeated', gold: monster.goldReward, timestamp },
          ],
          combatLog: [
            createLogEntry('combat.monsterDefeated', {
              monster: monster.name,
              gold: monster.goldReward,
            }),
            ...state.combatLog,
          ].slice(0, MAX_LOG_ENTRIES),
        });
      },

      setMuted: (muted) => set({ muted }),

      setAttacking: (attacking) => set({ attacking }),

      addCombatLogEntry: (entry) =>
        set((state) => ({
          combatLog: [entry, ...state.combatLog].slice(0, MAX_LOG_ENTRIES),
        })),

      advanceMonsterQueue: () => {
        const [nextMonster, ...rest] = get().monsterQueue;
        if (!nextMonster) return;
        set({ activeMonster: nextMonster, monsterQueue: rest });
      },

      drainCombatEvents: () => {
        const events = get().pendingEvents;
        if (events.length === 0) return [];
        set({ pendingEvents: [] });
        return events;
      },

      reset: () => {
        setSandboxMode(false);
        sessionStorage.removeItem(PAT_STORAGE_KEY);
        localStorage.removeItem(STORE_STORAGE_KEY);
        set(initialData());
      },
    }),
    {
      name: STORE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedGameState => ({
        repoSlug: state.repoSlug,
        connected: state.connected,
        sandboxMode: state.sandboxMode,
        hero: state.hero,
        muted: state.muted,
        processedIds: [...state.processedIds],
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<PersistedGameState> | undefined;
        return {
          ...current,
          ...saved,
          processedIds: new Set(saved?.processedIds ?? []),
        };
      },
    }
  )
);
