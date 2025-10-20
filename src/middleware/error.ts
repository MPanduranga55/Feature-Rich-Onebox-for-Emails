import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal Server Error' });
}
