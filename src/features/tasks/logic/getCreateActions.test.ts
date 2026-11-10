import { describe, expect, it } from 'vitest';
import { getCreateActions } from './getCreateActions';

describe('getCreateActions', () => {
  it('con título y pasos habilita ambas', () => {
    expect(getCreateActions({ title: 'T', stepsCount: 2, isSaving: false })).toEqual({
      canSave: true,
      canSaveAndStart: true,
    });
  });

  it('con título y sin pasos solo habilita guardar', () => {
    expect(getCreateActions({ title: 'T', stepsCount: 0, isSaving: false })).toEqual({
      canSave: true,
      canSaveAndStart: false,
    });
  });

  it('sin título no habilita ninguna', () => {
    expect(getCreateActions({ title: '   ', stepsCount: 3, isSaving: false })).toEqual({
      canSave: false,
      canSaveAndStart: false,
    });
  });

  it('guardando no habilita ninguna', () => {
    expect(getCreateActions({ title: 'T', stepsCount: 1, isSaving: true })).toEqual({
      canSave: false,
      canSaveAndStart: false,
    });
  });
});
