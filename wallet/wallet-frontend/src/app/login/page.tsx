'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { auth } from '@/lib/auth'
import { AxiosError } from 'axios'

function LoginForm() {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for success message from registration
  useEffect(() => {
    const fromRegister = searchParams.get('from')
    if (fromRegister === 'register') {
      toast.success('Registration successful! Please sign in with your passkey.')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      toast.error('Please enter a username')
      return
    }

    setIsLoading(true)
    
    try {
      await auth.login(username.trim())
      toast.success('Login successful!')
      router.push('/profile')
    } catch (error: unknown) {
      console.error('Login error:', error)
      
      // Check if it's a 401 error (user not found)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError
        if (axiosError.response?.status === 401) {
          toast.error('User not found. Please check your username or sign up.')
          return
        }
      }
      
      // Fallback to generic error message
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your Constella Wallet with your passkey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in with Passkey'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
} 