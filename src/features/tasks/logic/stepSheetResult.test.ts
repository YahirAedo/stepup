import { describe, it, expect } from 'vitest';
import { applyStepSheetResult, getStepSheetPosition } from './stepSheetResult';
import type { DraftStep } from './stepSheetResult';

const step = (key: string, name: string, duration_min: number | null = 3): DraftStep => ({
  key,
  id: key.startsWith('manual') ? null : parseInt(key.replace('s', ''), 10) || null,
  name,
  duration_min,
});

describe('applyStepSheetResult', () => {
  it('create: agrega al final con id null, key única y duración', () => {
    const steps = [step('s1', 'Paso uno', 3), step('s2', 'Paso dos', 5)];
    const result = applyStepSheetResult(steps, { mode: 'create' }, { title: 'Nuevo paso', duration: 4 }, 'manual-1');
    expect(result).toEqual([
      { key: 's1', id: 1, name: 'Paso uno', duration_min: 3 },
      { key: 's2', id: 2, name: 'Paso dos', duration_min: 5 },
      { key: 'manual-1', id: null, name: 'Nuevo paso', duration_min: 4 },
    ]);
  });

  it('edit: actualiza solo el paso de esa key', () => {
    const steps = [step('s1', 'Paso uno', 3), step('s2', 'Paso dos', 5)];
    const result = applyStepSheetResult(steps, { mode: 'edit', key: 's1' }, { title: 'Paso uno editado', duration: 10 }, 'manual-1');
    expect(result).toEqual([
      { key: 's1', id: 1, name: 'Paso uno editado', duration_min: 10 },
      { key: 's2', id: 2, name: 'Paso dos', duration_min: 5 },
    ]);
  });

  it('key inexistente: deja la lista igual', () => {
    const steps = [step('s1', 'Paso uno', 3), step('s2', 'Paso dos', 5)];
    const result = applyStepSheetResult(steps, { mode: 'edit', key: 'no-existe' }, { title: 'X', duration: 1 }, 'manual-1');
    expect(result).toEqual(steps);
  });

  it('no muta la entrada', () => {
    const steps = [step('s1', 'Paso uno', 3)];
    const original = [...steps];
    applyStepSheetResult(steps, { mode: 'create' }, { title: 'Nuevo', duration: 2 }, 'manual-2');
    expect(steps).toEqual(original);
  });

  it('el nombre se guarda recortado', () => {
    const steps = [step('s1', 'Paso uno', 3)];
    const result = applyStepSheetResult(steps, { mode: 'edit', key: 's1' }, { title: '  Paso recortado  ', duration: 3 }, 'manual-1');
    expect(result[0].name).toBe('Paso recortado');
  });

  it('target null: devuelve copia sin cambios', () => {
    const steps = [step('s1', 'Paso uno', 3)];
    const result = applyStepSheetResult(steps, null, { title: 'X', duration: 1 }, 'manual-1');
    expect(result).toEqual(steps);
    expect(result).not.toBe(steps);
  });
});

describe('getStepSheetPosition', () => {
  it('create con 0 pasos → (1, 1)', () => {
    expect(getStepSheetPosition([], new Set(), { mode: 'create' })).toEqual({ position: 1, total: 1 });
  });

  it('create con 3 pasos → (4, 4)', () => {
    const steps = [step('s1', 'A', 3), step('s2', 'B', 5), step('s3', 'C', 2)];
    expect(getStepSheetPosition(steps, new Set(), { mode: 'create' })).toEqual({ position: 4, total: 4 });
  });

  it('edit del primero → (1, n)', () => {
    const steps = [step('s1', 'A', 3), step('s2', 'B', 5), step('s3', 'C', 2)];
    expect(getStepSheetPosition(steps, new Set(), { mode: 'edit', key: 's1' })).toEqual({ position: 1, total: 3 });
  });

  it('edit de uno del medio → posición real', () => {
    const steps = [step('s1', 'A', 3), step('s2', 'B', 5), step('s3', 'C', 2)];
    expect(getStepSheetPosition(steps, new Set(), { mode: 'edit', key: 's2' })).toEqual({ position: 2, total: 3 });
  });

  it('edit con pasos marcados para borrar (no cuentan)', () => {
    const steps = [step('s1', 'A', 3), step('s2', 'B', 5), step('s3', 'C', 2)];
    const pending = new Set(['s2']);
    // visible = [s1, s3], s2 está marcado para borrar
    // edit de s1 → posición 1 entre visibles, total 2
    expect(getStepSheetPosition(steps, pending, { mode: 'edit', key: 's1' })).toEqual({ position: 1, total: 2 });
  });

  it('edit con pasos marcados para borrar, edit del no-borrado del medio', () => {
    const steps = [step('s1', 'A', 3), step('s2', 'B', 5), step('s3', 'C', 2), step('s4', 'D', 4)];
    const pending = new Set(['s2']);
    // visible = [s1, s3, s4]
    // edit de s3 → posición 2, total 3
    expect(getStepSheetPosition(steps, pending, { mode: 'edit', key: 's3' })).toEqual({ position: 2, total: 3 });
  });

  it('create con pasos marcados para borrar → total visible + 1', () => {
    const steps = [step('s1', 'A', 3), step('s2', 'B', 5), step('s3', 'C', 2)];
    const pending = new Set(['s2']);
    // visible = [s1, s3], n = 2
    expect(getStepSheetPosition(steps, pending, { mode: 'create' })).toEqual({ position: 3, total: 3 });
  });

  it('target null → create (n+1, n+1)', () => {
    const steps = [step('s1', 'A', 3)];
    expect(getStepSheetPosition(steps, new Set(), null)).toEqual({ position: 2, total: 2 });
  });
});
