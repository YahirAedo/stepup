import { describe, expect, it } from 'vitest';
import { migrationFlags } from './migration';

describe('migrationFlags', () => {
  it('expone exactamente las cinco áreas de la migración', () => {
    expect(Object.keys(migrationFlags).sort()).toEqual([
      'auth',
      'focus',
      'profile',
      'tabs',
      'tasks',
    ]);
  });

  it('todas las banderas son booleanas', () => {
    for (const value of Object.values(migrationFlags)) {
      expect(typeof value).toBe('boolean');
    }
  });
});
