declare global {
  namespace Express {
    interface Request {
      userId?: string;
      idempotencyKey?: string;
    }
  }
}

export {};
