import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  signup: async (data: { username: string; password: string; name?: string }) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },
  
  login: async (data: { username: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Payments API
export const paymentsAPI = {
  claimPayment: async (data: { nonce: string }) => {
    const response = await api.post('/payments/claim', data);
    return response.data;
  },
  
  getBalance: async () => {
    const response = await api.get('/payments/balance');
    return response.data;
  },
  
  getClaimedPayments: async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`/payments/claimed?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  getPaymentByNonce: async (nonce: string) => {
    const response = await api.get(`/payments/${nonce}`);
    return response.data;
  },
};

export default api; 