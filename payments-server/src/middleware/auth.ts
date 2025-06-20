import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/auth';
import { CustomError } from './errorHandler';

// Extend Express Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        merchantId: string;
        username: string;
        type: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    throw new CustomError('Access token required', 401);
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    throw new CustomError('Invalid or expired token', 401);
  }
};

export const requireMerchant = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new CustomError('Authentication required', 401);
  }

  if (req.user.type !== 'merchant') {
    throw new CustomError('Merchant access required', 403);
  }

  next();
}; 