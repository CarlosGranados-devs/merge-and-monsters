import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas sizing
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Draw placeholder
      ctx.fillStyle = 'var(--color-bg)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'var(--color-gold)';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Merge & Monsters', canvas.width / 2, canvas.height / 2 - 30);

      ctx.font = '16px monospace';
      ctx.fillStyle = 'var(--color-text)';
      ctx.fillText(
        'Canvas placeholder — game engine will render here',
        canvas.width / 2,
        canvas.height / 2 + 20
      );
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gold mb-2">Merge & Monsters</h1>
        <p className="text-muted">{t('connect.title')}</p>
      </div>

      <div className="relative w-full max-w-4xl aspect-video border-2 border-gold rounded-lg overflow-hidden">
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
