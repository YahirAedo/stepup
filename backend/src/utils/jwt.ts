import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

const TOKEN_TTL = '30d';

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as { sub?: string };
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
