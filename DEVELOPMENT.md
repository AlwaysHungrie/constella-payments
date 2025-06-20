# Development Configuration

## Port Configuration

This project uses specific ports for development to avoid conflicts:

- **Backend Server**: `http://localhost:5001`
- **Frontend Dashboard**: `http://localhost:5002`
- **Database**: `localhost:5432` (PostgreSQL)

## Environment Setup

### Backend Server (payments-server)

1. Copy environment file:
   ```bash
   cd payments-server
   cp env.example .env
   ```

2. Update `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://constella_user:constella_password@localhost:5432/constella_payments"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=5001
   ```

3. Install dependencies and setup database:
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Dashboard (payment-dashboard)

1. Install dependencies:
   ```bash
   cd payment-dashboard
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

The frontend is configured to connect to the backend at `http://localhost:5001/api`.

Key endpoints:
- `POST /api/auth/signup` - Merchant registration
- `POST /api/auth/login` - Merchant login
- `GET /api/auth/me` - Get current merchant profile
- `POST /api/payments/claim` - Claim a payment
- `GET /api/payments/balance` - Get merchant balance
- `GET /api/payments/claimed` - Get claimed payments

## Authentication Flow

1. **Login/Signup**: Tokens are stored in both localStorage and cookies
2. **API Requests**: Tokens are automatically added to Authorization header
3. **Route Protection**: Middleware checks cookies for authentication
4. **Dashboard Access**: Requires valid authentication token

## Common Issues

### Port Already in Use
If you get "port already in use" errors:
- Check if another process is using the port: `lsof -i :5001` or `lsof -i :5002`
- Kill the process or change the port in the respective configuration

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Run `npx prisma db push` to sync schema

### Authentication Issues
- Clear browser localStorage and cookies
- Check JWT_SECRET is set in backend `.env`
- Verify API base URL matches server port

## Development Workflow

1. Start PostgreSQL database
2. Start backend server (`npm run dev` in payments-server)
3. Start frontend (`npm run dev` in payment-dashboard)
4. Access dashboard at `http://localhost:5002`
5. Login/signup to access protected routes 