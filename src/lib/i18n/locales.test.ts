import { describe, expect, it } from 'vitest';
import en from './locales/en.json';
import es from './locales/es.json';

function collectKeys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    collectKeys(child, prefix ? `${prefix}.${key}` : key)
  );
}

function collectValues(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value !== 'object' || value === null) return [];

  return Object.values(value as Record<string, unknown>).flatMap(collectValues);
}

describe('locales', () => {
  it('es.json has exactly the same keys as en.json', () => {
    const english = collectKeys(en).sort();
    const spanish = collectKeys(es).sort();

    expect(spanish).toEqual(english);
  });

  it('has no empty translations', () => {
    for (const value of [...collectValues(en), ...collectValues(es)]) {
      expect(value.trim().length).toBeGreaterThan(0);
    }
  });
});
