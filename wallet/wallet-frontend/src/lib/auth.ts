import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser'
import api from './api'

export interface User {
  id: string
  username: string
  walletAddress: string
  balance: number
  lastRequestRefreshBalanceAt?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

// Helper function to set token cookie
const setTokenCookie = (token: string) => {
  if (typeof document === 'undefined') return
  // Set cookie to expire in 7 days
  const expires = new Date()
  expires.setDate(expires.getDate() + 7)
  const cookieValue = `token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
  document.cookie = cookieValue
  console.log('Token cookie set:', cookieValue)
}

export const auth = {
  // Check if username is available
  async checkUsername(username: string): Promise<{ available: boolean; message: string }> {
    const response = await api.get(`/api/users/check-username/${username}`)
    return response.data
  },

  // Start registration process
  async startRegistration(username: string) {
    const response = await api.post('/api/users/register/start', { username })
    return response.data
  },

  // Complete registration with WebAuthn
  async completeRegistration(username: string, credential: unknown): Promise<AuthResponse> {
    const response = await api.post('/api/users/register/finish', {
      username,
      credential,
    })
    return response.data
  },

  // Start authentication process
  async startAuthentication(username: string) {
    const response = await api.post('/api/users/login/start', { username })
    return response.data
  },

  // Complete authentication with WebAuthn
  async completeAuthentication(username: string, credential: unknown): Promise<AuthResponse> {
    const response = await api.post('/api/users/login/finish', {
      username,
      credential,
    })
    return response.data
  },

  // Get user profile
  async getProfile(): Promise<User> {
    const response = await api.get('/api/users/profile')
    return response.data
  },

  // Register with passkey
  async register(username: string): Promise<AuthResponse> {
    try {
      // Clear any existing authentication data before attempting registration
      this.clearStaleAuth()
      
      // Start registration
      const options = await this.startRegistration(username)
      
      // Create credentials
      const credential = await startRegistration(options)
      
      // Complete registration
      const result = await this.completeRegistration(username, credential)
      
      // Store auth data
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      setTokenCookie(result.token)
      
      console.log('Registration successful, token stored:', result.token)
      
      return result
    } catch (error) {
      console.error('Registration error:', error)
      // Ensure authentication data is cleared on registration failure
      this.clearStaleAuth()
      throw error
    }
  },

  // Login with passkey
  async login(username: string): Promise<AuthResponse> {
    try {
      // Clear any existing authentication data before attempting new login
      this.clearStaleAuth()
      
      // Start authentication
      const options = await this.startAuthentication(username)
      
      // Get credentials
      const credential = await startAuthentication(options)
      
      // Complete authentication
      const result = await this.completeAuthentication(username, credential)
      
      // Store auth data
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      setTokenCookie(result.token)
      
      console.log('Login successful, token stored:', result.token)
      
      return result
    } catch (error) {
      console.error('Login error:', error)
      // Ensure authentication data is cleared on login failure
      this.clearStaleAuth()
      throw error
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Also clear any cookies
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  },

  // Clear stale authentication data
  clearStaleAuth() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token')
    console.log('Checking authentication, token exists:', !!token)
    return !!token
  },

  // Get current user
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },
} 