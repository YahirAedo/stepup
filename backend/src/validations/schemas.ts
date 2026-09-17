import { z } from 'zod';

const requiredName = z.string({ error: 'El nombre es obligatorio' }).min(1, 'El nombre es obligatorio');

export const AUTH_PASSWORD_MIN = 8;
export const AUTH_PASSWORD_MAX_BYTES = 72;
export const AUTH_NAME_MAX = 120;
export const AUTH_EMAIL_MAX = 254;

const authName = z
  .string({ error: 'El nombre es obligatorio' })
  .trim()
  .min(1, 'El nombre es obligatorio')
  .max(AUTH_NAME_MAX, `El nombre no puede superar ${AUTH_NAME_MAX} caracteres`);

const authEmail = z
  .string({ error: 'El email es obligatorio' })
  .trim()
  .max(AUTH_EMAIL_MAX, `El email no puede superar ${AUTH_EMAIL_MAX} caracteres`)
  .email('El email es inválido');

const authPassword = z
  .string({ error: 'La contraseña es obligatoria' })
  .min(AUTH_PASSWORD_MIN, 'Mínimo 8 caracteres')
  .refine((value) => Buffer.byteLength(value, 'utf8') <= AUTH_PASSWORD_MAX_BYTES, {
    message: 'La contraseña no puede superar 72 bytes',
  });

function isParseableIso(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

const CLOCK_SKEW_TOLERANCE_MS = 60 * 1000;

function isNotFutureTimestamp(value: string): boolean {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return false;
  const now = Date.now();
  return timestamp <= now + CLOCK_SKEW_TOLERANCE_MS;
}

function isAfterCreatedAt(updatedAt: string, createdAt?: string): boolean {
  if (!createdAt) return true;
  const updatedAtMs = Date.parse(updatedAt);
  const createdAtMs = Date.parse(createdAt);
  if (Number.isNaN(updatedAtMs) || Number.isNaN(createdAtMs)) return false;
  return updatedAtMs >= createdAtMs;
}

const isoDateTime = z
  .string({ error: 'Debe ser un timestamp ISO' })
  .min(1, 'Debe ser un timestamp ISO')
  .refine(isParseableIso, { message: 'Debe ser un timestamp ISO válido' });

const syncUpdatedAt = z
  .string({ error: 'Debe ser un timestamp ISO' })
  .min(1, 'Debe ser un timestamp ISO')
  .refine(isParseableIso, { message: 'Debe ser un timestamp ISO válido' })
  .refine(isNotFutureTimestamp, { message: 'updatedAt no puede estar en el futuro' });

const parseableDate = z
  .string()
  .nullable()
  .optional()
  .refine((value) => value == null || value === '' || isParseableIso(value), {
    message: 'Debe ser un timestamp ISO válido',
  });

export const createTaskSchema = z.object({
  name: requiredName,
  dueDate: parseableDate,
});

function hasAtLeastOneField(value: Record<string, unknown>): boolean {
  return Object.keys(value).length > 0;
}

export const updateTaskSchema = z
  .object({
    name: requiredName.optional(),
    dueDate: parseableDate,
  })
  .refine(hasAtLeastOneField, { message: 'Debe enviar al menos un campo para actualizar' });

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

export const updateStepSchema = z
  .object({
    name: requiredName.optional(),
    durationMin: z
      .number({ error: 'durationMin debe ser un número' })
      .int('durationMin debe ser un número entero')
      .positive('durationMin debe ser mayor a 0')
      .nullable()
      .optional(),
  })
  .refine(hasAtLeastOneField, { message: 'Debe enviar al menos un campo para actualizar' });

export const completeStepSchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD')
      .optional(),
  })
  .optional();

export const reorderStepsSchema = z.object({
  taskId: z.string({ error: 'taskId debe ser un UUID válido' }).uuid('taskId debe ser un UUID válido'),
  orderedIds: z
    .array(z.string().uuid('orderedIds debe contener UUIDs válidos'), {
      error: 'orderedIds debe ser un array',
    })
    .min(1, 'orderedIds no puede estar vacío')
    .refine((ids) => new Set(ids).size === ids.length, {
      message: 'orderedIds no puede contener duplicados',
    }),
});

export const registerSchema = z.object({
  name: authName,
  email: authEmail,
  password: authPassword,
});

export const loginSchema = z.object({
  email: authEmail,
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
  updatedAt: syncUpdatedAt,
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
  updatedAt: syncUpdatedAt,
  completedAt: parseableDate,
};

export const syncPushSchema = z.object({
  tasks: z.array(z.object(syncTaskBase), { error: 'tasks debe ser un array' }).default([]),
  steps: z.array(z.object(syncStepBase), { error: 'steps debe ser un array' }).default([]),
}).refine((data) => {
  return data.tasks.every((task) => !task.createdAt || new Date(task.updatedAt) >= new Date(task.createdAt));
}, {
  message: 'updatedAt no puede ser anterior a createdAt',
  path: ['tasks'],
}).refine((data) => {
  return data.steps.every((step) => !step.createdAt || new Date(step.updatedAt) >= new Date(step.createdAt));
}, {
  message: 'updatedAt no puede ser anterior a createdAt',
  path: ['steps'],
});

export const syncMigrateSchema = z.object({
  name: authName,
  email: authEmail,
  password: authPassword,
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
}).refine((data) => {
  return data.tasks.every((task) => !task.createdAt || new Date(task.updatedAt) >= new Date(task.createdAt));
}, {
  message: 'updatedAt no puede ser anterior a createdAt',
  path: ['tasks'],
}).refine((data) => {
  return data.steps.every((step) => !step.createdAt || new Date(step.updatedAt) >= new Date(step.createdAt));
}, {
  message: 'updatedAt no puede ser anterior a createdAt',
  path: ['steps'],
});
