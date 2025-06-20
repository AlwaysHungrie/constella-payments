import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
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