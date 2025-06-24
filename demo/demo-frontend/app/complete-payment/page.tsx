'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, getUser, getToken, completePayment } from '../../lib/auth';

export default function CompletePaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    console.log('complete payment page', searchParams, router)
    
    const checkAuthAndProcess = async () => {
      // Prevent duplicate processing even if effect runs twice
      if (hasProcessedRef.current) {
        return;
      }
      hasProcessedRef.current = true;
      
      try {
        // Check if user is authenticated
        const token = getToken();
        if (!token) {
          // User not logged in, show error instead of redirecting
          setError('User not authenticated. Please log in first.');
          setLoading(false);
          return;
        }

        // Get user data
        const userData = await getUser();
        if (!userData) {
          // Invalid token, show error instead of redirecting
          setError('Invalid authentication token. Please log in again.');
          setLoading(false);
          return;
        }

        setUser(userData);

        // Get nonce from URL
        const nonce = searchParams.get('nonce');
        if (!nonce) {
          // No nonce present, payment failed
          setError('Payment failed: No nonce provided');
          setLoading(false);
          return;
        }

        // Process the payment completion
        setProcessing(true);
        try {
          const updatedUser = await completePayment(nonce);
          if (updatedUser) {
            setUser(updatedUser);
            // Payment successful, don't redirect for debugging
            setProcessing(false);
            setLoading(false);
          } else {
            setError('Payment failed: Unable to complete payment');
            setProcessing(false);
            setLoading(false);
          }
        } catch (paymentError: any) {
          setError(paymentError.message || 'Payment failed: Unable to complete payment');
          setProcessing(false);
          setLoading(false);
        }

      } catch (error) {
        console.error('Error in complete payment flow:', error);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    checkAuthAndProcess();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200"></div>
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-800 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
          <div>
            <p className="text-gray-600 font-sans">Processing your payment...</p>
            <p className="text-sm text-gray-500 font-sans mt-1">Please wait while we complete your transaction</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-serif text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 font-sans">{error}</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-amber-800 hover:bg-amber-900 text-white font-sans font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Return to Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-sans font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Retry Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200"></div>
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-800 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
          <div>
            <p className="text-gray-600 font-sans">Completing your payment...</p>
            <p className="text-sm text-gray-500 font-sans mt-1">This will only take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state (no automatic redirect for debugging)
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-6 max-w-md mx-auto px-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-serif text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 font-sans">Your payment has been completed successfully.</p>
          {user?.hasPurchased && (
            <p className="text-sm text-green-600 font-sans mt-2">Your purchase is now complete!</p>
          )}
        </div>
        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-amber-800 hover:bg-amber-900 text-white font-sans font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Return to Home
          </button>
          <div className="text-sm text-gray-500 font-sans">
            <p>Debug Info:</p>
            <p>User ID: {user?.id}</p>
            <p>Has Purchased: {user?.hasPurchased ? 'Yes' : 'No'}</p>
            <p>Purchase Date: {user?.purchasedAt || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
