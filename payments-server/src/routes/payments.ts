import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { generateWallet } from '../lib/ethereum';
import { CustomError } from '../middleware/errorHandler';
import { authenticateToken, requireMerchant } from '../middleware/auth';

const router: Router = Router();

// Validation schemas
const createPaymentRequestSchema = z.object({
  nonce: z.string().min(1, 'Nonce is required')
});

const claimPaymentRequestSchema = z.object({
  nonce: z.string().min(1, 'Nonce is required')
});

// Create payment request (public endpoint)
router.post('/create', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createPaymentRequestSchema.parse(req.body);
    const { nonce } = validatedData;

    // Check if nonce already exists
    const existingRequest = await prisma.paymentRequest.findUnique({
      where: { nonce }
    });

    if (existingRequest) {
      throw new CustomError('Payment request with this nonce already exists', 409);
    }

    // Generate wallet
    const wallet = generateWallet();

    // Create payment request
    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        nonce,
        walletAddress: wallet.address,
        walletPrivateKey: wallet.privateKey,
        amount: 0,
        status: 'pending'
      },
      select: {
        id: true,
        nonce: true,
        walletAddress: true,
        amount: true,
        status: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Payment request created successfully',
      paymentRequest
    });

  } catch (error) {
    next(error);
  }
});

// Claim payment request (merchant only)
router.post('/claim', authenticateToken, requireMerchant, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = claimPaymentRequestSchema.parse(req.body);
    const { nonce } = validatedData;
    const merchantId = req.user!.merchantId;

    // Find payment request
    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { nonce }
    });

    if (!paymentRequest) {
      throw new CustomError('Payment request not found', 404);
    }

    // Check if already claimed by a different merchant
    if (paymentRequest.status === 'claimed' && paymentRequest.merchantId !== merchantId) {
      throw new CustomError('Payment request already claimed by another merchant', 409);
    }

    // Calculate new amount (placeholder for now - will be implemented later)
    const newAmount = calculateAmount(paymentRequest.walletAddress);

    // Claim or re-claim the payment request
    const updatedRequest = await prisma.paymentRequest.update({
      where: { nonce },
      data: {
        status: 'claimed',
        merchantId,
        amount: newAmount
      },
      select: {
        id: true,
        nonce: true,
        walletAddress: true,
        amount: true,
        status: true,
        merchantId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const message = paymentRequest.status === 'claimed' 
      ? 'Payment request amount updated successfully'
      : 'Payment request claimed successfully';

    res.json({
      message,
      paymentRequest: updatedRequest
    });

  } catch (error) {
    next(error);
  }
});

// Placeholder function for amount calculation (to be implemented later)
function calculateAmount(walletAddress: string): number {
  // TODO: Implement actual amount calculation logic
  // For now, return a random amount between 0.1 and 1.0 ETH
  // return Math.random() * 0.9 + 0.1;
  return 0;
} 

// Get merchant balance (merchant only)
router.get('/balance', authenticateToken, requireMerchant, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.user!.merchantId;

    // Get all claimed payment requests for this merchant
    const claimedRequests = await prisma.paymentRequest.findMany({
      where: {
        merchantId,
        status: 'claimed'
      },
      select: {
        amount: true
      }
    });

    // Calculate total balance
    const totalBalance = claimedRequests.reduce((sum: number, request: { amount: number }) => sum + request.amount, 0);

    res.json({
      merchantId,
      totalBalance,
      claimedRequestsCount: claimedRequests.length
    });

  } catch (error) {
    next(error);
  }
});

// Get all claimed payment requests for merchant (with pagination)
router.get('/claimed', authenticateToken, requireMerchant, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.user!.merchantId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get claimed payment requests with pagination
    const [claimedRequests, totalCount] = await Promise.all([
      prisma.paymentRequest.findMany({
        where: {
          merchantId,
          status: 'claimed'
        },
        select: {
          id: true,
          nonce: true,
          walletAddress: true,
          amount: true,
          status: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.paymentRequest.count({
        where: {
          merchantId,
          status: 'claimed'
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      claimedRequests,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get payment request by nonce (public endpoint)
router.get('/:nonce', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nonce } = req.params;

    if (!nonce) {
      throw new CustomError('Nonce is required', 400);
    }

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { nonce },
      select: {
        id: true,
        nonce: true,
        walletAddress: true,
        amount: true,
        status: true,
        createdAt: true
      }
    });

    if (!paymentRequest) {
      throw new CustomError('Payment request not found', 404);
    }

    res.json({ paymentRequest });

  } catch (error) {
    next(error);
  }
});

export { router as paymentRoutes }; 