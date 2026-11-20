import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CombatLog } from './components/CombatLog';
import { HeroHud } from './components/HeroHud';
import { RepoConnectModal } from './components/RepoConnectModal';
import { SandboxControls } from './components/SandboxControls';
import { GameLoop } from './engine/GameLoop';
import { useGameStore } from './store/useGameStore';

function App() {
  const { t } = useTranslation();
  const connected = useGameStore((state) => state.connected);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      GameLoop.render();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    GameLoop.start(canvas);

    return () => {
      observer.disconnect();
      GameLoop.stop();
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <header className="border-b border-gold/30 px-4 py-3">
        <h1 className="text-xl font-bold text-gold">{t('app.title')}</h1>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-4 lg:flex-row">
        <aside className="shrink-0 lg:w-64">
          <HeroHud />
        </aside>

        <section className="flex min-w-0 flex-1 flex-col gap-4">
          <div
            ref={containerRef}
            className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-gold"
          >
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={t('app.canvasLabel')}
              className="block h-full w-full"
            />
          </div>
          <SandboxControls />
          <CombatLog />
        </section>
      </main>

      {connected ? null : <RepoConnectModal />}
    </div>
  );
}

export default App;
