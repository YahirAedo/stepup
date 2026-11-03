import { describe, it, expect } from 'vitest';
import { buildEditPlan, hasUnsavedChanges, validateTaskEdit } from './buildEditPlan';

const original = {
  name: 'Tarea original',
  description: 'Descripción original',
  due_date: '2026-10-20',
  steps: [
    { key: 's1', id: 1, name: 'Paso uno', duration_min: 3, status: 'pending' as const },
    { key: 's2', id: 2, name: 'Paso dos', duration_min: 5, status: 'pending' as const },
    { key: 's3', id: 3, name: 'Paso tres', duration_min: 2, status: 'pending' as const },
  ],
};

describe('buildEditPlan', () => {
  it('sin cambios → plan vacío', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: [
        { key: 's1', id: 1, name: 'Paso uno', duration_min: 3, status: 'pending' as const },
        { key: 's2', id: 2, name: 'Paso dos', duration_min: 5, status: 'pending' as const },
        { key: 's3', id: 3, name: 'Paso tres', duration_min: 2, status: 'pending' as const },
      ],
      pendingDeletes: new Set<string>(),
    };
    const plan = buildEditPlan(original, draft);
    expect(plan.taskPatch).toEqual({});
    expect(plan.stepUpdates).toEqual([]);
    expect(plan.stepDeletes).toEqual([]);
    expect(plan.stepAdds).toEqual([]);
    expect(plan.finalOrder).toEqual(['s1', 's2', 's3']);
  });

  it('renombrar tarea → taskPatch.name', () => {
    const draft = {
      name: 'Tarea renombrada',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: original.steps.map((s) => ({ ...s })),
      pendingDeletes: new Set<string>(),
    };
    const plan = buildEditPlan(original, draft);
    expect(plan.taskPatch).toEqual({ name: 'Tarea renombrada' });
  });

  it('vaciar descripción → taskPatch.description = null', () => {
    const draft = {
      name: 'Tarea original',
      description: '',
      due_date: '2026-10-20',
      steps: original.steps.map((s) => ({ ...s })),
      pendingDeletes: new Set<string>(),
    };
    const plan = buildEditPlan(original, draft);
    expect(plan.taskPatch).toEqual({ description: null });
  });

  it('cambiar fecha → taskPatch.due_date', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: '2026-11-05',
      steps: original.steps.map((s) => ({ ...s })),
      pendingDeletes: new Set<string>(),
    };
    const plan = buildEditPlan(original, draft);
    expect(plan.taskPatch).toEqual({ due_date: '2026-11-05' });
  });

  it('quitar fecha → taskPatch.due_date = null', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: null,
      steps: original.steps.map((s) => ({ ...s })),
      pendingDeletes: new Set<string>(),
    };
    const plan = buildEditPlan(original, draft);
    expect(plan.taskPatch).toEqual({ due_date: null });
  });

  it('editar paso (nombre) → stepUpdates', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: [
        { key: 's1', id: 1, name: 'Paso uno editado', duration_min: 3, status: 'pending' as const },
        { key: 's2', id: 2, name: 'Paso dos', duration_min: 5, status: 'pending' as const },
        { key: 's3', id: 3, name: 'Paso tres', duration_min: 2, status: 'pending' as const },
      ],
      pendingDeletes: new Set<string>(),
    };
    const plan = buildEditPlan(original, draft);
    expect(plan.stepUpdates).toEqual([{ id: 1, name: 'Paso uno editado', duration_min: 3 }]);
  });

  it('editar paso (duración) → stepUpdates', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: [
        { key: 's1', id: 1, name: 'Paso uno', duration_min: 10, status: 'pending' as const },
        { key: 's2', id: 2, name: 'Paso dos', duration_min: 5, status: 'pending' as const },
        { key: 's3', id: 3, name: 'Paso tres', duration_min: 2, status: 'pending' as const },
      ],
      pendingDeletes: new Set<string>(),
    };
    const plan = buildEditPlan(original, draft);
    expect(plan.stepUpdates).toEqual([{ id: 1, name: 'Paso uno', duration_min: 10 }]);
  });

  it('borrar paso → stepDeletes', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: [
        { key: 's1', id: 1, name: 'Paso uno', duration_min: 3, status: 'pending' as const },
        { key: 's2', id: 2, name: 'Paso dos', duration_min: 5, status: 'pending' as const },
      ],
      pendingDeletes: new Set(['s3']),
    };
    const plan = buildEditPlan(original, draft);
    expect(plan.stepDeletes).toEqual([3]);
    expect(plan.finalOrder).toEqual(['s1', 's2']);
  });

  it('añadir paso → stepAdds', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: [
        { key: 's1', id: 1, name: 'Paso uno', duration_min: 3, status: 'pending' as const },
        { key: 's2', id: 2, name: 'Paso dos', duration_min: 5, status: 'pending' as const },
        { key: 's3', id: 3, name: 'Paso tres', duration_min: 2, status: 'pending' as const },
        { key: 'new-1', id: null, name: 'Paso nuevo', duration_min: 4, status: 'pending' as const },
      ],
      pendingDeletes: new Set<string>(),
    };
    const plan = buildEditPlan(original, draft);
    expect(plan.stepAdds).toEqual([{ name: 'Paso nuevo', duration_min: 4 }]);
    expect(plan.finalOrder).toEqual(['s1', 's2', 's3', 'new-1']);
  });

  it('reordenar → finalOrder cambiado', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: [
        { key: 's2', id: 2, name: 'Paso dos', duration_min: 5, status: 'pending' as const },
        { key: 's1', id: 1, name: 'Paso uno', duration_min: 3, status: 'pending' as const },
        { key: 's3', id: 3, name: 'Paso tres', duration_min: 2, status: 'pending' as const },
      ],
      pendingDeletes: new Set<string>(),
    };
    const plan = buildEditPlan(original, draft);
    expect(plan.finalOrder).toEqual(['s2', 's1', 's3']);
  });

  it('borrar + reordenar', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: [
        { key: 's2', id: 2, name: 'Paso dos', duration_min: 5, status: 'pending' as const },
        { key: 's1', id: 1, name: 'Paso uno', duration_min: 3, status: 'pending' as const },
      ],
      pendingDeletes: new Set(['s3']),
    };
    const plan = buildEditPlan(original, draft);
    expect(plan.stepDeletes).toEqual([3]);
    expect(plan.finalOrder).toEqual(['s2', 's1']);
  });

  it('añadir + reordenar', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: [
        { key: 'new-1', id: null, name: 'Paso nuevo', duration_min: 4, status: 'pending' as const },
        { key: 's1', id: 1, name: 'Paso uno', duration_min: 3, status: 'pending' as const },
        { key: 's2', id: 2, name: 'Paso dos', duration_min: 5, status: 'pending' as const },
        { key: 's3', id: 3, name: 'Paso tres', duration_min: 2, status: 'pending' as const },
      ],
      pendingDeletes: new Set<string>(),
    };
    const plan = buildEditPlan(original, draft);
    expect(plan.stepAdds).toEqual([{ name: 'Paso nuevo', duration_min: 4 }]);
    expect(plan.finalOrder).toEqual(['new-1', 's1', 's2', 's3']);
  });
});

describe('hasUnsavedChanges', () => {
  it('sin cambios → false', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: original.steps.map((s) => ({ ...s })),
      pendingDeletes: new Set<string>(),
    };
    expect(hasUnsavedChanges(original, draft)).toBe(false);
  });

  it('renombrar → true', () => {
    const draft = {
      name: 'Tarea renombrada',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: original.steps.map((s) => ({ ...s })),
      pendingDeletes: new Set<string>(),
    };
    expect(hasUnsavedChanges(original, draft)).toBe(true);
  });

  it('reordenar → true', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: [
        { key: 's2', id: 2, name: 'Paso dos', duration_min: 5, status: 'pending' as const },
        { key: 's1', id: 1, name: 'Paso uno', duration_min: 3, status: 'pending' as const },
        { key: 's3', id: 3, name: 'Paso tres', duration_min: 2, status: 'pending' as const },
      ],
      pendingDeletes: new Set<string>(),
    };
    expect(hasUnsavedChanges(original, draft)).toBe(true);
  });
});

describe('validateTaskEdit', () => {
  it('nombre válido → ok', () => {
    expect(validateTaskEdit('Rediseño de propuesta')).toEqual({ ok: true });
  });

  it('nombre vacío → error', () => {
    expect(validateTaskEdit('')).toEqual({ ok: false, error: 'El nombre de la tarea no puede estar vacío.' });
  });

  it('nombre solo espacios → error', () => {
    expect(validateTaskEdit('   ')).toEqual({ ok: false, error: 'El nombre de la tarea no puede estar vacío.' });
  });

  it('nombre > 120 caracteres → error', () => {
    const longName = 'a'.repeat(121);
    expect(validateTaskEdit(longName)).toEqual({ ok: false, error: 'El nombre no puede superar los 120 caracteres.' });
  });

  it('nombre de 120 caracteres → ok', () => {
    const name = 'a'.repeat(120);
    expect(validateTaskEdit(name)).toEqual({ ok: true });
  });
});

describe('buildEditPlan - cambios de estado', () => {
  const originalWithStatus = {
    name: 'Tarea original',
    description: 'Descripción original',
    due_date: '2026-10-20',
    steps: [
      { key: 's1', id: 1, name: 'Paso uno', duration_min: 3, status: 'pending' as const },
      { key: 's2', id: 2, name: 'Paso dos', duration_min: 5, status: 'completed' as const },
    ],
  };

  it('pending → completed en paso original', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: [
        { key: 's1', id: 1, name: 'Paso uno', duration_min: 3, status: 'completed' as const },
        { key: 's2', id: 2, name: 'Paso dos', duration_min: 5, status: 'completed' as const },
      ],
      pendingDeletes: new Set<string>(),
    };
    const plan = buildEditPlan(originalWithStatus, draft);
    expect(plan.stepStatusChanges).toEqual([{ key: 's1', id: 1, to: 'completed' }]);
  });

  it('completed → pending en paso original', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: [
        { key: 's1', id: 1, name: 'Paso uno', duration_min: 3, status: 'pending' as const },
        { key: 's2', id: 2, name: 'Paso dos', duration_min: 5, status: 'pending' as const },
      ],
      pendingDeletes: new Set<string>(),
    };
    const plan = buildEditPlan(originalWithStatus, draft);
    expect(plan.stepStatusChanges).toEqual([{ key: 's2', id: 2, to: 'pending' }]);
  });

  it('paso nuevo en completed genera cambio', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: [
        { key: 's1', id: 1, name: 'Paso uno', duration_min: 3, status: 'pending' as const },
        { key: 's2', id: 2, name: 'Paso dos', duration_min: 5, status: 'completed' as const },
        { key: 'new-1', id: null, name: 'Paso nuevo', duration_min: 4, status: 'completed' as const },
      ],
      pendingDeletes: new Set<string>(),
    };
    const plan = buildEditPlan(originalWithStatus, draft);
    expect(plan.stepStatusChanges).toContainEqual({ key: 'new-1', id: null, to: 'completed' });
  });

  it('paso nuevo en pending no genera cambio', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: [
        { key: 's1', id: 1, name: 'Paso uno', duration_min: 3, status: 'pending' as const },
        { key: 's2', id: 2, name: 'Paso dos', duration_min: 5, status: 'completed' as const },
        { key: 'new-1', id: null, name: 'Paso nuevo', duration_min: 4, status: 'pending' as const },
      ],
      pendingDeletes: new Set<string>(),
    };
    const plan = buildEditPlan(originalWithStatus, draft);
    expect(plan.stepStatusChanges.find((c) => c.key === 'new-1')).toBeUndefined();
  });

  it('paso borrado con status distinto no genera cambio', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: [
        { key: 's1', id: 1, name: 'Paso uno', duration_min: 3, status: 'completed' as const },
      ],
      pendingDeletes: new Set(['s2']),
    };
    const plan = buildEditPlan(originalWithStatus, draft);
    expect(plan.stepStatusChanges.find((c) => c.key === 's2')).toBeUndefined();
  });

  it('sin cambios → stepStatusChanges vacío', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: originalWithStatus.steps.map((s) => ({ ...s })),
      pendingDeletes: new Set<string>(),
    };
    const plan = buildEditPlan(originalWithStatus, draft);
    expect(plan.stepStatusChanges).toEqual([]);
  });
});

describe('hasUnsavedChanges - estado', () => {
  const original = {
    name: 'Tarea original',
    description: 'Descripción original',
    due_date: '2026-10-20',
    steps: [{ key: 's1', id: 1, name: 'Paso uno', duration_min: 3, status: 'pending' as const }],
  };

  it('solo cambio de estado → true', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: [{ key: 's1', id: 1, name: 'Paso uno', duration_min: 3, status: 'completed' as const }],
      pendingDeletes: new Set<string>(),
    };
    expect(hasUnsavedChanges(original, draft)).toBe(true);
  });

  it('cambiar a completed y volver a pending → sin cambios', () => {
    const draft = {
      name: 'Tarea original',
      description: 'Descripción original',
      due_date: '2026-10-20',
      steps: [{ key: 's1', id: 1, name: 'Paso uno', duration_min: 3, status: 'pending' as const }],
      pendingDeletes: new Set<string>(),
    };
    const plan = buildEditPlan(original, draft);
    expect(plan.stepStatusChanges).toEqual([]);
    expect(hasUnsavedChanges(original, draft)).toBe(false);
  });
});