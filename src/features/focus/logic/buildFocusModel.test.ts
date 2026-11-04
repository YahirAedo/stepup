import { describe, expect, it } from 'vitest';
import { buildFocusModel } from './buildFocusModel';

type Task = { id: number; name: string };
type Step = { id: number; status: 'pending' | 'completed'; order_index: number };

const candidate = (task: Task, steps: Step[]) => ({ task, steps });

describe('buildFocusModel', () => {
  it('sin candidatos => null', () => {
    expect(buildFocusModel([], null, [])).toBeNull();
  });

  it('todo completado => null', () => {
    const candidates = [candidate({ id: 1, name: 'T1' }, [{ id: 1, status: 'completed', order_index: 0 }])];
    expect(buildFocusModel(candidates, null, [])).toBeNull();
  });

  it('arma current/upcoming', () => {
    const candidates = [
      candidate({ id: 1, name: 'T1' }, [
        { id: 10, status: 'pending', order_index: 0 },
        { id: 11, status: 'pending', order_index: 1 },
      ]),
    ];
    const model = buildFocusModel(candidates, null, []);
    expect(model?.task.id).toBe(1);
    expect(model?.current.id).toBe(10);
    expect(model?.upcoming.map((s) => s.id)).toEqual([11]);
  });

  it('manual cambia la tarea activa y isActive', () => {
    const candidates = [
      candidate({ id: 1, name: 'T1' }, [{ id: 10, status: 'pending', order_index: 0 }]),
      candidate({ id: 2, name: 'T2' }, [{ id: 20, status: 'pending', order_index: 0 }]),
    ];
    const model = buildFocusModel(candidates, 2, []);
    expect(model?.task.id).toBe(2);
    expect(model?.switcher.find((s) => s.taskId === 2)?.isActive).toBe(true);
    expect(model?.switcher.find((s) => s.taskId === 1)?.isActive).toBe(false);
  });

  it('el switcher excluye tareas sin pendientes y respeta el orden', () => {
    const candidates = [
      candidate({ id: 1, name: 'T1' }, [{ id: 10, status: 'completed', order_index: 0 }]),
      candidate({ id: 2, name: 'T2' }, [{ id: 20, status: 'pending', order_index: 0 }]),
      candidate({ id: 3, name: 'T3' }, [{ id: 30, status: 'pending', order_index: 0 }]),
    ];
    const model = buildFocusModel(candidates, null, []);
    expect(model?.switcher.map((s) => s.taskId)).toEqual([2, 3]);
  });

  it('pospuestos reordenan la cola', () => {
    const candidates = [
      candidate({ id: 1, name: 'T1' }, [
        { id: 10, status: 'pending', order_index: 0 },
        { id: 11, status: 'pending', order_index: 1 },
        { id: 12, status: 'pending', order_index: 2 },
      ]),
    ];
    const model = buildFocusModel(candidates, null, [10]);
    expect(model?.current.id).toBe(11);
    expect(model?.upcoming.map((s) => s.id)).toEqual([12, 10]);
  });

  it('canPostpone false con 1 pendiente y true con 2', () => {
    const one = [candidate({ id: 1, name: 'T1' }, [{ id: 10, status: 'pending', order_index: 0 }])];
    expect(buildFocusModel(one, null, [])?.canPostpone).toBe(false);

    const two = [
      candidate({ id: 1, name: 'T1' }, [
        { id: 10, status: 'pending', order_index: 0 },
        { id: 11, status: 'pending', order_index: 1 },
      ]),
    ];
    expect(buildFocusModel(two, null, [])?.canPostpone).toBe(true);
  });
});
