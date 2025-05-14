import { Request, Response, NextFunction } from 'express';

export function parseJsonFields(req: Request, res: Response, next: NextFunction) {
  if (typeof req.body.title === 'string') {
    try {
      req.body.title = JSON.parse(req.body.title);
    } catch {}
  }
  if (typeof req.body.content === 'string') {
    try {
      req.body.content = JSON.parse(req.body.content);
    } catch {}
  }
  next();
} 