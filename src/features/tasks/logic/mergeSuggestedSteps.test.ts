import { describe, it, expect } from 'vitest';
import { mergeSuggestedSteps } from './mergeSuggestedSteps';

describe('mergeSuggestedSteps', () => {
  it('sugerencias válidas sin duplicados', () => {
    const result = mergeSuggestedSteps(['Paso A'], [{ name: 'Paso B', duration_min: 3 }, { name: 'Paso C', duration_min: 2.6 }]);
    expect(result.steps).toEqual([
      { name: 'Paso B', duration: 3 },
      { name: 'Paso C', duration: 3 },
    ]);
    expect(result.skipped).toBe(0);
  });

  it('nombre vacío descarta', () => {
    const result = mergeSuggestedSteps([], [{ name: '  ', duration_min: 3 }]);
    expect(result.steps).toHaveLength(0);
    expect(result.skipped).toBe(1);
  });

  it('duración < 1 descarta', () => {
    const result = mergeSuggestedSteps([], [{ name: 'Paso', duration_min: 0.4 }]);
    expect(result.steps).toHaveLength(0);
    expect(result.skipped).toBe(1);
  });

  it('duración 0 descarta', () => {
    const result = mergeSuggestedSteps([], [{ name: 'Paso', duration_min: 0 }]);
    expect(result.steps).toHaveLength(0);
    expect(result.skipped).toBe(1);
  });

  it('duración no finita descarta', () => {
    const result = mergeSuggestedSteps([], [{ name: 'Paso', duration_min: NaN }]);
    expect(result.skipped).toBe(1);
  });

  it('duplicado vs existente descarta', () => {
    const result = mergeSuggestedSteps(['Paso'], [{ name: 'paso', duration_min: 2 }]);
    expect(result.steps).toHaveLength(0);
    expect(result.skipped).toBe(1);
  });

  it('duplicado interno descarta (mantiene primero)', () => {
    const result = mergeSuggestedSteps([], [
      { name: 'Paso', duration_min: 2 },
      { name: 'paso', duration_min: 3 },
    ]);
    expect(result.steps).toEqual([{ name: 'Paso', duration: 2 }]);
    expect(result.skipped).toBe(1);
  });

  it('mayúsculas y espacios', () => {
    const result = mergeSuggestedSteps(['  paso  '], [{ name: ' PASO ', duration_min: 5 }]);
    expect(result.skipped).toBe(1);
  });

  it('conserva orden', () => {
    const result = mergeSuggestedSteps(['X'], [
      { name: 'A', duration_min: 1 },
      { name: 'B', duration_min: 2 },
    ]);
    expect(result.steps.map((s) => s.name)).toEqual(['A', 'B']);
  });
});
