import { describe, it, expect } from 'vitest';
import { validateStepEdit } from './validateStepEdit';

describe('validateStepEdit', () => {
  it('nombre válido y duración válida → ok', () => {
    expect(validateStepEdit('Escribir reporte', 15)).toEqual({ ok: true });
  });

  it('nombre vacío → error', () => {
    expect(validateStepEdit('', 15)).toEqual({ ok: false, error: 'El nombre no puede estar vacío' });
  });

  it('nombre solo espacios → error', () => {
    expect(validateStepEdit('   ', 15)).toEqual({ ok: false, error: 'El nombre no puede estar vacío' });
  });

  it('duración 0 → error', () => {
    expect(validateStepEdit('Hacer X', 0)).toEqual({ ok: false, error: 'La duración debe ser al menos 1 minuto' });
  });

  it('duración negativa → error', () => {
    expect(validateStepEdit('Hacer X', -5)).toEqual({ ok: false, error: 'La duración debe ser al menos 1 minuto' });
  });

  it('duración null → error', () => {
    expect(validateStepEdit('Hacer X', null)).toEqual({ ok: false, error: 'La duración debe ser al menos 1 minuto' });
  });

  it('duración 1 → ok', () => {
    expect(validateStepEdit('Hacer X', 1)).toEqual({ ok: true });
  });
});
