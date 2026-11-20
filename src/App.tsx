import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GameLoop } from './engine/GameLoop';

function App() {
  const { t } = useTranslation();
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
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gold mb-2">Merge & Monsters</h1>
        <p className="text-muted">{t('connect.title')}</p>
      </div>

      <div
        ref={containerRef}
        className="relative w-full max-w-4xl aspect-video border-2 border-gold rounded-lg overflow-hidden"
      >
        <canvas ref={canvasRef} className="block w-full h-full bg-bg" />
        <div className="absolute bottom-4 left-4 right-4 p-4 bg-bg/90 backdrop-blur-sm border border-gold/30 rounded">
          <div className="text-center">
            <p className="text-gold font-mono text-sm">
              v0.1.0 • {t('hud.hero')}: ??? • {t('hud.hp')}: ???/??? • {t('hud.xp')}: ???
            </p>
            <p className="text-muted text-xs mt-1">
              This is a placeholder. The real HUD will appear after scaffolding.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-muted text-sm">
        <p>R02: feature/0.1.0-scaffold-Y • pnpm dev • build passes • ready for next branch</p>
      </div>
    </div>
  );
}

export default App;
