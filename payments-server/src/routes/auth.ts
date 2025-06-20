import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { 
  signupSchema, 
  loginSchema, 
  generateToken, 
  hashPassword, 
  verifyPassword,
  type SignupInput,
  type LoginInput
} from '../lib/auth';
import { CustomError } from '../middleware/errorHandler';
import { authenticateToken, requireMerchant } from '../middleware/auth';

const router = Router();

// Merchant signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = signupSchema.parse(req.body);
    const { username, password, email, name }: SignupInput = validatedData;

    // Check if username already exists
    const existingMerchant = await prisma.merchant.findUnique({
      where: { username }
    });

    if (existingMerchant) {
      throw new CustomError('Username already exists', 409);
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await prisma.merchant.findUnique({
        where: { email }
      });

      if (existingEmail) {
        throw new CustomError('Email already exists', 409);
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create merchant
    const merchant = await prisma.merchant.create({
      data: {
        username,
        password: hashedPassword,
        email,
        name,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
      }
    });

    // Generate JWT token
    const token = generateToken(merchant.id, merchant.username);

    res.status(201).json({
      message: 'Merchant created successfully',
      merchant,
      token
    });

  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to create merchant', 500);
  }
});

// Merchant login
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body);
    const { username, password }: LoginInput = validatedData;

    // Find merchant by username
    const merchant = await prisma.merchant.findUnique({
      where: { username }
    });

    if (!merchant) {
      throw new CustomError('Invalid credentials', 401);
    }

    // Check if merchant is active
    if (!merchant.isActive) {
      throw new CustomError('Account is deactivated', 403);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, merchant.password);
    if (!isValidPassword) {
      throw new CustomError('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = generateToken(merchant.id, merchant.username);

    res.json({
      message: 'Login successful',
      merchant: {
        id: merchant.id,
        username: merchant.username,
        email: merchant.email,
        name: merchant.name,
        isActive: merchant.isActive,
        createdAt: merchant.createdAt,
      },
      token
    });

  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Login failed', 500);
  }
});

// Get current merchant profile (protected route)
router.get('/me', authenticateToken, requireMerchant, async (req: Request, res: Response) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: req.user!.merchantId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!merchant) {
      throw new CustomError('Merchant not found', 404);
    }

    res.json({ merchant });

  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to fetch merchant profile', 500);
  }
});

export { router as authRoutes }; 