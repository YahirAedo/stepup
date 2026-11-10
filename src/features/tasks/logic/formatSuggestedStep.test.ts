import { describe, expect, it } from 'vitest';
import { formatSuggestedStep } from './formatSuggestedStep';

describe('formatSuggestedStep', () => {
  it('antepone "Recomendación: " al nombre', () => {
    expect(formatSuggestedStep('Leer el capítulo 1')).toBe('Recomendación: Leer el capítulo 1');
  });

  it('recorta espacios alrededor del nombre', () => {
    expect(formatSuggestedStep('  Leer  ')).toBe('Recomendación: Leer');
  });
});