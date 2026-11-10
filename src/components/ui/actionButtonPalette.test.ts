import { describe, expect, it } from 'vitest';
import { getActionButtonPalette } from './actionButtonPalette';

describe('getActionButtonPalette', () => {
  it('primary', () => {
    expect(getActionButtonPalette('primary')).toEqual({
      background: 'primary-container',
      content: 'on-primary',
    });
  });

  it('secondary', () => {
    expect(getActionButtonPalette('secondary')).toEqual({
      background: 'on-secondary-container',
      content: 'on-primary',
    });
  });
});