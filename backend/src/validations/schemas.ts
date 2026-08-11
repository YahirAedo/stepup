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

export const createStepSchema = z.object({
  taskId: z.string({ error: 'taskId debe ser un UUID válido' }).uuid('taskId debe ser un UUID válido'),
  name: requiredName,
  durationMin: z.number({ error: 'durationMin debe ser un número' }).int().positive().nullable().optional(),
});

export const updateStepSchema = z.object({
  name: requiredName.optional(),
  durationMin: z.number({ error: 'durationMin debe ser un número' }).int().positive().nullable().optional(),
});

export const reorderStepsSchema = z.object({
  taskId: z.string({ error: 'taskId debe ser un UUID válido' }).uuid('taskId debe ser un UUID válido'),
  orderedIds: z.array(z.string().uuid('orderedIds debe contener UUIDs válidos')).min(1, 'orderedIds no puede estar vacío'),
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
  localId: z.number().int().positive().optional(),
  name: requiredName,
  dueDate: parseableDate,
  status: z.enum(['active', 'completed']).optional(),
  createdAt: isoDateTime.optional(),
  updatedAt: isoDateTime,
  completedAt: parseableDate,
};

const syncStepBase = {
  id: z.string().uuid().optional(),
  localId: z.number().int().positive().optional(),
  taskId: z.string().uuid().optional(),
  taskLocalId: z.number().int().positive().optional(),
  name: requiredName,
  durationMin: z.number().int().positive().nullable().optional(),
  orderIndex: z.number().int().min(0),
  status: z.enum(['pending', 'completed']).optional(),
  createdAt: isoDateTime.optional(),
  updatedAt: isoDateTime,
  completedAt: parseableDate,
};

export const syncPushSchema = z.object({
  tasks: z.array(z.object(syncTaskBase)).default([]),
  steps: z.array(z.object(syncStepBase)).default([]),
});

export const syncMigrateSchema = z.object({
  name: requiredName,
  email: z.string({ error: 'El email es obligatorio' }).email('El email es inválido'),
  password: z.string({ error: 'La contraseña es obligatoria' }).min(6, 'La contraseña debe tener al menos 6 caracteres'),
  tasks: z
    .array(
      z.object({
        ...syncTaskBase,
        localId: z.number().int().positive(),
      }),
    )
    .default([]),
  steps: z
    .array(
      z.object({
        ...syncStepBase,
        localId: z.number().int().positive(),
        taskLocalId: z.number().int().positive(),
      }),
    )
    .default([]),
});
