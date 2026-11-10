import { describe, expect, it } from 'vitest';
import { canOrderSteps } from './canOrderSteps';

describe('canOrderSteps', () => {
  it('true >= 3', () => {
    expect(canOrderSteps(3)).toBe(true);
    expect(canOrderSteps(5)).toBe(true);
  });
  it('false < 3', () => {
    expect(canOrderSteps(2)).toBe(false);
    expect(canOrderSteps(0)).toBe(false);
  });
});
