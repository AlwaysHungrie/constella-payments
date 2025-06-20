# Constella Payments Demo

This demo showcases a complete payment flow using Constella Payments with a frontend art gallery and backend services.

## Architecture

- **Frontend**: Next.js app running on port 3000
- **Demo Backend**: Express.js server running on port 3001 (handles user auth and payment completion)
- **Payments Server**: Express.js server running on port 5001 (handles payment requests and blockchain integration)

## Payment Flow

1. **User Authentication**: Users sign in with Google OAuth
2. **Purchase Initiation**: User clicks "Purchase Painting" button
3. **Payment Request Creation**: 
   - Random nonce is generated
   - Request sent to payments-server to create payment request
   - Returns wallet address for USDC payment
4. **Payment Instructions**: Modal displays wallet address and instructions
5. **Payment Completion**: 
   - User sends USDC to the provided address
   - User clicks "Complete Payment" button
   - Demo backend calls payments-server claim endpoint
   - If amount is sufficient, payment is marked as complete
   - Nonce is marked as consumed in database

## Setup Instructions

### 1. Frontend (Port 3000)
```bash
cd demo-frontend
npm install
npm run dev
```

### 2. Demo Backend (Port 3001)
```bash
cd demo-backend
npm install
# Copy env.example to .env and configure
cp env.example .env
# Update database URL and other credentials
npx prisma db push
npm run dev
```

### 3. Payments Server (Port 5001)
```bash
cd ../../payments-server
npm install
# Copy env.example to .env and configure
cp env.example .env
# Update database URL and other credentials
npx prisma db push
npm run dev

# In a new terminal, set up the demo merchant account
cd payments-server
node setup-demo-merchant.js
```

## Environment Variables

### Demo Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/demo_db"
JWT_SECRET="your-super-secret-jwt-key-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
SESSION_SECRET="your-session-secret-here"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
MERCHANT_USERNAME="demo-merchant"
MERCHANT_PASSWORD="demo-password-123"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_PAYMENTS_API_URL="http://localhost:5001"
```

## Database Schema

### Demo Backend
- `users`: User accounts with purchase status
- `consumed_nonces`: Tracks used payment nonces to prevent double-spending

### Payments Server
- `payment_requests`: Payment requests with wallet addresses
- `merchants`: Merchant accounts
- `users`: User accounts

## API Endpoints

### Demo Backend
- `POST /api/claim`: Complete payment and mark as purchased
- `GET /api/user`: Get user information
- `POST /api/purchase`: Record purchase (legacy endpoint)

### Payments Server
- `POST /api/payments/create`: Create payment request with nonce
- `POST /api/payments/claim`: Claim payment and calculate amount
- `GET /api/payments/balance`: Get merchant balance
- `GET /api/payments/claimed`: Get claimed payments

## Security Features

- **Nonce-based payments**: Each payment uses a unique nonce
- **Double-spend prevention**: Nonces are marked as consumed after use
- **Amount verification**: Payments must meet minimum amount requirements
- **User authentication**: JWT-based authentication for payment operations
- **Backend-only merchant access**: Merchant credentials are only accessible server-side

## Testing the Flow

1. Start all three services
2. Navigate to http://localhost:3000
3. Sign in with Google
4. Click "Purchase Painting"
5. Copy the wallet address from the modal
6. Send 0.5 USDC to the address (or simulate with testnet)
7. Click "Complete Payment"
8. Verify purchase is marked as complete

## Notes

- The painting price is set to $0.5 USDC
- The payments-server currently uses a placeholder amount calculation
- In production, integrate with actual blockchain networks for USDC transfers
- Add proper error handling and retry mechanisms
- Implement webhook notifications for payment confirmations

