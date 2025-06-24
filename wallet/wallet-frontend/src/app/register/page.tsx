'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { auth } from '@/lib/auth'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const router = useRouter()

  // Check username availability when username changes
  useEffect(() => {
    const checkUsername = async () => {
      if (username.trim().length < 3) {
        setUsernameAvailable(null)
        return
      }

      setIsCheckingUsername(true)
      try {
        const result = await auth.checkUsername(username.trim())
        setUsernameAvailable(result.available)
      } catch (error) {
        console.error('Error checking username:', error)
        setUsernameAvailable(null)
      } finally {
        setIsCheckingUsername(false)
      }
    }

    const timeoutId = setTimeout(checkUsername, 500)
    return () => clearTimeout(timeoutId)
  }, [username])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      toast.error('Please enter a username')
      return
    }

    if (username.trim().length < 3) {
      toast.error('Username must be at least 3 characters long')
      return
    }

    if (usernameAvailable === false) {
      toast.error('Username is already taken')
      return
    }

    setIsLoading(true)
    
    try {
      await auth.register(username.trim())
      toast.success('Registration successful! Please sign in with your passkey.')
      router.push('/login?from=register')
    } catch (error: unknown) {
      console.error('Registration error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getUsernameStatus = () => {
    if (isCheckingUsername) return 'Checking...'
    if (username.trim().length < 3) return 'Username must be at least 3 characters'
    if (usernameAvailable === true) return 'Username is available'
    if (usernameAvailable === false) return 'Username is already taken'
    return ''
  }

  const getUsernameStatusColor = () => {
    if (isCheckingUsername) return 'text-gray-500'
    if (usernameAvailable === true) return 'text-green-600'
    if (usernameAvailable === false) return 'text-red-600'
    return 'text-gray-500'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Sign up for Constella Wallet with passkey authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
              {username && (
                <p className={`text-sm ${getUsernameStatusColor()}`}>
                  {getUsernameStatus()}
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || isCheckingUsername || usernameAvailable === false}
            >
              {isLoading ? 'Creating account...' : 'Create Account with Passkey'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 