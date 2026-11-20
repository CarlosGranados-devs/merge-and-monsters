import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import './lib/i18n';
import App from './App';

const { startMock, stopMock } = vi.hoisted(() => ({
  startMock: vi.fn(),
  stopMock: vi.fn(),
}));

vi.mock('./engine/GameLoop', () => ({
  GameLoop: { start: startMock, stop: stopMock },
}));

class ResizeObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

beforeEach(() => {
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
  });

  it('stops the loop and disconnects the resize observer on unmount', () => {
    const { unmount } = render(<App />);

    unmount();

    expect(stopMock).toHaveBeenCalledTimes(1);
  });
});
