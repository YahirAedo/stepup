import { Request, Response, NextFunction } from 'express';
import { handleError } from '../utils/handle-error';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const expressError = err as { type?: string; status?: number; message?: string };
  if (expressError.type === 'entity.parse.failed' || expressError.status === 400) {
    return res.status(400).json({ message: 'El body no es un JSON válido' });
  }
  return handleError(res, err);
}
