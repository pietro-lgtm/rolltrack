import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const userId = req.headers['x-user-id'] as string;
  req.userId = userId || 'user1';
  next();
}
