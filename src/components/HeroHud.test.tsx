import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import '../lib/i18n';
import { useGameStore } from '../store/useGameStore';
import type { HeroState } from '../types';
import { HeroHud } from './HeroHud';

const store = () => useGameStore.getState();

const HERO: HeroState = {
  name: 'Yona the Blade',
  xp: 150,
  level: 2,
  hp: 50,
  maxHp: 200,
  gold: 12,
  weaponClass: 'strictBlade',
};

beforeEach(() => {
  cleanup();
  localStorage.clear();
  store().reset();
});

describe('HeroHud', () => {
  it('renders the hero stats from the store', () => {
    useGameStore.setState({ hero: HERO });
    render(<HeroHud />);

    expect(screen.getByText('Yona the Blade')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
    expect(screen.getByText('Strict Blade')).toBeDefined();
    expect(screen.getByText('12')).toBeDefined();
    expect(screen.getByText('50/200')).toBeDefined();
    expect(screen.getByText('150 XP')).toBeDefined();
  });

  it('fills the HP bar with the current ratio', () => {
    useGameStore.setState({ hero: HERO });
    render(<HeroHud />);

    const hpBar = screen.getByRole('progressbar', { name: 'HP' });
    const fill = hpBar.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe('25%');
  });

  it('fills the XP bar relative to the current level thresholds', () => {
    useGameStore.setState({ hero: HERO });
    render(<HeroHud />);

    // Level 2 spans 100 -> 300 XP, so 150 XP is 25%.
    const xpBar = screen.getByRole('progressbar', { name: 'XP' });
    const fill = xpBar.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe('25%');
    expect(fill.className).toContain('bg-xp-fill');
  });

  it('toggles the mute state and label', () => {
    render(<HeroHud />);

    const button = screen.getByRole('button', { name: 'Mute' });
    expect(button.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(button);

    expect(store().muted).toBe(true);
    expect(screen.getByRole('button', { name: 'Unmute' }).getAttribute('aria-pressed')).toBe(
      'true'
    );
  });
});
