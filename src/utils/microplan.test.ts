import { describe, it, expect } from 'vitest';
import {
  clampStepPosition,
  clockLabel,
  completedStepCount,
  computeTotalMinutes,
  frictionIcons,
  frictionLabels,
  frictionLevelFor,
  isLongTitle,
  nextStepPosition,
  remainingMinutes,
  stepCountLabel,
  stepPositionLabel,
  stepStartMinutes,
  totalMinutesLabel,
} from './microplan';

describe('computeTotalMinutes', () => {
  it('suma las duraciones', () => {
    expect(computeTotalMinutes([{ duration_min: 3 }, { duration_min: 4 }, { duration_min: 1 }])).toBe(8);
  });

  it('trata null / undefined como 0', () => {
    expect(computeTotalMinutes([{ duration_min: null }, {}, { duration_min: 2 }])).toBe(2);
  });

  it('lista vacia da 0', () => {
    expect(computeTotalMinutes([])).toBe(0);
  });
});

describe('frictionLevelFor', () => {
  it('<=3 es friccion cero', () => {
    expect(frictionLevelFor(3)).toBe('none');
    expect(frictionLevelFor(1)).toBe('none');
  });

  it('<=7 es friccion minima', () => {
    expect(frictionLevelFor(4)).toBe('low');
    expect(frictionLevelFor(7)).toBe('low');
  });

  it('>7 sugiere dividir', () => {
    expect(frictionLevelFor(8)).toBe('high');
  });
});

describe('frictionLabels / frictionIcons', () => {
  it('tienen las 3 claves', () => {
    expect(Object.keys(frictionLabels)).toEqual(['none', 'low', 'high']);
    expect(Object.keys(frictionIcons)).toEqual(['none', 'low', 'high']);
  });
});

describe('clampStepPosition', () => {
  it('clampa hacia arriba', () => {
    expect(clampStepPosition(0, 4)).toBe(1);
  });

  it('clampa hacia abajo', () => {
    expect(clampStepPosition(5, 4)).toBe(4);
  });

  it('total invalido devuelve 1', () => {
    expect(clampStepPosition(2, 0)).toBe(1);
    expect(clampStepPosition(2, -1)).toBe(1);
  });

  it('valores validos pasan', () => {
    expect(clampStepPosition(2, 4)).toBe(2);
  });
});

describe('stepPositionLabel', () => {
  it('formato "Paso 2/4"', () => {
    expect(stepPositionLabel(2, 4)).toBe('Paso 2/4');
  });

  it('clamp: cero o fuera de rango no rompe el label', () => {
    expect(stepPositionLabel(0, 4)).toBe('Paso 1/4');
    expect(stepPositionLabel(9, 4)).toBe('Paso 4/4');
  });

  it('sin total devuelve solo el indice', () => {
    expect(stepPositionLabel(1, 0)).toBe('Paso 1');
  });
});

describe('totalMinutesLabel', () => {
  it('formato "8 min total"', () => {
    expect(totalMinutesLabel(8)).toBe('8 min total');
  });
});

describe('nextStepPosition', () => {
  it('sube un paso', () => {
    expect(nextStepPosition(2, 4, 'up')).toBe(1);
  });

  it('baja un paso', () => {
    expect(nextStepPosition(2, 4, 'down')).toBe(3);
  });

  it('clampa en los extremos', () => {
    expect(nextStepPosition(1, 4, 'up')).toBe(1);
    expect(nextStepPosition(4, 4, 'down')).toBe(4);
  });
});

describe('stepStartMinutes', () => {
  it('devuelve offsets acumulados', () => {
    expect(stepStartMinutes([{ duration_min: 2 }, { duration_min: 4 }, { duration_min: 3 }])).toEqual([0, 2, 6]);
  });

  it('lista vacia da []', () => {
    expect(stepStartMinutes([])).toEqual([]);
  });
});

describe('remainingMinutes', () => {
  it('suma solo los no completados', () => {
    expect(
      remainingMinutes([
        { duration_min: 2, completed: true },
        { duration_min: 4, completed: false },
        { duration_min: 3, completed: false },
      ]),
    ).toBe(7);
  });

  it('todo completo da 0', () => {
    expect(remainingMinutes([{ duration_min: 2, completed: true }])).toBe(0);
  });
});

describe('completedStepCount', () => {
  it('cuenta los completados', () => {
    expect(
      completedStepCount([{ completed: true }, { completed: false }, { completed: true }]),
    ).toBe(2);
  });
});

describe('stepCountLabel', () => {
  it('singular y plural', () => {
    expect(stepCountLabel(1)).toBe('1 paso');
    expect(stepCountLabel(3)).toBe('3 pasos');
  });
});

describe('clockLabel', () => {
  it('formatea MM:00', () => {
    expect(clockLabel(0)).toBe('00:00');
    expect(clockLabel(6)).toBe('06:00');
  });

  it('nunca negativo', () => {
    expect(clockLabel(-3)).toBe('00:00');
  });
});

describe('isLongTitle', () => {
  it('detecta titulos largos', () => {
    expect(isLongTitle('Corto')).toBe(false);
    expect(isLongTitle('Un titulo claramente demasiado largo para arrancar')).toBe(true);
  });

  it('respeta el umbral por parametro', () => {
    expect(isLongTitle('abc', 2)).toBe(true);
  });
});