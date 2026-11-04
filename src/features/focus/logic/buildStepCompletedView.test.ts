import { describe, expect, it } from 'vitest';
import { buildStepCompletedView } from './buildStepCompletedView';

describe('buildStepCompletedView', () => {
  it('minutes 3 => durationLabel 3 min', () => {
    expect(buildStepCompletedView({ minutes: 3, nextStep: null }).durationLabel).toBe('3 min');
  });
  it('minutes null => durationLabel null', () => {
    expect(buildStepCompletedView({ minutes: null, nextStep: null }).durationLabel).toBeNull();
  });
  it('minutes 0 => durationLabel null', () => {
    expect(buildStepCompletedView({ minutes: 0, nextStep: null }).durationLabel).toBeNull();
  });
  it('minutes -1 => null', () => {
    expect(buildStepCompletedView({ minutes: -1, nextStep: null }).durationLabel).toBeNull();
  });
  it('nextStep null => nextStepName null y nextStepMinutesLabel null', () => {
    const data = buildStepCompletedView({ minutes: 3, nextStep: null });
    expect(data.nextStepName).toBeNull();
    expect(data.nextStepMinutesLabel).toBeNull();
  });
  it('nextStep { name X, minutes 4 } => X y 4 min', () => {
    const data = buildStepCompletedView({ minutes: 3, nextStep: { name: 'X', minutes: 4 } });
    expect(data.nextStepName).toBe('X');
    expect(data.nextStepMinutesLabel).toBe('4 min');
  });
  it('nextStep { name Y, minutes null } => Y y null', () => {
    const data = buildStepCompletedView({ minutes: 3, nextStep: { name: 'Y', minutes: null } });
    expect(data.nextStepName).toBe('Y');
    expect(data.nextStepMinutesLabel).toBeNull();
  });
});
