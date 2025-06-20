# Constella Payments Server

A Node.js TypeScript Express backend for payment processing with merchant authentication using Prisma ORM and PostgreSQL.

## Features

- 🔐 **Merchant Authentication**: Signup and login with JWT tokens
- 🛡️ **Security**: Password hashing, rate limiting, CORS protection
- 📊 **Database**: PostgreSQL with Prisma ORM
- ✅ **Validation**: Input validation with Zod
- 🚀 **TypeScript**: Full type safety
- 🔧 **Development**: Hot reload with ts-node-dev

## Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL 12+

## Setup

### Option A: Local PostgreSQL Installation

1. **Install PostgreSQL:**
   - **macOS:** `brew install postgresql`
   - **Ubuntu:** `sudo apt-get install postgresql postgresql-contrib`
   - **Windows:** Download from [postgresql.org](https://www.postgresql.org/download/windows/)

2. **Start PostgreSQL service:**
   - **macOS:** `brew services start postgresql`
   - **Ubuntu:** `sudo systemctl start postgresql`
   - **Windows:** PostgreSQL service should start automatically

3. **Create database:**
   ```bash
   psql -U postgres
   CREATE DATABASE constella_payments;
   CREATE USER constella_user WITH PASSWORD 'constella_password' CREATEDB;
   GRANT ALL PRIVILEGES ON DATABASE constella_payments TO constella_user;
   \q
   ```

4. **Install dependencies:**
   ```bash
   pnpm install
   ```

5. **Setup environment:**
   ```bash
   cp env.example .env
   ```

6. **Setup database:**
   ```bash
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

7. **Start development server:**
   ```bash
   pnpm dev
   ```

The server will start on `http://localhost:3001`

## Environment Configuration

The `.env` file contains:

```env
# Database - PostgreSQL (Local Setup)
DATABASE_URL="postgresql://constella_user:constella_password@localhost:5432/constella_payments"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV="development"

# Optional: CORS Configuration
CORS_ORIGIN="http://localhost:3000"

# Optional: Database Pool Configuration
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

## Database Management

### Prisma Studio
View and edit your database through a web interface:
```bash
pnpm db:studio
```

### Database Commands
```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed database with sample data
pnpm db:seed

# Reset database (development only)
pnpm db:migrate:reset
```

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
Create a new merchant account.

**Request Body:**
```json
{
  "username": "my_merchant",
  "password": "securepassword123",
  "email": "merchant@example.com",
  "name": "My Merchant Store"
}
```

#### POST `/api/auth/login`
Authenticate a merchant and receive a JWT token.

**Request Body:**
```json
{
  "username": "my_merchant",
  "password": "securepassword123"
}
```

#### GET `/api/auth/me`
Get current merchant profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### Health Check

#### GET `/health`
Check server status.

## Sample Data

The database is seeded with sample merchants:
- Username: `demo_merchant`, Password: `password123`
- Username: `test_shop`, Password: `password123`
- Username: `sample_store`, Password: `password123`

## Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema to database
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:seed` - Seed database with sample data

## Security Features

- **Password Hashing**: Uses bcrypt with 12 salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable CORS settings
- **Helmet**: Security headers
- **Input Validation**: Zod schema validation
- **Error Handling**: Centralized error handling
- **Connection Pooling**: PostgreSQL connection pooling for performance

## Project Structure

```
src/
├── index.ts          # Main server entry point
├── lib/
│   ├── prisma.ts     # Prisma client configuration
│   └── auth.ts       # Authentication utilities
├── middleware/
│   ├── auth.ts       # Authentication middleware
│   └── errorHandler.ts # Error handling middleware
├── routes/
│   └── auth.ts       # Authentication routes
└── seed.ts           # Database seeding script
prisma/
└── schema.prisma     # Database schema
```

## License

MIT 