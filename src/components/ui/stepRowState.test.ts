import { describe, it, expect } from 'vitest';
import { getStepRowState } from './stepRowState';

describe('getStepRowState', () => {
  it('pendiente sin onPress: no disabled, no dimmed, sin check, label = name', () => {
    const s = getStepRowState({ name: 'Paso', completed: false, pendingDelete: false, readOnly: false, hasOnPress: false });
    expect(s).toEqual({ disabled: false, dimmed: false, showCheck: false, a11yLabel: 'Paso' });
  });

  it('pendiente con onPress: igual que sin onPress (interactivo)', () => {
    const s = getStepRowState({ name: 'Paso', completed: false, pendingDelete: false, readOnly: false, hasOnPress: true });
    expect(s.disabled).toBe(false);
    expect(s.dimmed).toBe(false);
    expect(s.showCheck).toBe(false);
    expect(s.a11yLabel).toBe('Paso');
  });

  it('completado CON onPress: no disabled, no dimmed, showCheck, label "hecho"', () => {
    const s = getStepRowState({ name: 'Paso', completed: true, pendingDelete: false, readOnly: false, hasOnPress: true });
    expect(s).toEqual({ disabled: false, dimmed: false, showCheck: true, a11yLabel: 'Paso, hecho' });
  });

  it('completado SIN onPress: disabled, dimmed, showCheck, label "hecho"', () => {
    const s = getStepRowState({ name: 'Paso', completed: true, pendingDelete: false, readOnly: false, hasOnPress: false });
    expect(s).toEqual({ disabled: true, dimmed: true, showCheck: true, a11yLabel: 'Paso, hecho' });
  });

  it('readOnly con completado: disabled, dimmed, showCheck', () => {
    const s = getStepRowState({ name: 'Paso', completed: true, pendingDelete: false, readOnly: true, hasOnPress: true });
    expect(s.disabled).toBe(true);
    expect(s.dimmed).toBe(true);
    expect(s.showCheck).toBe(true);
  });

  it('readOnly con pendiente: disabled, dimmed, sin check', () => {
    const s = getStepRowState({ name: 'Paso', completed: false, pendingDelete: false, readOnly: true, hasOnPress: true });
    expect(s.disabled).toBe(true);
    expect(s.dimmed).toBe(true);
    expect(s.showCheck).toBe(false);
  });

  it('pendingDelete sobre pendiente: label de borrado, disabled, dimmed, sin check', () => {
    const s = getStepRowState({ name: 'Paso', completed: false, pendingDelete: true, readOnly: false, hasOnPress: true });
    expect(s).toEqual({ disabled: true, dimmed: true, showCheck: false, a11yLabel: 'Paso, marcado para borrar' });
  });

  it('pendingDelete + completed: label de borrado, sin check', () => {
    const s = getStepRowState({ name: 'Paso', completed: true, pendingDelete: true, readOnly: false, hasOnPress: true });
    expect(s).toEqual({ disabled: true, dimmed: true, showCheck: false, a11yLabel: 'Paso, marcado para borrar' });
  });
});
