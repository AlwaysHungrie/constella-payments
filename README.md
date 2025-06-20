# Constella Payments

Start accepting USDC payments directly in your app in under 5 minutes.

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- pnpm (recommended) or npm

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd constella-payments
   ```

2. **Setup backend server:**
   ```bash
   cd payments-server
   cp env.example .env
   # Edit .env with your database credentials
   npm install
   npx prisma db push
   npm run dev
   ```

3. **Setup frontend dashboard:**
   ```bash
   cd payment-dashboard
   npm install
   npm run dev
   ```

4. **Access the application:**
   - Backend API: http://localhost:5001
   - Frontend Dashboard: http://localhost:5002

## Project Structure

- `payments-server/` - Backend API server (Express + Prisma + PostgreSQL)
- `payment-dashboard/` - Frontend dashboard (Next.js + TypeScript)
- `demo/` - Demo applications for testing

## Documentation

- [Development Configuration](./DEVELOPMENT.md) - Detailed setup and troubleshooting
- [API Documentation](./payments-server/README.md) - Backend API reference
- [Dashboard Documentation](./payment-dashboard/README.md) - Frontend dashboard guide

## Port Configuration

- **Backend Server**: Port 5001
- **Frontend Dashboard**: Port 5002  
- **Database**: Port 5432 (PostgreSQL)

See [DEVELOPMENT.md](./DEVELOPMENT.md) for complete configuration details.
