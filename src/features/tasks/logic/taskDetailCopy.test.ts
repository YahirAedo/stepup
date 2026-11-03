import { describe, it, expect } from 'vitest';
import { taskDetailCopy } from './taskDetailCopy';

describe('getCompleteDialogBody', () => {
  it('1 paso pendiente → singular', () => {
    expect(
      taskDetailCopy.getCompleteDialogBody(1),
    ).toBe('Se va a marcar el paso pendiente como hecho.');
  });

  it('2 pasos pendientes → plural', () => {
    expect(
      taskDetailCopy.getCompleteDialogBody(2),
    ).toBe('Se van a marcar los 2 pasos pendientes como hechos.');
  });

  it('5 pasos pendientes → plural', () => {
    expect(
      taskDetailCopy.getCompleteDialogBody(5),
    ).toBe('Se van a marcar los 5 pasos pendientes como hechos.');
  });
});