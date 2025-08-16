'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface PaymentResult {
  status: 'processing' | 'success' | 'failed' | 'cancelled';
  paymentID?: string;
  transactionID?: string;
  amount?: string;
  message?: string;
  error?: string;
}

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<PaymentResult>({ status: 'processing' });

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        const paymentID = searchParams.get('paymentID');
        const status = searchParams.get('status');
        const signature = searchParams.get('signature');
        const apiVersion = searchParams.get('apiVersion');

        if (!paymentID || !status) {
          setResult({
            status: 'failed',
            error: 'Invalid callback parameters',
            message: 'Missing payment ID or status'
          });
          return;
        }

        console.log('📞 Processing payment callback:', { paymentID, status, signature, apiVersion });

        switch (status) {
          case 'success':
            await handleSuccessfulPayment(paymentID, signature);
            break;
          
          case 'failure':
            await handleFailedPayment(paymentID);
            break;
            
          case 'cancel':
            await handleCancelledPayment(paymentID);
            break;
            
          default:
            setResult({
              status: 'failed',
              error: 'Unknown payment status',
              message: `Received unknown status: ${status}`
            });
        }
      } catch (error) {
        console.error('❌ Error processing payment callback:', error);
        setResult({
          status: 'failed',
          error: 'Callback processing failed',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    };

    handlePaymentCallback();
  }, [searchParams]);

  const handleSuccessfulPayment = async (paymentID: string, signature?: string | null) => {
    try {
      console.log('✅ Processing successful payment:', paymentID);
      
      // Call backend to execute the payment
      const response = await apiClient.post('/api/payment/bkash/execute', { paymentID });
      
      if (response.data.success) {
        setResult({
          status: 'success',
          paymentID,
          transactionID: response.data.data.trxID,
          amount: response.data.data.amount,
          message: 'Payment completed successfully!'
        });
        
        toast.success('Payment successful! Your booking is confirmed.');
        
        // Redirect to success page after 3 seconds
        setTimeout(() => {
          router.push('/payment/success?paymentID=' + paymentID);
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Payment execution failed');
      }
    } catch (error) {
      console.error('❌ Failed to execute payment:', error);
      setResult({
        status: 'failed',
        paymentID,
        error: 'Payment execution failed',
        message: error instanceof Error ? error.message : 'Failed to complete payment'
      });
    }
  };

  const handleFailedPayment = async (paymentID: string) => {
    try {
      console.log('❌ Processing failed payment:', paymentID);
      
      // Query payment status to get details
      const response = await apiClient.get(`/api/payment/status/${paymentID}`);
      
      setResult({
        status: 'failed',
        paymentID,
        message: 'Payment failed. Please try again.',
        error: response.data.data?.statusMessage || 'Payment was not completed'
      });
      
      toast.error('Payment failed. Please try again.');
      
      // Redirect to failure page after 3 seconds
      setTimeout(() => {
        router.push('/payment/failed?paymentID=' + paymentID);
      }, 3000);
    } catch (error) {
      console.error('❌ Error handling failed payment:', error);
      setResult({
        status: 'failed',
        paymentID,
        error: 'Failed to process payment failure',
        message: 'An error occurred while processing the failed payment'
      });
    }
  };

  const handleCancelledPayment = async (paymentID: string) => {
    try {
      console.log('🚫 Processing cancelled payment:', paymentID);
      
      setResult({
        status: 'cancelled',
        paymentID,
        message: 'Payment was cancelled by user.',
      });
      
      toast.info('Payment was cancelled.');
      
      // Redirect to cancelled page after 3 seconds
      setTimeout(() => {
        router.push('/payment/cancelled?paymentID=' + paymentID);
      }, 3000);
    } catch (error) {
      console.error('❌ Error handling cancelled payment:', error);
      setResult({
        status: 'failed',
        paymentID,
        error: 'Failed to process payment cancellation',
        message: 'An error occurred while processing the cancelled payment'
      });
    }
  };

  const getStatusIcon = () => {
    switch (result.status) {
      case 'processing':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="h-16 w-16 text-yellow-500" />;
      default:
        return <Loader2 className="h-16 w-16 text-gray-500 animate-spin" />;
    }
  };

  const getStatusTitle = () => {
    switch (result.status) {
      case 'processing':
        return 'Processing Payment...';
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'cancelled':
        return 'Payment Cancelled';
      default:
        return 'Processing...';
    }
  };

  const getStatusColor = () => {
    switch (result.status) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'cancelled':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className={`text-2xl ${getStatusColor()}`}>
            {getStatusTitle()}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {result.message && (
            <p className="text-gray-600">{result.message}</p>
          )}
          
          {result.error && (
            <p className="text-red-500 text-sm">{result.error}</p>
          )}
          
          {result.paymentID && (
            <div className="bg-gray-100 p-3 rounded text-sm">
              <p><strong>Payment ID:</strong> {result.paymentID}</p>
              {result.transactionID && (
                <p><strong>Transaction ID:</strong> {result.transactionID}</p>
              )}
              {result.amount && (
                <p><strong>Amount:</strong> ৳{result.amount}</p>
              )}
            </div>
          )}
          
          {result.status === 'processing' && (
            <p className="text-sm text-gray-500">
              Please wait while we verify your payment...
            </p>
          )}
          
          {result.status !== 'processing' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                You will be redirected automatically...
              </p>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/ticket')}
                >
                  Back to Booking
                </Button>
                {result.status === 'success' && (
                  <Button 
                    size="sm"
                    onClick={() => router.push('/my-bookings')}
                  >
                    View Bookings
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Loading fallback component
function PaymentCallbackLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
          </div>
          <CardTitle className="text-2xl text-blue-600">
            Loading Payment...
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">Please wait while we process your payment callback...</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Main page component with Suspense boundary
export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<PaymentCallbackLoading />}>
      <PaymentCallbackContent />
    </Suspense>
  );
}

