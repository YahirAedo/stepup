import { Request, Response, NextFunction } from 'express';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function requireIdempotencyKey(req: Request, res: Response, next: NextFunction) {
  const method = req.method.toUpperCase();
  if (method !== 'PATCH' && method !== 'POST' && method !== 'PUT') {
    return next();
  }

  const key = req.headers['idempotency-key'];
  if (key === undefined) {
    return next();
  }

  if (Array.isArray(key)) {
    return res.status(400).json({ message: 'Idempotency-Key inválida' });
  }

  if (!UUID_RE.test(key)) {
    return res.status(400).json({ message: 'Idempotency-Key debe ser un UUID válido' });
  }

  req.idempotencyKey = key;
  next();
}
