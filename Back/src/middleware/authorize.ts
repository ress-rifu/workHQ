import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

/**
 * Middleware to check if user has required role(s)
 * Must be used after authenticate middleware
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    const userRole = req.user.role as Role;

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource',
        requiredRoles: allowedRoles,
        yourRole: userRole
      });
      return;
    }

    next();
  };
};

/**
 * Check if user is Admin
 */
export const isAdmin = authorize(Role.ADMIN);

/**
 * Check if user is HR or Admin
 */
export const isHROrAdmin = authorize(Role.HR, Role.ADMIN);

/**
 * Check if user is Employee (includes HR and Admin as they are also employees)
 */
export const isEmployee = authorize(Role.EMPLOYEE, Role.HR, Role.ADMIN);

