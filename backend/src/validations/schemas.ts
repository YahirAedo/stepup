import { z } from 'zod';

const requiredName = z.string({ error: 'El nombre es obligatorio' }).min(1, 'El nombre es obligatorio');

export const createTaskSchema = z.object({
  name: requiredName,
  dueDate: z.string().nullable().optional(),
});

export const updateTaskSchema = z.object({
  name: requiredName.optional(),
  dueDate: z.string().nullable().optional(),
});

export const createStepSchema = z.object({
  taskId: z.number({ error: 'taskId debe ser un número' }).int().positive(),
  name: requiredName,
  durationMin: z.number({ error: 'durationMin debe ser un número' }).int().positive().nullable().optional(),
});

export const updateStepSchema = z.object({
  name: requiredName.optional(),
  durationMin: z.number({ error: 'durationMin debe ser un número' }).int().positive().nullable().optional(),
});

export const reorderStepsSchema = z.object({
  taskId: z.number({ error: 'taskId debe ser un número' }).int().positive(),
  orderedIds: z.array(z.number().int().positive()).min(1, 'orderedIds no puede estar vacío'),
});
