# Demo Backend

A Node.js TypeScript Express backend with Prisma ORM, PostgreSQL database, and Google OAuth authentication.

## Features

- Express.js with TypeScript
- Prisma ORM with PostgreSQL
- Google OAuth 2.0 authentication
- JWT token-based sessions
- User data storage and retrieval
- CORS enabled for frontend integration

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Google OAuth credentials

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. PostgreSQL Setup

#### Option A: Local PostgreSQL Installation

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
   CREATE DATABASE demo_db;
   CREATE USER demo_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE demo_db TO demo_user;
   \q
   ```

#### Option B: Docker PostgreSQL

```bash
docker run --name demo-postgres \
  -e POSTGRES_DB=demo_db \
  -e POSTGRES_USER=demo_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback` (for development)
   - `https://yourdomain.com/auth/google/callback` (for production)
7. Copy the Client ID and Client Secret

### 4. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Update `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://demo_user:your_password@localhost:5432/demo_db"
   
   # JWT Secret (generate a secure random string)
   JWT_SECRET="your-super-secret-jwt-key-here"
   
   # Google OAuth (from step 3)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Session Secret (generate a secure random string)
   SESSION_SECRET="your-session-secret-here"
   
   # Server
   PORT=3001
   NODE_ENV=development
   
   # Frontend URL
   FRONTEND_URL="http://localhost:3000"
   ```

### 5. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations (recommended for production)
npm run db:migrate
```

### 6. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## API Endpoints

- `GET /health` - Health check
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `GET /api/user` - Get current user (requires JWT token)
- `GET /api/logout` - Logout user

## Database Schema

The application uses a single `User` table with the following fields:
- `id` - Unique identifier
- `email` - User's email address
- `name` - User's display name
- `googleId` - Google OAuth ID
- `picture` - User's profile picture URL
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio for database management 