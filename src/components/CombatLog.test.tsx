import { act, cleanup, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import '../lib/i18n';
import { useGameStore } from '../store/useGameStore';
import type { CombatLogEntry } from '../types';
import { CombatLog } from './CombatLog';

const store = () => useGameStore.getState();

function entry(
  id: string,
  messageKey: string,
  params: Record<string, string | number>
): CombatLogEntry {
  return { id, timestamp: Date.now(), messageKey, params };
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  store().reset();
});

describe('CombatLog', () => {
  it('shows the empty state when there are no entries', () => {
    render(<CombatLog />);

    expect(screen.getByText('No events yet.')).toBeDefined();
  });

  it('renders translated entries newest first', () => {
    useGameStore.setState({
      combatLog: [
        entry('b', 'combat.prXp', { number: 42, xp: 50 }),
        entry('a', 'combat.commitXp', { sha: 'abc1234', xp: 59 }),
      ],
    });

    render(<CombatLog />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]?.textContent).toContain('PR #42 merged. +50 XP.');
    expect(items[1]?.textContent).toContain('Commit abc1234 awarded 59 XP.');
  });

  it('renders the timestamp of each entry', () => {
    useGameStore.setState({
      combatLog: [entry('a', 'combat.commitXp', { sha: 'abc1234', xp: 59 })],
    });

    const { container } = render(<CombatLog />);
    const time = container.querySelector('time');

    expect(time).not.toBeNull();
    expect(time?.dateTime).toBe(new Date(store().combatLog[0]?.timestamp ?? 0).toISOString());
  });

  it('scrolls back to the newest entry when the log changes', () => {
    useGameStore.setState({
      combatLog: [entry('a', 'combat.commitXp', { sha: 'abc1234', xp: 59 })],
    });

    render(<CombatLog />);
    const list = screen.getByRole('list');
    list.scrollTop = 120;

    act(() => {
      useGameStore.setState({
        combatLog: [entry('b', 'combat.prXp', { number: 42, xp: 50 }), ...store().combatLog],
      });
    });

    expect(list.scrollTop).toBe(0);
  });
});
