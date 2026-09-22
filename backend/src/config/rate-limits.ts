import { Request } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const keyGenerator = (req: Request) =>
  ipKeyGenerator(req.ip ?? req.socket.remoteAddress ?? 'unknown');

// In tests the limit is raised so integration tests do not flake; the
// factories accept an explicit override so security tests can exercise the
// real limiter configuration with a small window.
const defaultMax = (max: number) => () => (process.env.NODE_ENV === 'test' ? 100 : max);

type MaxParam = number | (() => number);

export const createLoginLimiter = (max: MaxParam = defaultMax(5)) =>
  rateLimit({
    windowMs: 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    message: { message: 'Demasiados intentos de login. Intenta nuevamente en un minuto.' },
  });

export const createRegisterLimiter = (max: MaxParam = defaultMax(3)) =>
  rateLimit({
    windowMs: 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    message: { message: 'Demasiados registros. Intenta nuevamente en un minuto.' },
  });

export const createMigrateLimiter = (max: MaxParam = defaultMax(2)) =>
  rateLimit({
    windowMs: 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    message: { message: 'Demasiadas migraciones. Intenta nuevamente en un minuto.' },
  });
