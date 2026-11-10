import { describe, expect, it } from 'vitest';
import { resolveStepMinutes, shouldKeepTimer, DEFAULT_STEP_MINUTES } from './stepTimer';

describe('resolveStepMinutes', () => {
  it('null, 0, negativo y 3', () => {
    expect(resolveStepMinutes(null)).toBe(DEFAULT_STEP_MINUTES);
    expect(resolveStepMinutes(0)).toBe(DEFAULT_STEP_MINUTES);
    expect(resolveStepMinutes(-2)).toBe(DEFAULT_STEP_MINUTES);
    expect(resolveStepMinutes(3)).toBe(3);
  });
});

describe('shouldKeepTimer', () => {
  it('no iniciado => false', () => {
    expect(shouldKeepTimer({ started: false, prevStepId: 1, nextStepId: 1 })).toBe(false);
  });
  it('mismo paso => true', () => {
    expect(shouldKeepTimer({ started: true, prevStepId: 1, nextStepId: 1 })).toBe(true);
  });
  it('paso distinto => false', () => {
    expect(shouldKeepTimer({ started: true, prevStepId: 1, nextStepId: 2 })).toBe(false);
  });
  it('sin paso nuevo => false', () => {
    expect(shouldKeepTimer({ started: true, prevStepId: 1, nextStepId: null })).toBe(false);
  });
  it('sin paso previo => false', () => {
    expect(shouldKeepTimer({ started: true, prevStepId: null, nextStepId: 1 })).toBe(false);
  });
});