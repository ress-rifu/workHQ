import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import prisma from '../utils/prisma';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        employeeId?: string;
      };
    }
  }
}

/**
 * Middleware to verify Supabase JWT token and attach user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
      return;
    }

    // Get user details from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: { employee: true }
    });

    if (!dbUser) {
      res.status(404).json({
        error: 'User not found',
        message: 'User does not exist in database'
      });
      return;
    }

    // Attach user info to request
    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      employeeId: dbUser.employee?.id
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to authenticate user'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (!error && user) {
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
        include: { employee: true }
      });

      if (dbUser) {
        req.user = {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          employeeId: dbUser.employee?.id
        };
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

