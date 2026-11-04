import { describe, expect, it } from 'vitest';
import { buildFocusModel } from './buildFocusModel';

type Task = { id: number; name: string };
type Step = { id: number; name: string; duration_min: number | null; status: 'pending' | 'completed'; order_index: number };

const candidate = (task: Task, steps: Step[]) => ({ task, steps });

describe('buildFocusModel', () => {
  it('sin candidatos => null', () => {
    expect(buildFocusModel([], null, [])).toBeNull();
  });

  it('todo completado => null', () => {
    const candidates = [candidate({ id: 1, name: 'T1' }, [{ id: 1, name: 'Paso', duration_min: 5, status: 'completed', order_index: 0 }])];
    expect(buildFocusModel(candidates, null, [])).toBeNull();
  });

  it('arma current/upcoming', () => {
    const candidates = [
      candidate({ id: 1, name: 'T1' }, [
        { id: 10, name: 'Paso', duration_min: 5, status: 'pending', order_index: 0 },
        { id: 11, name: 'Paso', duration_min: 5, status: 'pending', order_index: 1 },
      ]),
    ];
    const model = buildFocusModel(candidates, null, []);
    expect(model?.task.id).toBe(1);
    expect(model?.current.id).toBe(10);
    expect(model?.upcoming.map((s) => s.id)).toEqual([11]);
  });

  it('manual cambia la tarea activa y isActive', () => {
    const candidates = [
      candidate({ id: 1, name: 'T1' }, [{ id: 10, name: 'Paso', duration_min: 5, status: 'pending', order_index: 0 }]),
      candidate({ id: 2, name: 'T2' }, [{ id: 20, name: 'Paso', duration_min: 5, status: 'pending', order_index: 0 }]),
    ];
    const model = buildFocusModel(candidates, 2, []);
    expect(model?.task.id).toBe(2);
    expect(model?.switcher.find((s) => s.taskId === 2)?.isActive).toBe(true);
    expect(model?.switcher.find((s) => s.taskId === 1)?.isActive).toBe(false);
  });

  it('el switcher excluye tareas sin pendientes y respeta el orden', () => {
    const candidates = [
      candidate({ id: 1, name: 'T1' }, [{ id: 10, name: 'Paso', duration_min: 5, status: 'completed', order_index: 0 }]),
      candidate({ id: 2, name: 'T2' }, [{ id: 20, name: 'Paso', duration_min: 5, status: 'pending', order_index: 0 }]),
      candidate({ id: 3, name: 'T3' }, [{ id: 30, name: 'Paso', duration_min: 5, status: 'pending', order_index: 0 }]),
    ];
    const model = buildFocusModel(candidates, null, []);
    expect(model?.switcher.map((s) => s.taskId)).toEqual([2, 3]);
  });

  it('pospuestos reordenan la cola', () => {
    const candidates = [
      candidate({ id: 1, name: 'T1' }, [
        { id: 10, name: 'Paso', duration_min: 5, status: 'pending', order_index: 0 },
        { id: 11, name: 'Paso', duration_min: 5, status: 'pending', order_index: 1 },
        { id: 12, name: 'Paso', duration_min: 5, status: 'pending', order_index: 2 },
      ]),
    ];
    const model = buildFocusModel(candidates, null, [10]);
    expect(model?.current.id).toBe(11);
    expect(model?.upcoming.map((s) => s.id)).toEqual([12, 10]);
  });

  it('canPostpone false con 1 pendiente y true con 2', () => {
    const one = [candidate({ id: 1, name: 'T1' }, [{ id: 10, name: 'Paso', duration_min: 5, status: 'pending', order_index: 0 }])];
    expect(buildFocusModel(one, null, [])?.canPostpone).toBe(false);

    const two = [
      candidate({ id: 1, name: 'T1' }, [
        { id: 10, name: 'Paso', duration_min: 5, status: 'pending', order_index: 0 },
        { id: 11, name: 'Paso', duration_min: 5, status: 'pending', order_index: 1 },
      ]),
    ];
    expect(buildFocusModel(two, null, [])?.canPostpone).toBe(true);
  });

  it('pendingCount, totalSteps y stepIndex con pasos completados mezclados', () => {
    const candidates = [
      candidate({ id: 1, name: 'T1' }, [
        { id: 10, name: 'A', duration_min: 5, status: 'completed', order_index: 0 },
        { id: 11, name: 'B', duration_min: 3, status: 'pending', order_index: 1 },
        { id: 12, name: 'C', duration_min: null, status: 'pending', order_index: 2 },
      ]),
    ];
    const model = buildFocusModel(candidates, null, []);
    expect(model?.pendingCount).toBe(2);
    expect(model?.totalSteps).toBe(3);
    expect(model?.stepIndex).toBe(2);
  });

  it('la entrada del switcher trae stepName/stepMinutes/stepIndex/totalSteps correctos', () => {
    const candidates = [
      candidate({ id: 1, name: 'T1' }, [
        { id: 10, name: 'Actual', duration_min: 5, status: 'pending', order_index: 0 },
      ]),
    ];
    const model = buildFocusModel(candidates, null, []);
    const entry = model?.switcher[0];
    expect(entry?.stepName).toBe('Actual');
    expect(entry?.stepMinutes).toBe(5);
    expect(entry?.stepIndex).toBe(1);
    expect(entry?.totalSteps).toBe(1);
  });

  it('el stepName de una tarea no activa respeta un paso pospuesto', () => {
    const candidates = [
      candidate({ id: 1, name: 'T1' }, [
        { id: 10, name: 'P1', duration_min: 5, status: 'pending', order_index: 0 },
      ]),
      candidate({ id: 2, name: 'T2' }, [
        { id: 20, name: 'P2a', duration_min: 2, status: 'pending', order_index: 0 },
        { id: 21, name: 'P2b', duration_min: 4, status: 'pending', order_index: 1 },
      ]),
    ];
    const model = buildFocusModel(candidates, 2, [20]);
    const entry = model?.switcher.find((s) => s.taskId === 2);
    expect(entry?.stepName).toBe('P2b');
    expect(entry?.stepMinutes).toBe(4);
  });

  it('stepMinutes null se conserva como null', () => {
    const candidates = [
      candidate({ id: 1, name: 'T1' }, [
        { id: 10, name: 'Sin duracion', duration_min: null, status: 'pending', order_index: 0 },
      ]),
    ];
    const model = buildFocusModel(candidates, null, []);
    expect(model?.switcher[0]?.stepMinutes).toBeNull();
    expect(model?.current.duration_min).toBeNull();
  });
});
