'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Eye, Loader2, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { generateTicketPDF, printTicket, type TicketData } from '@/lib/ticket-generator';

interface PaymentDetails {
  paymentID: string;
  transactionID?: string;
  amount?: string;
  bookingDetails?: {
    id: number;
    bookingNumber: string;
    passengerName: string;
    passengerPhone: string;
    passengerEmail: string;
    totalAmount: string;
    trip?: {
      heading: string;
      departureDateTime: string;
      arrivalDateTime: string;
    };
    bus?: {
      name: string;
    };
    seat?: {
      seatName: string;
    };
    seats?: Array<{
      id: number;
      seatName: string;
    }>;
    boardingPoint?: {
      name: string;
    };
    droppingPoint?: {
      name: string;
    };
  };
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
      const [paymentResponse, bookingResponse] = await Promise.all([
        apiClient.get(`/api/payment/status/${paymentID}`),
        // We need to get booking details separately if available
        apiClient.get(`/api/payment/status/${paymentID}`).then(res => {
          if (res.data.success && res.data.data.bookingNumber) {
            // Try to get detailed booking info
            return apiClient.get(`/api/booking/${res.data.data.bookingId || 0}`);
          }
          return null;
        }).catch(() => null)
      ]);

      if (paymentResponse.data.success) {
        setPaymentDetails({
          paymentID,
          transactionID: paymentResponse.data.data.bkashTransactionID,
          amount: paymentResponse.data.data.amount,
          bookingDetails: bookingResponse?.data?.success ? bookingResponse.data.data : {
            bookingNumber: paymentResponse.data.data.bookingNumber || paymentID,
            passengerName: 'N/A',
            passengerPhone: 'N/A',
            passengerEmail: 'N/A',
            totalAmount: paymentResponse.data.data.amount || '0'
          }
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
    router.push('/');
  };

  const getSeatNames = () => {
    const booking = paymentDetails?.bookingDetails;

    if (!booking) {
      return [] as string[];
    }

    if (booking.seats?.length) {
      return booking.seats.map((seat) => seat.seatName);
    }

    if (booking.seat?.seatName) {
      return [booking.seat.seatName];
    }

    return [] as string[];
  };

  const getFarePerSeat = () => {
    const totalAmount = Number.parseFloat(paymentDetails?.bookingDetails?.totalAmount || paymentDetails?.amount || '0');
    const seatCount = Math.max(getSeatNames().length, 1);
    return (totalAmount / seatCount).toFixed(2);
  };

  const handleDownloadTicket = async () => {
    if (!paymentDetails?.bookingDetails) {
      toast.error('Booking details not available');
      return;
    }

    try {
      const booking = paymentDetails.bookingDetails;
      const seatNames = getSeatNames();
      const seatLabel = seatNames.length > 0 ? seatNames.join(', ') : 'N/A';

      const ticketData: TicketData = {
        bookingNumber: booking.bookingNumber,
        passengerName: booking.passengerName,
        passengerPhone: booking.passengerPhone,
        passengerEmail: booking.passengerEmail,
        tripHeading: booking.trip?.heading || 'Bus Journey',
        departureDate: booking.trip?.departureDateTime?.split('T')[0] || 'N/A',
        departureTime: booking.trip?.departureDateTime?.split('T')[1]?.substring(0, 5) || 'N/A',
        arrivalDate: booking.trip?.arrivalDateTime?.split('T')[0] || 'N/A',
        arrivalTime: booking.trip?.arrivalDateTime?.split('T')[1]?.substring(0, 5) || 'N/A',
        busName: booking.bus?.name || 'Bus',
        seatNumber: seatLabel,
        seatNumbers: seatNames,
        farePerSeat: getFarePerSeat(),
        boardingPoint: booking.boardingPoint?.name || 'N/A',
        droppingPoint: booking.droppingPoint?.name || 'N/A',
        totalAmount: booking.totalAmount,
        paymentMethod: 'bKash',
        transactionId: paymentDetails.transactionID,
        status: 'Confirmed'
      };

      await generateTicketPDF(ticketData);
      toast.success('Ticket downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download ticket');
    }
  };

  const handlePrintTicket = async () => {
    if (!paymentDetails?.bookingDetails) {
      toast.error('Booking details not available');
      return;
    }

    try {
      const booking = paymentDetails.bookingDetails;
      const seatNames = getSeatNames();
      const seatLabel = seatNames.length > 0 ? seatNames.join(', ') : 'N/A';

      const ticketData: TicketData = {
        bookingNumber: booking.bookingNumber,
        passengerName: booking.passengerName,
        passengerPhone: booking.passengerPhone,
        passengerEmail: booking.passengerEmail,
        tripHeading: booking.trip?.heading || 'Bus Journey',
        departureDate: booking.trip?.departureDateTime?.split('T')[0] || 'N/A',
        departureTime: booking.trip?.departureDateTime?.split('T')[1]?.substring(0, 5) || 'N/A',
        arrivalDate: booking.trip?.arrivalDateTime?.split('T')[0] || 'N/A',
        arrivalTime: booking.trip?.arrivalDateTime?.split('T')[1]?.substring(0, 5) || 'N/A',
        busName: booking.bus?.name || 'Bus',
        seatNumber: seatLabel,
        seatNumbers: seatNames,
        farePerSeat: getFarePerSeat(),
        boardingPoint: booking.boardingPoint?.name || 'N/A',
        droppingPoint: booking.droppingPoint?.name || 'N/A',
        totalAmount: booking.totalAmount,
        paymentMethod: 'bKash',
        transactionId: paymentDetails.transactionID,
        status: 'Confirmed'
      };

      await printTicket(ticketData);
      toast.success('Ticket sent to printer!');
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print ticket');
    }
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
            <div className="space-y-4 text-left">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Payment Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono text-right break-all">{paymentDetails.paymentID}</span>
                  </div>
                  {paymentDetails.transactionID && (
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-right break-all">{paymentDetails.transactionID}</span>
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

              {paymentDetails.bookingDetails && (
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 className="font-semibold">Booking Summary</h4>
                      <p className="text-sm text-gray-600">Booking #{paymentDetails.bookingDetails.bookingNumber}</p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      {getSeatNames().length > 1 ? (
                        <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                          Group Booking
                        </div>
                      ) : null}
                      <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                        {getSeatNames().length || 1} {(getSeatNames().length || 1) > 1 ? 'Seats' : 'Seat'}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {(getSeatNames().length > 0 ? getSeatNames() : ['Seat unavailable']).map((seatName) => (
                      <span
                        key={seatName}
                        className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                      >
                        {seatName}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2">
                    <div>
                      <span className="text-gray-500">Passenger:</span> {paymentDetails.bookingDetails.passengerName}
                    </div>
                    <div>
                      <span className="text-gray-500">Bus:</span> {paymentDetails.bookingDetails.bus?.name || 'N/A'}
                    </div>
                    <div>
                      <span className="text-gray-500">Route:</span> {paymentDetails.bookingDetails.trip?.heading || 'N/A'}
                    </div>
                    <div>
                      <span className="text-gray-500">Total:</span> ৳{paymentDetails.bookingDetails.totalAmount}
                    </div>
                    <div>
                      <span className="text-gray-500">Fare / Seat:</span> ৳{getFarePerSeat()}
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">Per-seat fare breakdown</p>
                      <p className="text-xs text-slate-500">For receipt and conductor reference</p>
                    </div>
                    <div className="space-y-2">
                      {(getSeatNames().length > 0 ? getSeatNames() : ['Seat unavailable']).map((seatName) => (
                        <div key={seatName} className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm text-slate-700">
                          <span>{seatName}</span>
                          <span className="font-medium">৳{getFarePerSeat()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={handleViewBookings}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                <Eye className="mr-2 h-4 w-4" />
                My Bookings
              </Button>
              <Button
                onClick={handleDownloadTicket}
                variant="outline"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button
                onClick={handlePrintTicket}
                variant="outline"
                className="w-full"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Ticket
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