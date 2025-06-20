'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { paymentsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { LogOut, Plus, RefreshCw } from 'lucide-react';

interface PaymentRequest {
  id: string;
  nonce: string;
  walletAddress: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Balance {
  merchantId: string;
  totalBalance: number;
  claimedRequestsCount: number;
}

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [nonce, setNonce] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchBalance = async () => {
    try {
      const data = await paymentsAPI.getBalance();
      setBalance(data);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const fetchPayments = async (page: number = 1) => {
    try {
      const data = await paymentsAPI.getClaimedPayments(page, 10);
      setPayments(data.claimedRequests);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.page);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
  };

  const handleClaimPayment = async () => {
    if (!nonce.trim()) {
      toast.error('Please enter a nonce');
      return;
    }

    setClaiming(true);
    try {
      await paymentsAPI.claimPayment({ nonce: nonce.trim() });
      toast.success('Payment claimed successfully!');
      setNonce('');
      setIsDialogOpen(false);
      fetchBalance();
      fetchPayments(1);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to claim payment';
      toast.error(errorMessage);
    } finally {
      setClaiming(false);
    }
  };

  const handleReclaim = async (nonce: string) => {
    try {
      await paymentsAPI.claimPayment({ nonce });
      toast.success('Payment reclaimed successfully!');
      fetchBalance();
      fetchPayments(currentPage);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reclaim payment';
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    // If auth is still loading, wait
    if (authLoading) return;

    // If no user after auth is done loading, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBalance(), fetchPayments()]);
      setLoading(false);
    };

    loadData();
  }, [user, authLoading, router]);

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Payment Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome, {user?.name || user?.username}</p>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Account Balance</CardTitle>
            <CardDescription>Your total claimed payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold ">
              ${balance?.totalBalance.toFixed(4)} 
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {balance?.claimedRequestsCount} claimed payments
            </p>
          </CardContent>
        </Card>

        {/* Claim Payment */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Claim Payment</CardTitle>
            <CardDescription>Enter a nonce to claim a payment request</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Claim Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-4">
                  <DialogTitle className="text-2xl font-serif text-gray-900">Claim Payment Request</DialogTitle>
                  <DialogDescription className="text-gray-600 font-sans leading-relaxed">
                    Enter the nonce of the payment request you want to claim. This will transfer the payment to your account.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-3">
                    <label htmlFor="nonce" className="block text-sm font-medium text-gray-700 font-sans">
                      Payment Nonce
                    </label>
                    <div className="relative">
                      <Input
                        id="nonce"
                        value={nonce}
                        onChange={(e) => setNonce(e.target.value)}
                        placeholder="Enter the payment nonce"
                        className="rounded-xl border-gray-200 focus:border-amber-500 focus:ring-amber-500 font-mono text-sm"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 font-sans">
                      The nonce is a unique identifier for the payment request
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="font-medium text-blue-800 mb-1 font-sans">How it works</h4>
                        <p className="text-sm text-blue-700 font-sans">
                          When you claim a payment, the funds will be transferred from the payment request to your account balance.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleClaimPayment} 
                    disabled={claiming || !nonce.trim()}
                    className="w-full bg-amber-800 hover:bg-amber-900 disabled:bg-amber-600 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2 font-sans"
                  >
                    {claiming ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Claiming Payment...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Claim Payment</span>
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Claimed Payments</CardTitle>
            <CardDescription>Your claimed payment requests</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No claimed payments yet. Claim your first payment to get started!
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nonce</TableHead>
                      <TableHead>Wallet Address</TableHead>
                      <TableHead>Amount (ETH)</TableHead>
                      <TableHead>Claimed Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">{payment.nonce}</TableCell>
                        <TableCell className="font-mono text-sm">{payment.walletAddress}</TableCell>
                        <TableCell>{payment.amount.toFixed(4)}</TableCell>
                        <TableCell>{new Date(payment.updatedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReclaim(payment.nonce)}
                          >
                            Reclaim
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchPayments(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchPayments(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 