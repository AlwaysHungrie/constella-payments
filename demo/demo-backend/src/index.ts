import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { googleId: profile.id }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          googleId: profile.id,
          email: profile.emails![0].value,
          name: profile.displayName,
          picture: profile.photos![0].value
        }
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error as Error);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// User authentication middleware
const authenticateUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const user = req.user as any;
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth-callback?token=${token}`);
  }
);

// Claim payment endpoint
app.post('/api/claim', authenticateUser, async (req, res) => {
  try {
    const { nonce } = req.body;
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if nonce is already consumed
    const existingNonce = await prisma.consumedNonce.findUnique({
      where: { nonce }
    });

    if (existingNonce) {
      return res.status(409).json({ error: 'Nonce already consumed' });
    }

    // First, authenticate with payments-server to get merchant token
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: process.env.MERCHANT_USERNAME,
        password: process.env.MERCHANT_PASSWORD
      })
    });

    if (!loginResponse.ok) {
      const loginError = await loginResponse.json();
      console.error('Payments-server login failed:', loginError);
      return res.status(500).json({ error: 'Failed to authenticate with payment server' });
    }

    const loginData = await loginResponse.json() as any;
    const merchantToken = loginData.token;

    // Call payments-server to claim the payment using the merchant token
    const paymentsResponse = await fetch('http://localhost:5001/api/payments/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${merchantToken}`
      },
      body: JSON.stringify({ nonce })
    });

    if (!paymentsResponse.ok) {
      const errorData = await paymentsResponse.json();
      return res.status(paymentsResponse.status).json(errorData);
    }

    const paymentData = await paymentsResponse.json() as any;
    const amount = paymentData.paymentRequest.amount;

    // Check if amount is sufficient (painting price is $0)
    const PAINTING_PRICE = 0;
    if (amount < PAINTING_PRICE) {
      return res.status(400).json({ 
        error: 'Insufficient payment amount',
        required: PAINTING_PRICE,
        received: amount
      });
    }

    // Mark nonce as consumed
    await prisma.consumedNonce.create({
      data: {
        nonce,
        userId,
        amount
      }
    });

    // Update user's purchase status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        hasPurchased: true,
        purchasedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        hasPurchased: true,
        purchasedAt: true,
        createdAt: true
      }
    });

    res.json({
      message: 'Payment completed successfully',
      amount,
      user: updatedUser
    });

  } catch (error) {
    console.error('Claim error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

app.get('/api/user', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        hasPurchased: true,
        purchasedAt: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.post('/api/purchase', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Update user's purchase status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        hasPurchased: true,
        purchasedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        hasPurchased: true,
        purchasedAt: true,
        createdAt: true
      }
    });

    res.json({ 
      message: 'Purchase recorded successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Failed to record purchase' });
  }
});

app.get('/api/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
}); 