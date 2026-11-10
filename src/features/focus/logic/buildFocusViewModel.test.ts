import { describe, expect, it } from 'vitest';
import { buildFocusViewModel } from './buildFocusViewModel';

const model = (overrides: Partial<Parameters<typeof buildFocusViewModel>[0]> = {}) => ({
  task: { id: 1, name: 'Tarea' },
  current: { id: 10, name: 'Paso actual', duration_min: 5 },
  upcoming: [{ id: 11, name: 'Siguiente', duration_min: 3 }],
  canPostpone: true,
  pendingCount: 2,
  stepIndex: 1,
  totalSteps: 2,
  switcher: [
    { taskId: 1, name: 'Tarea', isActive: true, stepName: 'Paso actual', stepMinutes: 5, stepIndex: 1, totalSteps: 2 },
  ],
  ...overrides,
});

describe('buildFocusViewModel', () => {
  it('mapea paso y cola', () => {
    const vm = buildFocusViewModel(model());
    expect(vm.taskId).toBe(1);
    expect(vm.taskName).toBe('Tarea');
    expect(vm.step).toEqual({ id: 10, title: 'Paso actual', minutes: 5, stepIndex: 1, totalSteps: 2 });
    expect(vm.queue).toEqual([{ id: 11, name: 'Siguiente', minutes: 3 }]);
    expect(vm.canPostpone).toBe(true);
  });

  it('minutes null se conserva', () => {
    const vm = buildFocusViewModel(
      model({
        current: { id: 10, name: 'Sin duracion', duration_min: null },
        upcoming: [{ id: 11, name: 'Otro', duration_min: null }],
        switcher: [
          { taskId: 1, name: 'Tarea', isActive: true, stepName: 'Sin duracion', stepMinutes: null, stepIndex: 1, totalSteps: 1 },
        ],
      }),
    );
    expect(vm.step.minutes).toBeNull();
    expect(vm.queue[0]?.minutes).toBeNull();
    expect(vm.switcher.active?.minutes).toBeNull();
  });

  it('canPostpone se propaga', () => {
    const vm = buildFocusViewModel(model({ canPostpone: false }));
    expect(vm.canPostpone).toBe(false);
  });

  it('switcher con una sola tarea => show false, active presente y alternatives vacío', () => {
    const vm = buildFocusViewModel(model());
    expect(vm.switcher.show).toBe(false);
    expect(vm.switcher.active?.id).toBe(1);
    expect(vm.switcher.alternatives).toEqual([]);
  });

  it('con 3 tareas => show true, activa separada y 2 alternativas en orden', () => {
    const vm = buildFocusViewModel(
      model({
        switcher: [
          { taskId: 1, name: 'T1', isActive: true, stepName: 'P1', stepMinutes: 5, stepIndex: 1, totalSteps: 2 },
          { taskId: 2, name: 'T2', isActive: false, stepName: 'P2', stepMinutes: 3, stepIndex: 2, totalSteps: 3 },
          { taskId: 3, name: 'T3', isActive: false, stepName: 'P3', stepMinutes: null, stepIndex: 1, totalSteps: 1 },
        ],
      }),
    );
    expect(vm.switcher.show).toBe(true);
    expect(vm.switcher.active?.id).toBe(1);
    expect(vm.switcher.alternatives.map((a) => a.id)).toEqual([2, 3]);
  });

  it('pendingCount correcto', () => {
    const vm = buildFocusViewModel(model({ pendingCount: 7 }));
    expect(vm.switcher.pendingCount).toBe(7);
  });
});
