import { z } from 'zod';

const requiredName = z.string({ error: 'El nombre es obligatorio' }).min(1, 'El nombre es obligatorio');

const isoDateTime = z.string({ error: 'Debe ser un timestamp ISO' }).min(1, 'Debe ser un timestamp ISO');

const parseableDate = z.string().nullable().optional();

export const createTaskSchema = z.object({
  name: requiredName,
  dueDate: parseableDate,
});

export const updateTaskSchema = z.object({
  name: requiredName.optional(),
  dueDate: parseableDate,
});

export const createStepToTaskSchema = z.object({
  name: requiredName,
  durationMin: z
    .number({ error: 'durationMin debe ser un número' })
    .int('durationMin debe ser un número entero')
    .positive('durationMin debe ser mayor a 0')
    .nullable()
    .optional(),
});

export const createStepSchema = createStepToTaskSchema.extend({
  taskId: z.string({ error: 'taskId debe ser un UUID válido' }).uuid('taskId debe ser un UUID válido'),
});

export const updateStepSchema = z.object({
  name: requiredName.optional(),
  durationMin: z
    .number({ error: 'durationMin debe ser un número' })
    .int('durationMin debe ser un número entero')
    .positive('durationMin debe ser mayor a 0')
    .nullable()
    .optional(),
});

export const reorderStepsSchema = z.object({
  taskId: z.string({ error: 'taskId debe ser un UUID válido' }).uuid('taskId debe ser un UUID válido'),
  orderedIds: z
    .array(z.string().uuid('orderedIds debe contener UUIDs válidos'), {
      error: 'orderedIds debe ser un array',
    })
    .min(1, 'orderedIds no puede estar vacío'),
});

export const registerSchema = z.object({
  name: requiredName,
  email: z.string({ error: 'El email es obligatorio' }).email('El email es inválido'),
  password: z.string({ error: 'La contraseña es obligatoria' }).min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const loginSchema = z.object({
  email: z.string({ error: 'El email es obligatorio' }).email('El email es inválido'),
  password: z.string({ error: 'La contraseña es obligatoria' }).min(1, 'La contraseña es obligatoria'),
});

const syncTaskBase = {
  id: z.string().uuid().optional(),
  localId: z
    .number({ error: 'localId debe ser un número' })
    .int('localId debe ser un número entero')
    .positive('localId debe ser mayor a 0')
    .optional(),
  name: requiredName,
  dueDate: parseableDate,
  status: z.enum(['active', 'completed']).optional(),
  createdAt: isoDateTime.optional(),
  updatedAt: isoDateTime,
  completedAt: parseableDate,
};

const syncStepBase = {
  id: z.string().uuid().optional(),
  localId: z
    .number({ error: 'localId debe ser un número' })
    .int('localId debe ser un número entero')
    .positive('localId debe ser mayor a 0')
    .optional(),
  taskId: z.string().uuid().optional(),
  taskLocalId: z
    .number({ error: 'taskLocalId debe ser un número' })
    .int('taskLocalId debe ser un número entero')
    .positive('taskLocalId debe ser mayor a 0')
    .optional(),
  name: requiredName,
  durationMin: z
    .number({ error: 'durationMin debe ser un número' })
    .int('durationMin debe ser un número entero')
    .positive('durationMin debe ser mayor a 0')
    .nullable()
    .optional(),
  orderIndex: z
    .number({ error: 'orderIndex debe ser un número' })
    .int('orderIndex debe ser un número entero')
    .min(0, 'orderIndex debe ser mayor o igual a 0'),
  status: z.enum(['pending', 'completed']).optional(),
  createdAt: isoDateTime.optional(),
  updatedAt: isoDateTime,
  completedAt: parseableDate,
};

export const syncPushSchema = z.object({
  tasks: z.array(z.object(syncTaskBase), { error: 'tasks debe ser un array' }).default([]),
  steps: z.array(z.object(syncStepBase), { error: 'steps debe ser un array' }).default([]),
});

export const syncMigrateSchema = z.object({
  name: requiredName,
  email: z.string({ error: 'El email es obligatorio' }).email('El email es inválido'),
  password: z.string({ error: 'La contraseña es obligatoria' }).min(6, 'La contraseña debe tener al menos 6 caracteres'),
  tasks: z
    .array(
      z.object({
        ...syncTaskBase,
        localId: z
          .number({ error: 'localId debe ser un número' })
          .int('localId debe ser un número entero')
          .positive('localId debe ser mayor a 0'),
      }),
      { error: 'tasks debe ser un array' },
    )
    .default([]),
  steps: z
    .array(
      z.object({
        ...syncStepBase,
        localId: z
          .number({ error: 'localId debe ser un número' })
          .int('localId debe ser un número entero')
          .positive('localId debe ser mayor a 0'),
        taskLocalId: z
          .number({ error: 'taskLocalId debe ser un número' })
          .int('taskLocalId debe ser un número entero')
          .positive('taskLocalId debe ser mayor a 0'),
      }),
      { error: 'steps debe ser un array' },
    )
    .default([]),
});
