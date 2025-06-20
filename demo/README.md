# Demo Full-Stack Application

A complete full-stack application with Google OAuth authentication, featuring a Next.js frontend and Express.js backend with PostgreSQL database.

## 🚀 Features

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Express.js with TypeScript and Prisma ORM
- **Database**: PostgreSQL with automatic schema management
- **Authentication**: Google OAuth 2.0 with JWT tokens
- **User Management**: Complete user registration and profile management
- **Modern UI**: Responsive design with beautiful user interface

## 📁 Project Structure

```
demo/
├── demo-backend/          # Express.js backend
│   ├── src/              # Source code
│   ├── prisma/           # Database schema
│   ├── package.json      # Backend dependencies
│   └── README.md         # Backend setup instructions
├── demo-frontend/        # Next.js frontend
│   ├── app/              # Next.js App Router
│   ├── lib/              # Utility functions
│   ├── package.json      # Frontend dependencies
│   └── README.md         # Frontend setup instructions
└── README.md             # This file
```

## 🛠️ Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Google OAuth credentials

### 1. Database Setup

#### Option A: Local PostgreSQL

```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database
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

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)
7. Copy the Client ID and Client Secret

### 3. Backend Setup

```bash
cd demo-backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your configuration
# - Update DATABASE_URL with your PostgreSQL credentials
# - Add your Google OAuth credentials
# - Generate secure JWT and session secrets

# Setup database
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

### 4. Frontend Setup

```bash
cd demo-frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Start development server
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: PostgreSQL on localhost:5432

## 🔧 Configuration

### Backend Environment Variables

Create `demo-backend/.env`:

```env
# Database
DATABASE_URL="postgresql://demo_user:your_password@localhost:5432/demo_db"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Session Secret
SESSION_SECRET="your-session-secret-here"

# Server
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL="http://localhost:3000"
```

### Frontend Environment Variables

Create `demo-frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🗄️ Database Schema

The application uses a single `User` table:

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  googleId TEXT UNIQUE NOT NULL,
  picture TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Authentication Flow

1. User clicks "Sign in with Google" on frontend
2. Frontend redirects to backend OAuth endpoint
3. Backend initiates Google OAuth flow
4. User authenticates with Google
5. Google redirects back to backend with authorization code
6. Backend exchanges code for user data
7. Backend creates/updates user in database
8. Backend generates JWT token and redirects to frontend
9. Frontend stores token and fetches user profile
10. User is now authenticated

## 📚 API Endpoints

### Backend API (http://localhost:3001)

- `GET /health` - Health check
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `GET /api/user` - Get current user (requires JWT token)
- `GET /api/logout` - Logout user

## 🚀 Development Commands

### Backend

```bash
cd demo-backend
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run db:generate # Generate Prisma client
npm run db:push     # Push schema to database
npm run db:migrate  # Run database migrations
npm run db:studio   # Open Prisma Studio
```

### Frontend

```bash
cd demo-frontend
npm run dev    # Start development server
npm run build  # Build for production
npm start      # Start production server
npm run lint   # Run ESLint
```

## 🧪 Testing the Application

1. Start both backend and frontend servers
2. Open http://localhost:3000 in your browser
3. Click "Sign in with Google"
4. Complete Google OAuth flow
5. Verify user data is displayed and stored in database

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in backend .env
   - Ensure database and user exist

2. **Google OAuth Error**
   - Verify Google OAuth credentials
   - Check redirect URI matches exactly
   - Ensure Google+ API is enabled

3. **CORS Error**
   - Verify FRONTEND_URL in backend .env
   - Check frontend is running on correct port

4. **JWT Token Error**
   - Generate new JWT_SECRET
   - Clear browser cookies/localStorage

### Logs

- Backend logs: Check terminal running `npm run dev`
- Frontend logs: Check browser developer console
- Database logs: Check PostgreSQL logs

## 📦 Production Deployment

### Backend Deployment

1. Set `NODE_ENV=production`
2. Use production PostgreSQL instance
3. Set secure JWT and session secrets
4. Configure HTTPS
5. Set up proper CORS origins

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Set production API URL in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section
2. Review the individual README files in each directory
3. Check the logs for error messages
4. Verify all prerequisites are installed

