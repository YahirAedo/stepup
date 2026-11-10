import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addSecondsToState,
  computeProgress,
  createCountdownState,
  formatCountdown,
  tickState,
  type CountdownState,
} from '../utils/countdown';

export interface UseFocusCountdownOptions {
  /** Segundos iniciales restantes. Default 252 (04:12), como el mockup. */
  initialSeconds?: number;
  /** Segundos totales del objetivo. Default 300 (05:00). */
  maxSeconds?: number;
  /** Arranca en pausa. */
  startPaused?: boolean;
}

export interface UseFocusCountdown extends CountdownState {
  /** 0..1 — cuanto del arco queda dibujado. */
  progress: number;
  isPaused: boolean;
  isFinished: boolean;
  /** Pausa o reanuda. NO reinicia el cronometro. */
  toggle: () => void;
  pause: () => void;
  resume: () => void;
  /** Suma segundos al objetivo (p. ej. +2 minutos). */
  addSeconds: (seconds: number) => void;
  /** Vuelve al estado inicial. */
  reset: () => void;
  /** `mm:ss` con digitos de relleno. */
  formatted: string;
}

/**
 * Cronometro de cuenta regresiva para las previews del Design Lab.
 *
 * La logica vive en `src/utils/countdown.ts` (funciones puras, testeadas); el
 * hook solo maneja el estado de React y el intervalo.
 *
 * A diferencia de `src/services/TimerService.ts`, `toggle()` NO reinicia el
 * countdown: pausa congela el valor y reanudar sigue desde ahi. Ese es
 * justamente el bug de `TimerService.resume()` (codigo muerto) que arrastra
 * el focus real. Cuando esta pantalla migre al FocusScreen de produccion hay
 * que arreglar el servicio primero, o la correccion se pierde.
 *
 * Al llegar a 0 NO se pausa solo: el mockup deja el label en "En Curso"
 * congelado. `isFinished` queda expuesto para que una pantalla futura pueda
 * reaccionar.
 */
export function useFocusCountdown({
  initialSeconds = 252,
  maxSeconds = 300,
  startPaused = false,
}: UseFocusCountdownOptions = {}): UseFocusCountdown {
  // Opciones iniciales congeladas: `reset()` vuelve al punto de partida aunque
  // el llamador pase props nuevas en un rerender.
  const startRef = useRef({ initialSeconds, maxSeconds, startPaused });
  const { initialSeconds: startInitial, maxSeconds: startMax, startPaused: startPausedFlag } =
    startRef.current;

  const [state, setState] = useState<CountdownState>(() =>
    createCountdownState(startInitial, startMax)
  );
  const [isPaused, setIsPaused] = useState(startPausedFlag);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => setState(tickState), 1000);
    return () => clearInterval(id);
  }, [isPaused]);

  const toggle = useCallback(() => setIsPaused((prev) => !prev), []);
  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);
  const addSeconds = useCallback(
    (seconds: number) => setState((prev) => addSecondsToState(prev, seconds)),
    []
  );
  const reset = useCallback(() => {
    setState(createCountdownState(startInitial, startMax));
    setIsPaused(startPausedFlag);
  }, [startInitial, startMax, startPausedFlag]);

  return {
    ...state,
    progress: computeProgress(state),
    isPaused,
    isFinished: state.remaining <= 0,
    toggle,
    pause,
    resume,
    addSeconds,
    reset,
    formatted: formatCountdown(state.remaining),
  };
}
