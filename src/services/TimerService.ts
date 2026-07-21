// TimerService no persiste datos — solo maneja el estado del timer en memoria.
// Lo consume FocusScreen via el hook useTimer.

export type TimerMode = 'countdown' | 'countup';

export interface TimerState {
  running: boolean;
  seconds: number; // segundos restantes (countdown) o transcurridos (countup)
  mode: TimerMode;
  finished: boolean; // true cuando el countdown llega a 0
}

let intervalId: ReturnType<typeof setInterval> | null = null;
let onTickCallback: ((state: TimerState) => void) | null = null;
let onFinishCallback: (() => void) | null = null;
let state: TimerState = { running: false, seconds: 0, mode: 'countup', finished: false };

export const TimerService = {
  // Iniciar timer. Si duration_min es null → countup; si tiene valor → countdown
  start(duration_min: number | null, onTick: (s: TimerState) => void, onFinish?: () => void): void {
    TimerService.stop();
    onTickCallback = onTick;
    onFinishCallback = onFinish ?? null;

    state = {
      running: true,
      seconds: duration_min ? duration_min * 60 : 0,
      mode: duration_min ? 'countdown' : 'countup',
      finished: false,
    };

    onTickCallback(state);

    intervalId = setInterval(() => {
      if (state.mode === 'countdown') {
        state.seconds = Math.max(0, state.seconds - 1);
        if (state.seconds === 0 && !state.finished) {
          state.finished = true;
          state.running = false;
          onTickCallback?.(state);
          onFinishCallback?.();
          TimerService.stop();
          return;
        }
      } else {
        state.seconds += 1;
      }
      onTickCallback?.(state);
    }, 1000);
  },

  pause(): void {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    state.running = false;
    onTickCallback?.(state);
  },

  resume(): void {
    if (state.running || state.finished) return;
    state.running = true;
    intervalId = setInterval(() => {
      if (state.mode === 'countdown') {
        state.seconds = Math.max(0, state.seconds - 1);
        if (state.seconds === 0 && !state.finished) {
          state.finished = true;
          state.running = false;
          onTickCallback?.(state);
          onFinishCallback?.();
          TimerService.stop();
          return;
        }
      } else {
        state.seconds += 1;
      }
      onTickCallback?.(state);
    }, 1000);
  },

  stop(): void {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    state = { running: false, seconds: 0, mode: 'countup', finished: false };
  },

  getState(): TimerState {
    return state;
  },

  // Formatea segundos como MM:SS
  format(seconds: number): string {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  },
};
