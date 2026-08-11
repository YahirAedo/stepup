import { Response } from 'express';
import { ZodError } from 'zod';

const KNOWN_MESSAGES: Record<string, { status: number; message: string }> = {
  CANNOT_COMPLETE_WITH_PENDING_STEPS: {
    status: 409,
    message: 'No se puede completar una tarea con pasos pendientes',
  },
  TASK_NOT_FOUND: { status: 404, message: 'La tarea especificada no existe' },
  STEP_NOT_FOUND: { status: 404, message: 'El paso especificado no existe' },
  STEP_ALREADY_COMPLETED: { status: 400, message: 'El paso ya se encuentra completado' },
  EMAIL_ALREADY_REGISTERED: { status: 409, message: 'El email ya está registrado' },
  INVALID_CREDENTIALS: { status: 401, message: 'Credenciales inválidas' },
  RECORD_BELONGS_TO_OTHER_USER: {
    status: 409,
    message: 'El registro pertenece a otro usuario',
  },
  INVALID_SINCE: { status: 400, message: 'El parámetro since no es una fecha válida' },
};

export function handleError(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: error.issues[0]?.message ?? 'Datos inválidos' });
  }

  const prismaError = error as { code?: string };
  if (prismaError.code === 'P2025') {
    return res.status(404).json({ message: 'Registro no encontrado' });
  }

  const message = error instanceof Error ? error.message : '';
  const mapped = KNOWN_MESSAGES[message];
  if (mapped) {
    return res.status(mapped.status).json({ message: mapped.message });
  }

  return res.status(500).json({ message: 'Error interno del servidor' });
}
