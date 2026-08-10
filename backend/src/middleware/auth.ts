import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const userId = verifyToken(header.slice('Bearer '.length));
  if (!userId) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }

  req.userId = userId;
  next();
}
