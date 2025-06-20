'use client';

import { useState, useEffect } from 'react';
import { User, getUser, logout, getToken } from '../lib/auth';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
    window.location.href = 'http://localhost:3001/auth/google';
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  const handlePurchase = () => {
    // This would integrate with a payment system
    alert('Purchase functionality would be integrated here');
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
                <span className="font-serif text-2xl text-amber-800">$2,800</span>
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
              <button
                onClick={handlePurchase}
                className="w-full bg-amber-800 hover:bg-amber-900 text-white font-sans font-medium py-4 px-8 rounded-lg transition-colors duration-200"
              >
                Purchase Painting
              </button>
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
    </div>
  );
} 