import { describe, it, expect } from 'vitest';
import { buildNewDraftSteps } from './buildNewDraftSteps';

describe('buildNewDraftSteps', () => {
  it('0 pasos → vacío y nextSeq igual', () => {
    const r = buildNewDraftSteps(5, []);
    expect(r.steps).toEqual([]);
    expect(r.nextSeq).toBe(5);
  });

  it('1 paso → key manual-6, id null, pending', () => {
    const r = buildNewDraftSteps(5, [{ name: 'Paso A', duration: 3 }]);
    expect(r.steps).toHaveLength(1);
    expect(r.steps[0].key).toBe('manual-6');
    expect(r.steps[0].id).toBeNull();
    expect(r.steps[0].status).toBe('pending');
    expect(r.steps[0].name).toBe('Paso A');
    expect(r.steps[0].duration_min).toBe(3);
    expect(r.nextSeq).toBe(6);
  });

  it('3 pasos → keys consecutivas únicas', () => {
    const r = buildNewDraftSteps(2, [
      { name: 'Paso 1', duration: 2 },
      { name: 'Paso 2', duration: 4 },
      { name: 'Paso 3', duration: 1 },
    ]);
    expect(r.steps.map((s) => s.key)).toEqual(['manual-3', 'manual-4', 'manual-5']);
    expect(r.nextSeq).toBe(5);
  });

  it('trim en nombre', () => {
    const r = buildNewDraftSteps(0, [{ name: '  Paso  ', duration: 2 }]);
    expect(r.steps[0].name).toBe('Paso');
  });
});
