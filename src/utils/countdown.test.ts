import { describe, it, expect } from 'vitest';
import {
  addSecondsToState,
  clampSeconds,
  computeProgress,
  createCountdownState,
  circleCircumference,
  formatCountdown,
  progressDashOffset,
  tickState,
  toMinutesLabel,
} from './countdown';

describe('clampSeconds', () => {
  it('nunca es negativo', () => {
    expect(clampSeconds(-5)).toBe(0);
  });

  it('hacia el piso', () => {
    expect(clampSeconds(59.9)).toBe(59);
  });

  it('NaN se trata como 0', () => {
    expect(clampSeconds(Number.NaN)).toBe(0);
  });
});

describe('createCountdownState', () => {
  it('replica el estado inicial del mockup (252 / 300)', () => {
    expect(createCountdownState(252, 300)).toEqual({ remaining: 252, total: 300 });
  });

  it('el objetivo nunca queda menor al restante', () => {
    expect(createCountdownState(400, 300)).toEqual({ remaining: 400, total: 400 });
  });
});

describe('tickState', () => {
  it('descuenta un segundo', () => {
    expect(tickState({ remaining: 10, total: 300 }).remaining).toBe(9);
  });

  it('no baja de cero', () => {
    expect(tickState({ remaining: 1, total: 300 })).toEqual({ remaining: 0, total: 300 });
  });

  it('devuelve la misma referencia en 0 (evita re-renders en cadena)', () => {
    const done = { remaining: 0, total: 300 };
    expect(tickState(done)).toBe(done);
  });
});

describe('addSecondsToState', () => {
  it('suma al restante y NO agranda el objetivo si no lo supera', () => {
    // caso addTwoMinutes() del mockup: 100 + 120 = 220 < 300
    expect(addSecondsToState({ remaining: 100, total: 300 }, 120)).toEqual({
      remaining: 220,
      total: 300,
    });
  });

  it('agranda el objetivo cuando el restante lo supera', () => {
    expect(addSecondsToState({ remaining: 250, total: 300 }, 120)).toEqual({
      remaining: 370,
      total: 370,
    });
  });

  it('ignora deltas no positivos (devuelve la misma referencia)', () => {
    const state = { remaining: 100, total: 300 };
    expect(addSecondsToState(state, 0)).toBe(state);
    expect(addSecondsToState(state, -30)).toBe(state);
  });
});

describe('computeProgress', () => {
  it('proporción restante/total', () => {
    expect(computeProgress({ remaining: 150, total: 300 })).toBe(0.5);
  });

  it('clamp a 1 si el restante supera el total', () => {
    expect(computeProgress({ remaining: 400, total: 300 })).toBe(1);
  });

  it('0 cuando el total es 0 (evita NaN en el strokeDashoffset)', () => {
    expect(computeProgress({ remaining: 10, total: 0 })).toBe(0);
  });
});

describe('formatCountdown', () => {
  it('mm:ss con relleno', () => {
    expect(formatCountdown(252)).toBe('04:12');
    expect(formatCountdown(300)).toBe('05:00');
    expect(formatCountdown(5)).toBe('00:05');
    expect(formatCountdown(0)).toBe('00:00');
  });
});

describe('toMinutesLabel', () => {
  it('redondea hacia arriba', () => {
    expect(toMinutesLabel(300)).toBe('5');
    expect(toMinutesLabel(252)).toBe('5');
    expect(toMinutesLabel(61)).toBe('2');
  });
});

describe('circleCircumference', () => {
  it('r=84 da la circunferencia completa del anillo', () => {
    // El HTML trunca el valor a 527.78 en el atributo `stroke-dasharray`;
    // aca se usa el valor exacto (527.7876...), que es lo que SVG necesita.
    expect(circleCircumference(84)).toBeCloseTo(527.7876, 3);
  });
});

describe('progressDashOffset', () => {
  const C = circleCircumference(84);

  it('progreso 0 deja el arco completo', () => {
    expect(progressDashOffset(0, 84)).toBeCloseTo(C, 5);
  });

  it('progreso 1 oculta el arco', () => {
    expect(progressDashOffset(1, 84)).toBeCloseTo(0, 5);
  });

  it('al estado inicial 252/300 del mockup', () => {
    // OJO: el atributo estatico del HTML dice stroke-dashoffset="105.55", pero
    // su propio script llama updateTimerUI() en el arranque y lo sobreescribe
    // con circumference * (1 - 252/300) = 84.45. El valor estatico esta
    // desactualizado; el que se ve renderizado es 84.45.
    const offset = progressDashOffset(252 / 300, 84);
    expect(offset).toBeCloseTo(84.446, 2);
    // 105.55 corresponderia a un progreso de 0.80 (240/300), no al inicial.
    expect(offset).not.toBeCloseTo(105.55, 1);
  });

  it('clamp fuera de rango en vez de desbordar el dasharray', () => {
    expect(progressDashOffset(1.5, 84)).toBeCloseTo(0, 5);
    expect(progressDashOffset(-0.5, 84)).toBeCloseTo(C, 5);
  });
});
