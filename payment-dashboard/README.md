# Payment Dashboard

A Next.js frontend application for managing payment requests and claims. This dashboard allows users to sign up, login, claim payment requests using nonces, and view their claimed payments with pagination.

## Features

- **User Authentication**: Sign up and login functionality
- **Payment Claiming**: Claim payment requests using nonces
- **Payment Management**: View all claimed payments with pagination
- **Payment Reclaiming**: Reclaim payments to update amounts
- **Balance Tracking**: View total balance and payment count
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Prerequisites

- Node.js 18+ 
- The payments-server running on port 5001
- PostgreSQL database (configured in payments-server)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5002`.

## Usage

### Authentication
- Visit `/signup` to create a new account
- Visit `/login` to sign in to your account
- Users are automatically redirected to the dashboard after authentication

### Dashboard Features
- **Account Balance**: View your total claimed payments in ETH
- **Claim Payment**: Use the "Claim Payment" button to enter a nonce and claim a payment request
- **Payment History**: View all your claimed payments in a paginated table
- **Reclaim Payments**: Use the "Reclaim" button to update payment amounts

### API Integration
The dashboard communicates with the payments-server API endpoints:
- `POST /auth/signup` - User registration
- `POST /auth/login` - User authentication
- `GET /auth/me` - Get user profile
- `POST /payments/claim` - Claim a payment request
- `GET /payments/balance` - Get user balance
- `GET /payments/claimed` - Get paginated claimed payments

## Technology Stack

- **Frontend**: Next.js 14 with App Router
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: Sonner

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (redirects)
├── components/           # UI components
│   └── ui/              # shadcn/ui components
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
├── lib/                 # Utility libraries
│   └── api.ts          # API client
└── middleware.ts        # Next.js middleware
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Configuration

The application is configured to:
- Run on port 5002
- Connect to the payments-server on `http://localhost:5001`
- Use JWT tokens for authentication (stored in localStorage)

## Notes

- The application refers to merchants as "users" in the UI copy as requested
- Payment amounts are displayed in ETH
- The dashboard includes pagination for better performance with large datasets
- All API calls include proper error handling and user feedback
