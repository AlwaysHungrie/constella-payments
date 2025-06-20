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