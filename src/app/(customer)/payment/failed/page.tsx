'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, ArrowLeft, HelpCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface FailureDetails {
  paymentID: string;
  reason?: string;
  statusMessage?: string;
  amount?: string;
}

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [failureDetails, setFailureDetails] = useState<FailureDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const paymentID = searchParams.get('paymentID');

    if (paymentID) {
      fetchFailureDetails(paymentID);
    } else {
      setLoading(false);
      toast.error('No payment ID provided');
    }
  }, [searchParams]);

  const fetchFailureDetails = async (paymentID: string) => {
    try {
      const response = await apiClient.get(`/api/payment/status/${paymentID}`);

      setFailureDetails({
        paymentID,
        reason: response.data.data?.statusMessage || 'Payment failed',
        statusMessage: response.data.data?.statusMessage,
        amount: response.data.data?.amount
      });
    } catch (error) {
      console.error('❌ Error fetching failure details:', error);
      setFailureDetails({
        paymentID,
        reason: 'Unable to fetch failure details'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = () => {
    // Go back to ticket booking to retry
    router.push('/');
    toast.info('Please select your seats again to retry payment');
  };

  const handleBackToBooking = () => {
    router.push('/');
  };

  const handleContactSupport = () => {
    // TODO: Implement support contact functionality
    toast.info('Support contact will be available soon');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
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
            <XCircle className="h-20 w-20 text-red-500" />
          </div>
          <CardTitle className="text-3xl text-red-600">
            Payment Failed
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              ❌ Your payment could not be processed
            </h3>
            <p className="text-red-700">
              Don't worry, no amount has been charged from your account.
            </p>
          </div>

          {failureDetails && (
            <div className="bg-gray-100 p-4 rounded-lg text-left">
              <h4 className="font-semibold mb-3">Failure Details:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono">{failureDetails.paymentID}</span>
                </div>
                {failureDetails.amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attempted Amount:</span>
                    <span>৳{failureDetails.amount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-red-600 font-semibold">Failed</span>
                </div>
                {failureDetails.reason && (
                  <div className="mt-3">
                    <span className="text-gray-600">Reason:</span>
                    <p className="text-sm text-gray-800 mt-1 bg-gray-50 p-2 rounded">
                      {failureDetails.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-blue-800 mb-2">Common reasons for payment failure:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Insufficient balance in bKash account</li>
              <li>• Incorrect PIN entered</li>
              <li>• Transaction timeout</li>
              <li>• Network connectivity issues</li>
              <li>• Daily transaction limit exceeded</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleRetryPayment}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={handleBackToBooking}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Booking
              </Button>
              <Button
                onClick={handleContactSupport}
                variant="outline"
                className="w-full"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-500 border-t pt-4">
            <p>
              💡 <strong>Tip:</strong> Make sure you have sufficient balance in your bKash account before retrying.
            </p>
            <p className="mt-1">
              📞 If you continue to face issues, please contact our customer support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading fallback component
function PaymentFailedLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-16 w-16 text-red-500 animate-spin" />
          </div>
          <CardTitle className="text-2xl text-red-600">
            Loading Failure Details...
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">Please wait while we process your failure details...</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Main page component with Suspense boundary
export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<PaymentFailedLoading />}>
      <PaymentFailedContent />
    </Suspense>
  );
}


