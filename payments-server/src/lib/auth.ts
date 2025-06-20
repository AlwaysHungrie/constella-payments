import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Validation schemas
export const signupSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, {
    message: 'Username must contain only letters, numbers, and underscores'
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters long'
  }),
  email: z.string().email().optional(),
  name: z.string().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// JWT token generation
export const generateToken = (merchantId: string, username: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    { 
      merchantId, 
      username,
      type: 'merchant'
    },
    secret,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    }
  );
};

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Password verification
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// JWT token verification
export const verifyToken = (token: string): { merchantId: string; username: string; type: string } => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const decoded = jwt.verify(token, secret) as { merchantId: string; username: string; type: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}; 