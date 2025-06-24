# Constella Wallet Frontend

A modern wallet application built with Next.js, TypeScript, and WebAuthn for secure authentication.

## Features

- **WebAuthn Authentication**: Secure passkey-based login and registration
- **User Profile Management**: View wallet address, balance, and account details
- **Quick Pay**: Fast payment processing with URL parameters
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Quick Pay Route

The `/quick-pay` route allows for fast payment processing with URL parameters. This is useful for integrating payments into other applications.

### Usage

```
/quick-pay?toAddress=0x123...&amount=100&redirectUrl=https://example.com/success
```

### Parameters

- `toAddress` (required): The destination wallet address
- `amount` (required): The payment amount
- `redirectUrl` (required): URL to redirect to after successful payment

### Features

- **Parameter Validation**: Ensures all required parameters are present
- **Authentication**: Automatically prompts for login if not authenticated
- **Account Switching**: Allows users to switch accounts during payment
- **Payment Processing**: Calls the authenticated transfer endpoint
- **Success Redirect**: Automatically redirects to the specified URL on success

### Example

```javascript
// Redirect user to quick pay
window.location.href = `/quick-pay?toAddress=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6&amount=50&redirectUrl=https://mysite.com/payment-success`
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:5003
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5004](http://localhost:5004) in your browser.

## Authentication

The app uses WebAuthn (passkeys) for secure authentication:

1. **Registration**: Users create an account with a username and passkey
2. **Login**: Users sign in using their passkey
3. **Session Management**: Tokens are stored in localStorage and cookies

## API Integration

The frontend communicates with the wallet server API:

- **Base URL**: Configured via `NEXT_PUBLIC_API_URL`
- **Authentication**: JWT tokens sent in Authorization header
- **Error Handling**: Automatic redirect to login on 401 errors

## Development

- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code linting and formatting
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern component library
