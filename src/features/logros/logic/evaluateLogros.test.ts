import { describe, it, expect } from 'vitest';
import { evaluateLogros } from './evaluateLogros';

const NOW = new Date(2026, 9, 15, 12, 0);

describe('evaluateLogros', () => {
  it('primer-paso: stepsTotal >= 1', () => {
    expect(evaluateLogros({ stepsTotal: 0, tasksCompleted: 0, completedDays: [], completedAtList: [] }, NOW)).not.toContain('primer-paso');
    expect(evaluateLogros({ stepsTotal: 1, tasksCompleted: 0, completedDays: [], completedAtList: [] }, NOW)).toContain('primer-paso');
  });

  it('primera-tarea: tasksCompleted >= 1', () => {
    expect(evaluateLogros({ stepsTotal: 0, tasksCompleted: 0, completedDays: [], completedAtList: [] }, NOW)).not.toContain('primera-tarea');
    expect(evaluateLogros({ stepsTotal: 0, tasksCompleted: 1, completedDays: [], completedAtList: [] }, NOW)).toContain('primera-tarea');
  });

  it('diez-pasos: stepsTotal >= 10', () => {
    expect(evaluateLogros({ stepsTotal: 9, tasksCompleted: 0, completedDays: [], completedAtList: [] }, NOW)).not.toContain('diez-pasos');
    expect(evaluateLogros({ stepsTotal: 10, tasksCompleted: 0, completedDays: [], completedAtList: [] }, NOW)).toContain('diez-pasos');
  });

  it('cincuenta-pasos: stepsTotal >= 50', () => {
    expect(evaluateLogros({ stepsTotal: 49, tasksCompleted: 0, completedDays: [], completedAtList: [] }, NOW)).not.toContain('cincuenta-pasos');
    expect(evaluateLogros({ stepsTotal: 50, tasksCompleted: 0, completedDays: [], completedAtList: [] }, NOW)).toContain('cincuenta-pasos');
  });

  it('cien-pasos: stepsTotal >= 100', () => {
    expect(evaluateLogros({ stepsTotal: 99, tasksCompleted: 0, completedDays: [], completedAtList: [] }, NOW)).not.toContain('cien-pasos');
    expect(evaluateLogros({ stepsTotal: 100, tasksCompleted: 0, completedDays: [], completedAtList: [] }, NOW)).toContain('cien-pasos');
  });

  it('semana-activa: racha de 7 días', () => {
    const days6 = Array.from({ length: 6 }, (_, i) => `2026-10-${String(1 + i).padStart(2, '0')}`);
    const days7 = Array.from({ length: 7 }, (_, i) => `2026-10-${String(1 + i).padStart(2, '0')}`);
    expect(evaluateLogros({ stepsTotal: 0, tasksCompleted: 0, completedDays: days6, completedAtList: [] }, NOW)).not.toContain('semana-activa');
    expect(evaluateLogros({ stepsTotal: 0, tasksCompleted: 0, completedDays: days7, completedAtList: [] }, NOW)).toContain('semana-activa');
  });

  it('mes-constante: 20 días distintos del mes', () => {
    const days19 = Array.from({ length: 19 }, (_, i) => `2026-10-${String(1 + i).padStart(2, '0')}`);
    const days20 = Array.from({ length: 20 }, (_, i) => `2026-10-${String(1 + i).padStart(2, '0')}`);
    expect(evaluateLogros({ stepsTotal: 0, tasksCompleted: 0, completedDays: days19, completedAtList: [] }, NOW)).not.toContain('mes-constante');
    expect(evaluateLogros({ stepsTotal: 0, tasksCompleted: 0, completedDays: days20, completedAtList: [] }, NOW)).toContain('mes-constante');
  });

  it('arranque-temprano: completedAt con hora local < 8 (7:59 sí, 8:00 no)', () => {
    const early = new Date(2026, 9, 15, 7, 59).toISOString();
    const late = new Date(2026, 9, 15, 8, 0).toISOString();
    expect(evaluateLogros({ stepsTotal: 0, tasksCompleted: 0, completedDays: [], completedAtList: [late] }, NOW)).not.toContain('arranque-temprano');
    expect(evaluateLogros({ stepsTotal: 0, tasksCompleted: 0, completedDays: [], completedAtList: [early] }, NOW)).toContain('arranque-temprano');
  });
});
