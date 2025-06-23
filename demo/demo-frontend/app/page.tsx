'use client';

import { useState, useEffect } from 'react';
import { User, getUser, logout, getToken, resetUser } from '../lib/auth';
import PaymentModal from '../components/PaymentModal';

const PAINTING_PRICE = 0;

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        const userData = await getUser();
        setUser(userData);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    window.location.href = process.env.NEXT_PUBLIC_API_URL + '/auth/google';
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  const handlePurchase = () => {
    if (!user) return;
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleReset = async () => {
    if (!user) return;
    
    setResetting(true);
    try {
      const updatedUser = await resetUser();
      if (updatedUser) {
        setUser(updatedUser);
        setShowResetConfirm(false);
      }
    } catch (error) {
      console.error('Reset failed:', error);
      // You could add a toast notification here for error handling
    } finally {
      setResetting(false);
    }
  };

  const formatPurchaseDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-800 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-sans">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-serif text-gray-900">AlwaysHungrie</h1>
              <p className="text-sm text-gray-600 font-sans">Contemporary Artist</p>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 font-sans">Welcome, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-600 hover:text-gray-900 font-sans transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="text-sm text-gray-600 hover:text-gray-900 font-sans transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Painting Image */}
          <div className="space-y-6">
            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden shadow-sm">
              <img
                src="/painting.jpg"
                alt="Whispers of Dawn by AlwaysHungrie"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm text-gray-500 font-sans text-center">
              Oil on canvas • 36&Prime; × 48&Prime; • 2025
            </p>
          </div>

          {/* Painting Details */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-serif text-gray-900 mb-4">
                &ldquo;Whispers of Dawn&rdquo;
              </h2>
              <p className="text-lg text-gray-600 font-sans leading-relaxed">
                A contemplative piece that captures the delicate transition between night and day. 
                The subtle interplay of light and shadow creates a sense of quiet introspection, 
                inviting viewers to pause and reflect on the beauty of fleeting moments.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-4 border-t border-gray-100">
                <span className="font-serif text-xl text-gray-900">Price</span>
                <span className="font-serif text-2xl text-amber-800">${PAINTING_PRICE}</span>
              </div>
              
              <div className="flex justify-between items-center py-4 border-t border-gray-100">
                <span className="font-sans text-gray-600">Shipping</span>
                <span className="font-sans text-gray-900">Included</span>
              </div>
              
              <div className="flex justify-between items-center py-4 border-t border-gray-100">
                <span className="font-sans text-gray-600">Certificate of Authenticity</span>
                <span className="font-sans text-gray-900">Included</span>
              </div>
            </div>

            {user ? (
              <div className="space-y-4">
                {user.hasPurchased ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-green-800">Purchase Complete</span>
                      </div>
                      {user.purchasedAt && (
                        <p className="text-sm text-green-700">
                          Purchased on {formatPurchaseDate(user.purchasedAt)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-sans font-medium py-3 px-8 rounded-lg transition-colors duration-200"
                    >
                      Reset Purchase Status
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handlePurchase}
                    className="w-full bg-amber-800 hover:bg-amber-900 text-white font-sans font-medium py-4 px-8 rounded-lg transition-colors duration-200"
                  >
                    Purchase Painting
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 font-sans text-center">
                  Please sign in to purchase this artwork
                </p>
                <button
                  onClick={handleLogin}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-sans font-medium py-4 px-8 rounded-lg transition-colors duration-200"
                >
                  Sign In to Purchase
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Artist Statement */}
        <div className="mt-24 max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-serif text-gray-900 mb-6">Artist Statement</h3>
          <p className="text-gray-600 font-sans leading-relaxed">
            My work explores the intersection of light, emotion, and memory. Through careful observation 
            of the natural world, I seek to capture moments that resonate with universal human experience. 
            Each piece is a meditation on the beauty found in ordinary moments and the profound impact 
            they can have on our inner lives.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-24">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-500 font-sans">
              © 2025 AlwaysHungrie. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Payment Modal */}
      {user && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          user={user}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-serif text-gray-900">Reset Purchase Status?</h3>
                  <p className="text-sm text-gray-600 font-sans mt-2">
                    This will reset your purchase status and allow you to make the payment again. 
                    This action cannot be undone.
                  </p>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors font-sans text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={resetting}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-500 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 font-sans text-sm"
                  >
                    {resetting ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                        <span>Resetting...</span>
                      </>
                    ) : (
                      <span>Reset Purchase</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 