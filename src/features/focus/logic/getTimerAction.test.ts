import { describe, expect, it } from 'vitest';
import { getTimerAction } from './getTimerAction';

describe('getTimerAction', () => {
  it('los 4 resultados', () => {
    expect(getTimerAction({ started: false, running: false, finished: false })).toBe('start');
    expect(getTimerAction({ started: true, running: true, finished: false })).toBe('pause');
    expect(getTimerAction({ started: true, running: false, finished: false })).toBe('resume');
    expect(getTimerAction({ started: true, running: false, finished: true })).toBe('none');
  });

  it('finished con started true y false => none', () => {
    expect(getTimerAction({ started: true, running: false, finished: true })).toBe('none');
    expect(getTimerAction({ started: false, running: false, finished: true })).toBe('none');
  });
});
