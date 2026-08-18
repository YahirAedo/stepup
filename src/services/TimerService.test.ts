import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TimerService, type TimerState } from './TimerService';

describe('TimerService.format', () => {
  it('formatea segundos como MM:SS', () => {
    expect(TimerService.format(0)).toBe('00:00');
    expect(TimerService.format(5)).toBe('00:05');
    expect(TimerService.format(59)).toBe('00:59');
    expect(TimerService.format(60)).toBe('01:00');
    expect(TimerService.format(61)).toBe('01:01');
    expect(TimerService.format(125)).toBe('02:05');
  });

  it('no limita los minutos por encima de 60', () => {
    expect(TimerService.format(3600)).toBe('60:00');
    expect(TimerService.format(5405)).toBe('90:05');
  });
});

describe('TimerService (maquina de estados)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TimerService.stop();
  });

  afterEach(() => {
    TimerService.stop();
    vi.useRealTimers();
  });

  it('start con duration_min arranca en countdown con segundos = min*60', () => {
    const onTick = vi.fn();
    TimerService.start(2, onTick);

    const state = TimerService.getState();
    expect(state).toEqual({ running: true, seconds: 120, mode: 'countdown', finished: false });
    expect(onTick).toHaveBeenCalledTimes(1);
    expect(onTick).toHaveBeenCalledWith(state);
  });

  it('start sin duration arranca en countup desde 0', () => {
    const onTick = vi.fn();
    TimerService.start(null, onTick);

    expect(TimerService.getState()).toEqual({
      running: true,
      seconds: 0,
      mode: 'countup',
      finished: false,
    });
  });

  it('countdown descuenta por segundo y termina en 0 llamando a onFinish', () => {
    const ticks: TimerState[] = [];
    const onFinish = vi.fn();
    TimerService.start(1, (s) => ticks.push({ ...s }), onFinish);

    vi.advanceTimersByTime(60_000);

    const last = ticks[ticks.length - 1];
    expect(last).toEqual({ running: false, seconds: 0, mode: 'countdown', finished: true });
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(TimerService.getState().seconds).toBe(0);
  });

  it('countdown no baja de 0 ni dispara onFinish dos veces', () => {
    const onFinish = vi.fn();
    TimerService.start(1, () => {}, onFinish);

    vi.advanceTimersByTime(65_000);

    expect(TimerService.getState().seconds).toBe(0);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('countup suma un segundo por tick', () => {
    TimerService.start(null, () => {});

    vi.advanceTimersByTime(3_000);

    expect(TimerService.getState().seconds).toBe(3);
    expect(TimerService.getState().mode).toBe('countup');
  });

  it('pause detiene el conteo y resume lo continua', () => {
    TimerService.start(null, () => {});
    vi.advanceTimersByTime(2_000);

    TimerService.pause();
    expect(TimerService.getState().running).toBe(false);
    vi.advanceTimersByTime(5_000);
    expect(TimerService.getState().seconds).toBe(2);

    TimerService.resume();
    expect(TimerService.getState().running).toBe(true);
    vi.advanceTimersByTime(3_000);
    expect(TimerService.getState().seconds).toBe(5);
  });

  it('resume no duplica el conteo si ya esta corriendo', () => {
    TimerService.start(null, () => {});
    vi.advanceTimersByTime(1_000);

    TimerService.resume();
    vi.advanceTimersByTime(1_000);

    expect(TimerService.getState().seconds).toBe(2);
  });

  it('stop resetea el estado inicial', () => {
    TimerService.start(3, () => {});
    vi.advanceTimersByTime(2_000);

    TimerService.stop();

    expect(TimerService.getState()).toEqual({
      running: false,
      seconds: 0,
      mode: 'countup',
      finished: false,
    });
  });
});
