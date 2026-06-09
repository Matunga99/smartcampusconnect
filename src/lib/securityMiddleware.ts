import express from 'express';
import { canAccess, Role } from './security';

export const checkPermission = (action: string, resource: string) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.user && canAccess(req.user.role as Role, action, resource)) {
      return next();
    }
    return res.status(403).json({ error: 'Permission denied' });
  };
};
