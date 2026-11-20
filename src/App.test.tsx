import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import './lib/i18n';
import App from './App';
import { useGameStore } from './store/useGameStore';

const { startMock, stopMock, renderMock } = vi.hoisted(() => ({
  startMock: vi.fn(),
  stopMock: vi.fn(),
  renderMock: vi.fn(),
}));

vi.mock('./engine/GameLoop', () => ({
  GameLoop: { start: startMock, stop: stopMock, render: renderMock },
}));

class ResizeObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  useGameStore.getState().reset();
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('App', () => {
  it('mounts the canvas and starts the game loop on mount', () => {
    const { container } = render(<App />);
    const canvas = container.querySelector('canvas');

    expect(canvas).not.toBeNull();
    expect(startMock).toHaveBeenCalledTimes(1);
    expect(startMock).toHaveBeenCalledWith(canvas);
    expect(renderMock).toHaveBeenCalled();
  });

  it('stops the loop and disconnects the resize observer on unmount', () => {
    const { unmount } = render(<App />);

    unmount();

    expect(stopMock).toHaveBeenCalledTimes(1);
  });

  it('shows the connect modal on load', () => {
    render(<App />);

    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Simulate Commit' })).toBeNull();
  });

  it('closes the modal and shows sandbox controls after launching the sandbox', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Launch Dungeon Sandbox' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Simulate Commit' })).toBeDefined();
  });

  it('renders the HUD and the combat log around the canvas', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Hero' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Combat Log' })).toBeDefined();
    expect(screen.getByRole('img', { name: 'Dungeon viewport' })).toBeDefined();
  });
});
