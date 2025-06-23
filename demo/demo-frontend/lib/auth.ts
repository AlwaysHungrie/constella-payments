import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://demo-backend.constella.one';
const PAYMENTS_API_URL = process.env.NEXT_PUBLIC_PAYMENTS_API_URL || 'https://payments-api.constella.one';

export interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  hasPurchased: boolean;
  purchasedAt: string | null;
  createdAt: string;
}

export interface PaymentRequest {
  id: string;
  nonce: string;
  walletAddress: string;
  amount: number;
  status: string;
  createdAt: string;
}

export const getToken = (): string | null => {
  return Cookies.get('auth_token') || null;
};

export const setToken = (token: string): void => {
  Cookies.set('auth_token', token, { expires: 7, secure: process.env.NODE_ENV === 'production' });
};

export const removeToken = (): void => {
  Cookies.remove('auth_token');
};

export const getUser = async (): Promise<User | null> => {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      removeToken();
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    removeToken();
    return null;
  }
};

export const logout = async (): Promise<void> => {
  const token = getToken();
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/api/logout`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
  removeToken();
};

// Generate a random nonce
export const generateNonce = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Create a payment request
export const createPaymentRequest = async (nonce: string): Promise<PaymentRequest | null> => {
  try {
    const response = await fetch(`${PAYMENTS_API_URL}/api/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nonce })
    });

    if (!response.ok) {
      throw new Error('Failed to create payment request');
    }

    const data = await response.json();
    return data.paymentRequest;
  } catch (error) {
    console.error('Error creating payment request:', error);
    return null;
  }
};

// Complete payment by claiming it
export const completePayment = async (nonce: string): Promise<User | null> => {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nonce })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to complete payment');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error completing payment:', error);
    throw error;
  }
};

// Reset user's purchase status
export const resetUser = async (): Promise<User | null> => {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to reset user');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error resetting user:', error);
    throw error;
  }
}; 