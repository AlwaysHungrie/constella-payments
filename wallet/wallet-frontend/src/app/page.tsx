'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Clear any stale authentication data first
    auth.clearStaleAuth()
    
    // Always redirect to login for now to ensure clean state
    router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Constella Wallet</h1>
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  )
}
