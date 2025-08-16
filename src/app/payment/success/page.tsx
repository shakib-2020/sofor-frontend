'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface PaymentDetails {
  paymentID: string;
  transactionID?: string;
  amount?: string;
  bookingDetails?: any;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const paymentID = searchParams.get('paymentID');
    
    if (paymentID) {
      fetchPaymentDetails(paymentID);
    } else {
      setLoading(false);
      toast.error('No payment ID provided');
    }
  }, [searchParams]);

  const fetchPaymentDetails = async (paymentID: string) => {
    try {
      const response = await apiClient.get(`/api/payment/status/${paymentID}`);
      
      if (response.data.success) {
        setPaymentDetails({
          paymentID,
          transactionID: response.data.data.trxID,
          amount: response.data.data.amount,
          bookingDetails: response.data.data.booking
        });
      }
    } catch (error) {
      console.error('❌ Error fetching payment details:', error);
      toast.error('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBookings = () => {
    router.push('/my-bookings');
  };

  const handleNewBooking = () => {
    router.push('/ticket');
  };

  const handleDownloadTicket = () => {
    // TODO: Implement ticket download functionality
    toast.info('Ticket download will be available soon');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
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
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <CardTitle className="text-3xl text-green-600">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              🎉 Your booking has been confirmed!
            </h3>
            <p className="text-green-700">
              Thank you for choosing our service. Your ticket has been booked successfully.
            </p>
          </div>
          
          {paymentDetails && (
            <div className="bg-gray-100 p-4 rounded-lg text-left">
              <h4 className="font-semibold mb-3">Payment Details:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono">{paymentDetails.paymentID}</span>
                </div>
                {paymentDetails.transactionID && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono">{paymentDetails.transactionID}</span>
                  </div>
                )}
                {paymentDetails.amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-semibold">৳{paymentDetails.amount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span>bKash</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-semibold">Completed</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                onClick={handleViewBookings}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                <Eye className="mr-2 h-4 w-4" />
                View My Bookings
              </Button>
              <Button 
                onClick={handleDownloadTicket}
                variant="outline"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Ticket
              </Button>
            </div>
            
            <Button 
              onClick={handleNewBooking}
              variant="ghost"
              className="w-full"
            >
              Book Another Ticket
            </Button>
          </div>
          
          <div className="text-sm text-gray-500 border-t pt-4">
            <p>
              📧 A confirmation email has been sent to your registered email address.
            </p>
            <p className="mt-1">
              📱 You can also view your ticket details in the "My Bookings" section.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading fallback component
function PaymentSuccessLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-16 w-16 text-green-500 animate-spin" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Loading Payment Details...
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">Please wait while we process your payment details...</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Main page component with Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}