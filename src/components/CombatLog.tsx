import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/useGameStore';

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

export function CombatLog() {
  const { t } = useTranslation();
  const entries = useGameStore((state) => state.combatLog);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (entries.length > 0 && listRef.current) listRef.current.scrollTop = 0;
  }, [entries]);

  return (
    <section aria-labelledby="combat-log-title" className="rounded-lg border border-gold/40 bg-bg">
      <h2
        id="combat-log-title"
        className="border-b border-gold/20 px-4 py-2 text-xs uppercase tracking-widest text-muted"
      >
        {t('combat.title')}
      </h2>

      {entries.length === 0 ? (
        <p className="px-4 py-3 text-sm text-muted">{t('combat.empty')}</p>
      ) : (
        <ol
          ref={listRef}
          className="scrollbar-thin flex h-40 flex-col gap-1 overflow-y-auto p-3 font-mono text-xs"
        >
          {entries.map((entry) => (
            <li key={entry.id} className="flex gap-2">
              <time
                dateTime={new Date(entry.timestamp).toISOString()}
                className="shrink-0 text-muted"
              >
                {formatTimestamp(entry.timestamp)}
              </time>
              <span className="text-text">{t(entry.messageKey, entry.params)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
