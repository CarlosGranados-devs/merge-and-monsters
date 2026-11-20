import { useTranslation } from 'react-i18next';
import { SoundSynth } from '../engine/SoundSynth';
import { useGameStore } from '../store/useGameStore';

interface SandboxControlsProps {
  /** Reserved for Checkpoint 3: disable the controls while an attack animation plays. */
  disabled?: boolean;
}

export function SandboxControls({ disabled = false }: SandboxControlsProps) {
  const { t } = useTranslation();
  const sandboxMode = useGameStore((state) => state.sandboxMode);
  const simulateCommit = useGameStore((state) => state.simulateCommit);
  const simulatePrMerge = useGameStore((state) => state.simulatePrMerge);
  const simulateIssueClose = useGameStore((state) => state.simulateIssueClose);

  if (!sandboxMode) return null;

  const run = (action: () => void) => () => {
    action();
    SoundSynth.play('uiClick');
  };

  const buttonClass =
    'rounded border border-gold/40 px-3 py-2 text-sm text-gold hover:border-gold disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <section
      aria-labelledby="sandbox-controls-title"
      className="flex flex-col gap-2 rounded-lg border border-gold/40 bg-bg p-4"
    >
      <h2 id="sandbox-controls-title" className="text-xs uppercase tracking-widest text-muted">
        {t('sandbox.title')}
      </h2>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={buttonClass}
          disabled={disabled}
          onClick={run(simulateCommit)}
        >
          {t('sandbox.simulateCommit')}
        </button>
        <button
          type="button"
          className={buttonClass}
          disabled={disabled}
          onClick={run(simulatePrMerge)}
        >
          {t('sandbox.simulatePr')}
        </button>
        <button
          type="button"
          className={buttonClass}
          disabled={disabled}
          onClick={run(simulateIssueClose)}
        >
          {t('sandbox.simulateIssue')}
        </button>
      </div>
    </section>
  );
}
