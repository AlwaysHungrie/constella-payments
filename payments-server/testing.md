# API Testing Guide

This document contains curl requests to test the authentication endpoints of the Constella Payments API.

## Base URL
```
http://localhost:5001
```

## Authentication Endpoints

### 1. Health Check
Test if the server is running:
```bash
curl -X GET http://localhost:5001/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### 2. Merchant Signup
Create a new merchant account:

```bash
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alwayshungrie",
    "password": "securepassword123",
    "name": "Always Hungrie"
  }'
```

**Expected Response (201):**
```json
{
  "message": "Merchant created successfully",
  "merchant": {
    "id": "merchant_id",
    "username": "alwayshungrie",
    "name": "Always Hungrie",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

**Signup with minimal data (username and password only):**
```bash
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alwayshungrie",
    "password": "securepassword123"
  }'
```

### 3. Merchant Login
Authenticate an existing merchant:

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alwayshungrie",
    "password": "securepassword123"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Login successful",
  "merchant": {
    "id": "merchant_id",
    "username": "alwayshungrie",
    "name": "Always Hungrie",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

### 4. Get Current Merchant Profile (Protected Route)
Retrieve the current merchant's profile using the JWT token:

```bash
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response (200):**
```json
{
  "merchant": {
    "id": "merchant_id",
    "username": "alwayshungrie",
    "name": "Always Hungrie",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Cases:**

1. **Missing token (401):**
```bash
curl -X GET http://localhost:5001/api/auth/me
```

2. **Invalid token (401):**
```bash
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer invalid_token"
```

3. **Expired token (401):**
```bash
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer expired_token"
```

## Notes

- JWT tokens expire after 7 days
- Usernames must contain only letters, numbers, and underscores
- Passwords must be at least 8 characters long
- Name is optional during signup
- All error responses follow the format: `{"error": "Error message"}`
- Rate limiting is enabled (100 requests per 15 minutes per IP)

## Payment Endpoints

### 1. Create Payment Request (Public)
```bash
curl -X POST http://localhost:5001/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "nonce": "test-nonce-123"
  }'
```

### 2. Get Payment Request (Public)
```bash
curl -X GET http://localhost:5001/api/payments/test-nonce-123
```

### 3. Claim Payment Request (Merchant Only)
```bash
# First get token from login, then use it
curl -X POST http://localhost:5001/api/payments/claim \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "nonce": "test-nonce-123"
  }'
```

### 4. Get Merchant Balance (Merchant Only)
```bash
curl -X GET http://localhost:5001/api/payments/balance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Test Flow
1. Create a merchant account
2. Login to get JWT token
3. Create a payment request with a unique nonce
4. Verify the payment request was created (check wallet address is returned)
5. Claim the payment request as the merchant
6. Check merchant balance
7. Claim the same payment request again as the same merchant (should succeed and update amount)
8. Try to claim with different merchant (should fail)
9. Check merchant balance again (should show updated total)

## Expected Behavior
- Payment requests can be created by anyone with a unique nonce
- Each payment request gets a unique Ethereum wallet address
- Only merchants can claim payment requests
- The same merchant can claim a payment request multiple times
- When a merchant re-claims a payment request, the amount is recalculated and updated
- Different merchants cannot claim a payment request that's already claimed by another merchant
- Merchant balance shows sum of all claimed payment request amounts
- Private keys are never returned to users 