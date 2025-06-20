'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  username: string;
  name?: string;
  isActive: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to set cookie
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

// Helper function to get cookie
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Helper function to remove cookie
const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Check both localStorage and cookies for token
      const storedToken = localStorage.getItem('token') || getCookie('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const { merchant } = await authAPI.getProfile();
          setUser(merchant);
        } catch {
          localStorage.removeItem('token');
          removeCookie('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const { merchant, token: newToken } = await authAPI.login({ username, password });
      setUser(merchant);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      setCookie('token', newToken);
    } catch (error: unknown) {
      // Re-throw the error so it can be handled by the UI
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data) {
        throw new Error(String(error.response.data.error));
      } else if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('Login failed');
      }
    }
  };

  const signup = async (username: string, password: string, name?: string) => {
    try {
      const { merchant, token: newToken } = await authAPI.signup({ username, password, name });
      setUser(merchant);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      setCookie('token', newToken);
    } catch (error: unknown) {
      // Re-throw the error so it can be handled by the UI
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data) {
        throw new Error(String(error.response.data.error));
      } else if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('Signup failed');
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    removeCookie('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}; 