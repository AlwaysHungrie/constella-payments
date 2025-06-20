'use client';

import { useState, useEffect } from 'react';
import { User, generateNonce, createPaymentRequest, completePayment } from '../lib/auth';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onPaymentComplete: (user: User) => void;
}

interface PaymentRequest {
  id: string;
  nonce: string;
  walletAddress: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function PaymentModal({ isOpen, onClose, user, onPaymentComplete }: PaymentModalProps) {
  const [nonce, setNonce] = useState<string>('');
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<'initial' | 'payment' | 'complete'>('initial');

  const PAINTING_PRICE = 0.5;

  useEffect(() => {
    if (isOpen && step === 'initial') {
      const newNonce = generateNonce();
      setNonce(newNonce);
      createPaymentRequestHandler(newNonce);
    }
  }, [isOpen, step]);

  const createPaymentRequestHandler = async (nonceValue: string) => {
    setLoading(true);
    setError('');
    
    try {
      const request = await createPaymentRequest(nonceValue);
      if (request) {
        setPaymentRequest(request);
        setStep('payment');
      } else {
        setError('Failed to create payment request. Please try again.');
      }
    } catch (error) {
      setError('Failed to create payment request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePayment = async () => {
    if (!paymentRequest) return;
    
    setLoading(true);
    setError('');
    
    try {
      const updatedUser = await completePayment(paymentRequest.nonce);
      if (updatedUser) {
        setStep('complete');
        onPaymentComplete(updatedUser);
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
          setStep('initial');
          setPaymentRequest(null);
          setNonce('');
        }, 3000);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to complete payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 'complete') {
      onClose();
      setStep('initial');
      setPaymentRequest(null);
      setNonce('');
    } else {
      onClose();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif text-gray-900">
              {step === 'initial' && 'Processing Payment'}
              {step === 'payment' && 'Complete Purchase'}
              {step === 'complete' && 'Payment Complete'}
            </h2>
            {step !== 'complete' && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto flex-1">
          {step === 'initial' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200"></div>
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-800 border-t-transparent absolute top-0 left-0"></div>
                </div>
              </div>
              <div>
                <p className="text-gray-600 font-sans">Setting up your payment request...</p>
                <p className="text-sm text-gray-500 font-sans mt-1">This will only take a moment</p>
              </div>
            </div>
          )}

          {step === 'payment' && paymentRequest && (
            <div className="space-y-2">
              <div className="text-left">
                <p className="text-gray-600 font-sans">Send the exact amount in USDC on Scroll to complete your purchase</p>
              </div>

              <div className="space-y-4">
                {/* Amount Display */}
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-2 border border-amber-200">
                  <div className="text-center">
                    <p className="text-sm font-serif text-amber-700 mb-1">Total Amount</p>
                    <p className="text-2xl font-sans text-amber-900">${PAINTING_PRICE}</p>
                  </div>
                </div>

                {/* Wallet Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                    Destination Wallet
                  </label>
                  <div className="relative">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                      <p className="text-sm font-mono text-gray-900 break-all leading-relaxed">
                        {paymentRequest.walletAddress}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(paymentRequest.walletAddress)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-amber-600 transition-colors"
                      title="Copy address"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="rounded-xl p-4">
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900 font-sans text-sm">Payment Instructions</h3>
                    <ol className="text-sm text-gray-700 space-y-2 font-sans">
                      <li className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">1</span>
                        <span>Copy the wallet address above</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">2</span>
                        <span>Send exactly <strong>{PAINTING_PRICE} USDC</strong> on Scroll network</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">3</span>
                        <span>Wait for transaction confirmation</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">4</span>
                        <span>Click &ldquo;Complete Payment&rdquo; to verify</span>
                      </li>
                    </ol>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-red-50 rounded-xl p-3 border border-red-200">
                  <div className="flex items-start space-x-2">
                    <div>
                      <p className="text-sm text-red-700 font-sans font-medium">Important Warning</p>
                      <p className="text-xs text-red-600 font-sans mt-1">
                        Only send USDC on Scroll network. Funds sent on other chains or tokens will be lost forever.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 rounded-xl p-3 border border-red-200">
                    <div className="flex items-start space-x-2">
                      <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-700 font-sans">{error}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={handleClose}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors font-sans text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompletePayment}
                    disabled={loading}
                    className="flex-1 bg-amber-800 hover:bg-amber-900 disabled:bg-amber-600 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 font-sans text-sm"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Complete Payment</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-serif text-gray-900">Payment Successful!</h3>
                <p className="text-gray-600 font-sans leading-relaxed text-sm">
                  Thank you for your purchase. Your artwork will be carefully packaged and shipped to you within 3-5 business days.
                </p>
                <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                  <p className="text-sm text-green-700 font-sans">
                    You will receive a confirmation email with tracking information shortly.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 