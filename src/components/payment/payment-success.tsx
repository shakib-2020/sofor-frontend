'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { paymentAPI } from '@/lib/api';
import { toast } from 'sonner';

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentId?: string;
  amount?: string;
  status?: string;
  bookingId?: number;
  bookingNumber?: string;
  error?: string;
}

export function PaymentSuccess() {
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        const paymentID = searchParams.get('paymentID');
        const status = searchParams.get('status');
        
        if (!paymentID) {
          setPaymentResult({
            success: false,
            error: 'Payment ID not found'
          });
          return;
        }

        // Get pending payment info from localStorage
        const pendingPayment = localStorage.getItem('pendingPayment');
        if (!pendingPayment) {
          setPaymentResult({
            success: false,
            error: 'Payment session expired'
          });
          return;
        }

        if (status === 'success') {
          // Execute payment
          const response = await paymentAPI.executeBkashPayment(paymentID);
          
          if (response.data.success) {
            setPaymentResult({
              success: true,
              transactionId: response.data.data.transactionId,
              paymentId: response.data.data.paymentId,
              amount: response.data.data.amount,
              status: response.data.data.status,
              bookingId: response.data.data.bookingId,
              bookingNumber: response.data.data.bookingNumber
            });
            
            // Clear pending payment
            localStorage.removeItem('pendingPayment');
            toast.success('Payment completed successfully!');
          } else {
            throw new Error(response.data.message);
          }
        } else {
          // Payment failed or cancelled
          setPaymentResult({
            success: false,
            error: status === 'cancel' ? 'Payment was cancelled' : 'Payment failed'
          });
        }
      } catch (error: any) {
        console.error('Payment callback error:', error);
        setPaymentResult({
          success: false,
          error: error.response?.data?.message || 'Payment processing failed'
        });
        toast.error('Payment processing failed');
      } finally {
        setIsLoading(false);
      }
    };

    handlePaymentCallback();
  }, [searchParams]);

  const handleContinue = () => {
    if (paymentResult?.success && paymentResult.bookingId) {
      router.push(`/booking/${paymentResult.bookingId}`);
    } else {
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Clock className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <p className="text-lg font-medium">Processing Payment...</p>
            <p className="text-gray-600 text-center mt-2">
              Please wait while we confirm your payment with Bkash.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader className="text-center pb-4">
          {paymentResult?.success ? (
            <>
              <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">Payment Successful!</CardTitle>
              <CardDescription className="text-lg">
                Your booking has been confirmed and payment processed successfully.
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-700">Payment Failed</CardTitle>
              <CardDescription className="text-lg">
                {paymentResult?.error || 'Something went wrong with your payment.'}
              </CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent>
          {paymentResult?.success && (
            <div className="space-y-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Booking Number:</p>
                    <p className="font-semibold">{paymentResult.bookingNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Transaction ID:</p>
                    <p className="font-semibold">{paymentResult.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Amount Paid:</p>
                    <p className="font-semibold">৳{paymentResult.amount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status:</p>
                    <Badge variant="default" className="bg-green-500">
                      {paymentResult.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  📧 A confirmation email with your booking details has been sent to your registered email address.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="flex-1"
            >
              Back to Home
            </Button>
            
            {paymentResult?.success ? (
              <Button 
                onClick={handleContinue}
                className="flex-1"
              >
                View Booking Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={() => router.push('/booking')}
                className="flex-1"
              >
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
