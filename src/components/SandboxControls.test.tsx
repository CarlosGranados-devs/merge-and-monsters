import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import '../lib/i18n';
import { useGameStore } from '../store/useGameStore';
import { SandboxControls } from './SandboxControls';

const store = () => useGameStore.getState();

beforeEach(() => {
  cleanup();
  localStorage.clear();
  store().reset();
});

describe('SandboxControls', () => {
  it('renders nothing outside sandbox mode', () => {
    const { container } = render(<SandboxControls />);

    expect(container.innerHTML).toBe('');
  });

  it('runs the three sandbox simulations', () => {
    store().launchSandbox();
    store().drainCombatEvents();
    render(<SandboxControls />);

    const xpBefore = store().hero.xp;
    const monsterBefore = store().activeMonster?.issueNumber;

    fireEvent.click(screen.getByRole('button', { name: 'Simulate Commit' }));
    expect(store().hero.xp).toBeGreaterThan(xpBefore);

    fireEvent.click(screen.getByRole('button', { name: 'Simulate PR Merge' }));
    expect(store().pendingEvents.some((event) => event.type === 'heroAttack')).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Simulate Issue Close' }));
    expect(store().activeMonster?.issueNumber).not.toBe(monsterBefore);
  });

  it('disables every control when the disabled prop is set', () => {
    store().launchSandbox();
    render(<SandboxControls disabled />);

    for (const button of screen.getAllByRole('button')) {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    }
  });
});
