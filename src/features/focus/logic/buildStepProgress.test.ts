import { describe, expect, it } from 'vitest';
import { buildStepProgress } from './buildStepProgress';

describe('buildStepProgress', () => {
  it('3 pasos con stepIndex 1 => 3 segmentos todos pendientes', () => {
    const result = buildStepProgress(1, 3);
    expect(result.kind).toBe('segments');
    if (result.kind === 'segments') {
      expect(result.statuses).toEqual(['pending', 'pending', 'pending']);
    }
  });

  it('stepIndex 3 de 3 => 2 done y 1 pending', () => {
    const result = buildStepProgress(3, 3);
    expect(result.kind).toBe('segments');
    if (result.kind === 'segments') {
      expect(result.statuses).toEqual(['done', 'done', 'pending']);
    }
  });

  it('10 pasos => continuous con proporción (stepIndex-1)/10', () => {
    const result = buildStepProgress(2, 10);
    expect(result.kind).toBe('continuous');
    if (result.kind === 'continuous') {
      expect(result.proportion).toBeCloseTo(0.1);
    }
  });

  it('totalSteps 0 => continuous con proporción 0', () => {
    const result = buildStepProgress(1, 0);
    expect(result.kind).toBe('continuous');
    if (result.kind === 'continuous') {
      expect(result.proportion).toBe(0);
    }
  });
});
