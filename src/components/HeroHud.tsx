import { useTranslation } from 'react-i18next';
import { SoundSynth } from '../engine/SoundSynth';
import { useGameStore, xpThresholdForLevel } from '../store/useGameStore';

function ratio(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(1, value / max));
}

export function HeroHud() {
  const { t } = useTranslation();
  const hero = useGameStore((state) => state.hero);
  const muted = useGameStore((state) => state.muted);
  const setMuted = useGameStore((state) => state.setMuted);

  const hpRatio = ratio(hero.hp, hero.maxHp);
  const levelStart = xpThresholdForLevel(hero.level);
  const levelEnd = xpThresholdForLevel(hero.level + 1);
  const xpRatio = ratio(hero.xp - levelStart, levelEnd - levelStart);

  const toggleMute = () => {
    setMuted(!muted);
    SoundSynth.play('uiClick');
  };

  return (
    <section
      aria-labelledby="hero-hud-title"
      className="flex flex-col gap-4 rounded-lg border border-gold/40 bg-bg p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 id="hero-hud-title" className="text-xs uppercase tracking-widest text-muted">
            {t('hud.hero')}
          </h2>
          <p className="truncate text-lg font-bold text-text">{hero.name}</p>
        </div>
        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={muted}
          className="shrink-0 rounded border border-gold/40 px-2 py-1 text-xs text-gold hover:border-gold"
        >
          {muted ? t('hud.unmute') : t('hud.mute')}
        </button>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-muted">{t('hud.level')}</dt>
          <dd className="font-mono text-gold">{hero.level}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-muted">{t('hud.weapon')}</dt>
          <dd className="truncate font-mono text-text">{t(`weapon.${hero.weaponClass}`)}</dd>
        </div>
        <div>
          <dt className="text-muted">{t('hud.gold')}</dt>
          <dd className="font-mono text-gold">{hero.gold}</dd>
        </div>
      </dl>

      <div>
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-muted">{t('hud.hp')}</span>
          <span className="font-mono text-text">{`${hero.hp}/${hero.maxHp}`}</span>
        </div>
        <div
          role="progressbar"
          tabIndex={0}
          aria-label={t('hud.hp')}
          aria-valuemin={0}
          aria-valuemax={hero.maxHp}
          aria-valuenow={hero.hp}
          className="h-3 overflow-hidden rounded border border-gold/40 bg-black/40"
        >
          <div className="h-full bg-gold" style={{ width: `${hpRatio * 100}%` }} />
        </div>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-muted">{t('hud.xp')}</span>
          <span className="font-mono text-text">{`${hero.xp} ${t('hud.xp')}`}</span>
        </div>
        <div
          role="progressbar"
          tabIndex={0}
          aria-label={t('hud.xp')}
          aria-valuemin={levelStart}
          aria-valuemax={levelEnd}
          aria-valuenow={hero.xp}
          className="h-3 overflow-hidden rounded border border-gold/40 bg-black/40"
        >
          <div className="h-full bg-xp-fill" style={{ width: `${xpRatio * 100}%` }} />
        </div>
      </div>
    </section>
  );
}
