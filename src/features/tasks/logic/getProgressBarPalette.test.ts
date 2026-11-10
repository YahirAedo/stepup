import { describe, expect, it } from 'vitest';
import { getProgressBarPalette } from './getProgressBarPalette';

describe('getProgressBarPalette', () => {
  it('default conserva el mapeo actual', () => {
    expect(getProgressBarPalette('default')).toEqual({
      done: 'primary-container',
      current: 'secondary-container',
      pending: 'surface-container-high',
      track: 'surface-container-high',
      fill: 'primary-container',
    });
  });

  it('onDark devuelve las claves esperadas', () => {
    expect(getProgressBarPalette('onDark')).toEqual({
      done: 'on-primary-container',
      current: 'on-primary',
      pending: 'primary',
      track: 'primary',
      fill: 'on-primary',
    });
  });

  it('en onDark done, current y pending son tres tokens distintos', () => {
    const palette = getProgressBarPalette('onDark');
    expect(new Set([palette.done, palette.current, palette.pending]).size).toBe(3);
  });
});