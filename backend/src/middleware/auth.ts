import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

// FIX: @prisma/client does not export 'Role' as a named export when the client isn't
// fully generated. Define our own Role type to match the Prisma schema enum.
export type Role = 'CUSTOMER' | 'SELLER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  isActive: boolean;
}

declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error, user: AuthUser) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (_err: Error, user: AuthUser) => {
    if (user) req.user = user;
    next();
  })(req, res, next);
};

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role as Role)) {
      return res.status(403).json({ success: false, message: 'Forbidden - Insufficient permissions' });
    }
    next();
  };
};
