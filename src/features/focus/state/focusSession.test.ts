import { describe, expect, it, beforeEach } from 'vitest';
import {
  getManualTaskId,
  setManualTaskId,
  getPostponedIds,
  postponeInSession,
  clearPostponed,
  resetFocusSession,
} from './focusSession';

describe('focusSession', () => {
  beforeEach(() => {
    resetFocusSession();
  });

  it('valores iniciales', () => {
    expect(getManualTaskId()).toBeNull();
    expect(getPostponedIds()).toEqual([]);
  });

  it('set/get de la tarea manual', () => {
    setManualTaskId(5);
    expect(getManualTaskId()).toBe(5);
    setManualTaskId(null);
    expect(getManualTaskId()).toBeNull();
  });

  it('postponer agrega y re-posponer mueve al final sin duplicar', () => {
    postponeInSession(1);
    postponeInSession(2);
    expect(getPostponedIds()).toEqual([1, 2]);
    postponeInSession(1);
    expect(getPostponedIds()).toEqual([2, 1]);
  });

  it('getPostponedIds devuelve copia (mutarla no afecta el estado)', () => {
    postponeInSession(1);
    const copy = getPostponedIds();
    copy.push(999);
    expect(getPostponedIds()).toEqual([1]);
  });

  it('reset limpia todo', () => {
    setManualTaskId(7);
    postponeInSession(3);
    resetFocusSession();
    expect(getManualTaskId()).toBeNull();
    expect(getPostponedIds()).toEqual([]);
  });

  it('clearPostponed limpia pospuestos', () => {
    postponeInSession(1);
    clearPostponed();
    expect(getPostponedIds()).toEqual([]);
  });
});
