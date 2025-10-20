import { Request, Response } from 'express';

export async function getAccount(req: Request, res: Response) {
  res.json({ user: 'demo' });
}
