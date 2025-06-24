'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { auth, User } from '@/lib/auth'
import { api } from '@/lib/api'
import { LoginModal } from '@/components'
import { AxiosError } from 'axios'

interface QuickPayParams {
  toAddress: string
  amount: string
  redirectUrl: string
}

interface TransferResponse {
  txn: string
  isSuccess: boolean
}

function QuickPayForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isClient, setIsClient] = useState(false)
  const searchParams = useSearchParams()

  // Extract URL parameters
  const params: QuickPayParams = {
    toAddress: searchParams.get('toAddress') || '',
    amount: searchParams.get('amount') || '',
    redirectUrl: searchParams.get('redirectUrl') || '',
  }

  // Check if all required parameters are present
  const isValidRequest = params.toAddress && params.amount && params.redirectUrl

  useEffect(() => {
    // Mark as client-side
    setIsClient(true)
    
    // Get current user from localStorage (only on client)
    const user = auth.getCurrentUser()
    setCurrentUser(user)
  }, [])

  const handleSwitchAccount = () => {
    setShowLoginModal(true)
  }

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user)
    setShowLoginModal(false)
    toast.success('Successfully switched account!')
  }

  const handleLoginClose = () => {
    setShowLoginModal(false)
    // If login was attempted but failed, clear the current user state
    // since the auth library should have cleared the stale data
    if (!auth.isAuthenticated()) {
      setCurrentUser(null)
    }
  }

  const handleMakePayment = async () => {
    if (!currentUser) {
      toast.error('Please sign in to make a payment')
      return
    }

    setIsLoading(true)
    
    try {
      // Verify authentication by checking if we have a valid token
      if (!auth.isAuthenticated()) {
        auth.logout()
        setCurrentUser(null)
        toast.error('Authentication expired. Please sign in again.')
        return
      }
      
      // Proceed with the payment
      const response = await api.post<TransferResponse>('/api/users/transfer', {
        amount: params.amount,
        toAddress: params.toAddress,
        username: currentUser.username,
      })

      if (response.data.isSuccess) {
        toast.success('Payment successful!')
        // Redirect to the specified URL
        window.location.href = params.redirectUrl
      } else {
        toast.error('Payment failed')
      }
    } catch (error: unknown) {
      console.error('Payment error:', error)
      
      // If it's an authentication error, log out the user
      if (error instanceof AxiosError && error.response?.status === 401) {
        auth.logout()
        setCurrentUser(null)
        toast.error('Authentication failed. Please sign in again.')
        return
      }
      
      const errorMessage = error instanceof AxiosError && error.response?.data?.message 
        ? error.response.data.message 
        : 'Payment failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isValidRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">Invalid Payment Request</CardTitle>
            <CardDescription>
              Missing required parameters: toAddress, amount, or redirectUrl
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quick Pay</CardTitle>
          <CardDescription>
            Complete your payment securely
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Status */}
          <div className="space-y-2">
            {currentUser && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Currently signed in as: {currentUser.username}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwitchAccount}
                  disabled={isLoading}
                >
                  Switch Account
                </Button>
              </div>
            )}
            {!currentUser && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Not signed in
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwitchAccount}
                  disabled={isLoading}
                >
                  Use Account
                </Button>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-bold text-lg">{params.amount}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">To Address:</p>
                <p className="font-mono text-sm break-all">{params.toAddress}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Redirect URL:</p>
                <p className="text-sm break-all">{params.redirectUrl}</p>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handleMakePayment}
            disabled={isLoading || !currentUser}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Processing Payment...' : 'Make Payment'}
          </Button>
        </CardContent>
      </Card>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onSuccess={handleLoginSuccess}
          onClose={handleLoginClose}
        />
      )}
    </div>
  )
}

export default function QuickPayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
      <QuickPayForm />
    </Suspense>
  )
} 