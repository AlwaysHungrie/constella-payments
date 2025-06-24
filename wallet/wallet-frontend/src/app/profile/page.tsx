'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { auth, User } from '@/lib/auth'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.isAuthenticated()) {
        router.push('/login')
        return
      }

      try {
        const userData = await auth.getProfile()
        setUser(userData)
      } catch (error) {
        console.error('Error loading profile:', error)
        toast.error('Failed to load profile. Please login again.')
        auth.logout()
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleLogout = () => {
    auth.logout()
    toast.success('Logged out successfully')
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Constella Wallet</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Username</label>
                <p className="text-lg font-semibold">{user.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User ID</label>
                <p className="text-sm text-gray-600 font-mono">{user.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Member Since</label>
                <p className="text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Card */}
          <Card>
            <CardHeader>
              <CardTitle>Wallet</CardTitle>
              <CardDescription>Your wallet information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Wallet Address</label>
                <p className="text-sm text-gray-600 font-mono break-all">
                  {user.walletAddress}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Balance</label>
                <p className="text-2xl font-bold text-green-600">
                  {user.balance.toFixed(2)} CST
                </p>
              </div>
              {user.lastRequestRefreshBalanceAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Last Balance Update
                  </label>
                  <p className="text-sm text-gray-600">
                    {new Date(user.lastRequestRefreshBalanceAt).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Security */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Your account security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Passkey Authentication</h3>
                <p className="text-sm text-gray-600">
                  Your account is secured with WebAuthn passkey
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 