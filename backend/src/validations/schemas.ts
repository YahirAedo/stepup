import { z } from 'zod';

const requiredName = z.string({ error: 'El nombre es obligatorio' }).min(1, 'El nombre es obligatorio');

export const AUTH_PASSWORD_MIN = 8;
export const AUTH_PASSWORD_MAX_BYTES = 72;
export const AUTH_NAME_MAX = 120;
export const AUTH_EMAIL_MAX = 254;
export const TASK_DESCRIPTION_MAX = 1000;

const optionalDescription = z
  .string()
  .trim()
  .max(TASK_DESCRIPTION_MAX, `La descripción no puede superar ${TASK_DESCRIPTION_MAX} caracteres`)
  .nullable()
  .optional();

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

function isValidDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, yearStr, monthStr, dayStr] = match;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
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
  description: optionalDescription,
  dueDate: parseableDate,
});

function hasAtLeastOneField(value: Record<string, unknown>): boolean {
  return Object.keys(value).length > 0;
}

export const updateTaskSchema = z
  .object({
    name: requiredName.optional(),
    description: optionalDescription,
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
      .refine(isValidDate, { message: 'La fecha debe ser válida con formato YYYY-MM-DD' })
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

export const AI_TASK_NAME_MAX = 200;
export const AI_DESCRIPTION_MAX = 1000;

const aiTaskName = z
  .string({ error: 'taskName es obligatorio' })
  .trim()
  .min(1, 'taskName es obligatorio')
  .max(AI_TASK_NAME_MAX, `taskName no puede superar ${AI_TASK_NAME_MAX} caracteres`);

export const suggestStepsSchema = z.object({
  taskName: aiTaskName,
  description: z
    .string({ error: 'description debe ser un string' })
    .trim()
    .max(AI_DESCRIPTION_MAX, `description no puede superar ${AI_DESCRIPTION_MAX} caracteres`)
    .optional(),
});

export const describeHelpSchema = z.object({
  taskName: aiTaskName,
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
  description: optionalDescription,
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
  date: z
    .string()
    .refine(isValidDate, { message: 'date debe ser una fecha válida con formato YYYY-MM-DD' })
    .optional(),
};

export const syncPushSchema = z.object({
  tasks: z.array(z.object(syncTaskBase), { error: 'tasks debe ser un array' }).default([]),
  steps: z.array(z.object(syncStepBase), { error: 'steps debe ser un array' }).default([]),
}).refine((data) => {
  return data.tasks.every((task) => isAfterCreatedAt(task.updatedAt, task.createdAt));
}, {
  message: 'updatedAt no puede ser anterior a createdAt',
  path: ['tasks'],
}).refine((data) => {
  return data.steps.every((step) => isAfterCreatedAt(step.updatedAt, step.createdAt));
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
  return data.tasks.every((task) => isAfterCreatedAt(task.updatedAt, task.createdAt));
}, {
  message: 'updatedAt no puede ser anterior a createdAt',
  path: ['tasks'],
}).refine((data) => {
  return data.steps.every((step) => isAfterCreatedAt(step.updatedAt, step.createdAt));
}, {
  message: 'updatedAt no puede ser anterior a createdAt',
  path: ['steps'],
});
