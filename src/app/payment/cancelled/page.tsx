'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface CancellationDetails {
  paymentID: string;
  amount?: string;
}

function PaymentCancelledContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [cancellationDetails, setCancellationDetails] = useState<CancellationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const paymentID = searchParams.get('paymentID');
    
    if (paymentID) {
      fetchCancellationDetails(paymentID);
    } else {
      setLoading(false);
      toast.error('No payment ID provided');
    }
  }, [searchParams]);

  const fetchCancellationDetails = async (paymentID: string) => {
    try {
      const response = await apiClient.get(`/api/payment/status/${paymentID}`);
      
      setCancellationDetails({
        paymentID,
        amount: response.data.data?.amount
      });
    } catch (error) {
      console.error('❌ Error fetching cancellation details:', error);
      setCancellationDetails({
        paymentID
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = () => {
    // Go back to ticket booking to retry
    router.push('/ticket');
    toast.info('Please select your seats again to retry payment');
  };

  const handleBackToBooking = () => {
    router.push('/ticket');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-20 w-20 text-yellow-500" />
          </div>
          <CardTitle className="text-3xl text-yellow-600">
            Payment Cancelled
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              🚫 Payment was cancelled
            </h3>
            <p className="text-yellow-700">
              You cancelled the payment process. No amount has been charged from your account.
            </p>
          </div>
          
          {cancellationDetails && (
            <div className="bg-gray-100 p-4 rounded-lg text-left">
              <h4 className="font-semibold mb-3">Cancellation Details:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono">{cancellationDetails.paymentID}</span>
                </div>
                {cancellationDetails.amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cancelled Amount:</span>
                    <span>৳{cancellationDetails.amount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-yellow-600 font-semibold">Cancelled</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-blue-800 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your selected seats have been released</li>
              <li>• No payment has been processed</li>
              <li>• You can retry booking the same or different seats</li>
              <li>• Your booking attempt has been cancelled</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleRetryPayment}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Booking Again
            </Button>
            
            <Button 
              onClick={handleBackToBooking}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Ticket Booking
            </Button>
          </div>
          
          <div className="text-sm text-gray-500 border-t pt-4">
            <p>
              💡 <strong>Note:</strong> You can always come back and book tickets whenever you're ready.
            </p>
            <p className="mt-1">
              🎫 Your seats are not held after cancellation, so they may be available to other users.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading fallback component
function PaymentCancelledLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-16 w-16 text-yellow-500 animate-spin" />
          </div>
          <CardTitle className="text-2xl text-yellow-600">
            Loading Cancellation Details...
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">Please wait while we process your cancellation details...</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Main page component with Suspense boundary
export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={<PaymentCancelledLoading />}>
      <PaymentCancelledContent />
    </Suspense>
  );
}

