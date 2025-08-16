'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  CreditCard, 
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock3
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthUser } from '@/hooks/use-auth-user';
import { apiClient } from '@/lib/api';
import { format, isValid, parseISO } from 'date-fns';

interface Booking {
  id: number;
  bookingNumber: string;
  tripId: number;
  busId: number;
  seatId: number;
  bookingDate: string;
  totalAmount: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'failed';
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  isPaid: boolean;
  createdAt: string;
  // Additional trip/bus details from joins
  trip?: {
    heading: string;
    departure_date: string;
    departure_time: string;
    arrival_date: string;
    arrival_time: string;
  };
  bus?: {
    name: string;
  };
  seat?: {
    seatName: string;
  };
  boardingPoint?: {
    name: string;
  };
  droppingPoint?: {
    name: string;
  };
  payment?: {
    method: string;
    transactionId: string;
    status: string;
  };
}

interface Payment {
  id: number;
  paymentId: string;
  amount: string;
  method: string;
  status: string;
  gatewayTransactionId: string;
  createdAt: string;
  booking?: {
    bookingNumber: string;
    passengerName: string;
  };
}

export default function MyBookingsPage() {
  return <MyBookingsContent />;
}

function MyBookingsContent() {
  const { user, isLoading: authLoading } = useAuthUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bookings' | 'payments'>('bookings');

  // Helper function to safely format dates
  const safeFormatDate = (dateString: string | null | undefined, formatString: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      let date: Date;
      
      // Try parsing as ISO string first
      if (typeof dateString === 'string') {
        date = parseISO(dateString);
      } else {
        date = new Date(dateString);
      }
      
      // Check if the date is valid
      if (!isValid(date)) {
        return 'Invalid Date';
      }
      
      return format(date, formatString);
    } catch (error) {
      console.warn('Date formatting error:', error, 'for date:', dateString);
      return 'Invalid Date';
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  const fetchUserData = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const [bookingsResponse, paymentsResponse] = await Promise.all([
        apiClient.get(`/api/booking/user/${user.id}`),
        apiClient.get(`/api/payment/user/${user.id}`)
      ]);

      console.log('📋 Bookings response:', bookingsResponse.data);
      console.log('💳 Payments response:', paymentsResponse.data);

      if (bookingsResponse.data.success) {
        const bookingsData = bookingsResponse.data.data?.bookings || [];
        console.log('📋 Setting bookings:', bookingsData);
        setBookings(bookingsData);
      }

      if (paymentsResponse.data.success) {
        const paymentsData = paymentsResponse.data.data?.payments || [];
        console.log('💳 Setting payments:', paymentsData);
        setPayments(paymentsData);
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      setError('Failed to load your bookings and payments');
      toast.error('Failed to load your data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock3 className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadTicket = (booking: Booking) => {
    // TODO: Implement ticket download
    toast.info('Ticket download will be available soon');
  };

  const handleRefresh = () => {
    fetchUserData();
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Account</h1>
            <p className="text-gray-600">Manage your bookings and payment history</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'bookings'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'payments'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Payment History ({payments.length})
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Bookings Yet</h3>
                  <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
                  <Button onClick={() => window.location.href = '/ticket'}>
                    Book Your First Ticket
                  </Button>
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {booking.trip?.heading || `Trip #${booking.tripId}`}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          Booking #{booking.bookingNumber}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(booking.status)}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1">{booking.status}</span>
                        </Badge>
                        {booking.isPaid && (
                          <Badge variant="secondary">
                            <CreditCard className="h-3 w-3 mr-1" />
                            Paid
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Trip Details */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-gray-700">Trip Details</h4>
                        
                        {booking.trip && (
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              {safeFormatDate(booking.trip.departure_date, 'MMM dd, yyyy')}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              {booking.trip.departure_time} - {booking.trip.arrival_time}
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-2 text-sm">
                          {booking.boardingPoint && (
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              From: {booking.boardingPoint.name}
                            </div>
                          )}
                          {booking.droppingPoint && (
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              To: {booking.droppingPoint.name}
                            </div>
                          )}
                          <div className="flex items-center text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            Seat: {booking.seat?.seatName || booking.seatId}
                          </div>
                        </div>
                      </div>

                      {/* Passenger & Payment Details */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-gray-700">Booking Details</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Passenger:</span>
                            <span className="ml-2 font-medium">{booking.passengerName}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Phone:</span>
                            <span className="ml-2">{booking.passengerPhone}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <span className="ml-2">{booking.passengerEmail}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Amount:</span>
                            <span className="ml-2 font-semibold text-green-600">৳{booking.totalAmount}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Booked on:</span>
                            <span className="ml-2">{safeFormatDate(booking.createdAt, 'MMM dd, yyyy HH:mm')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {booking.status === 'confirmed' && booking.isPaid && (
                      <div className="mt-4 pt-4 border-t">
                        <Button 
                          onClick={() => handleDownloadTicket(booking)}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Ticket
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            {payments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Payments Yet</h3>
                  <p className="text-gray-500">Your payment history will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              payments.map((payment) => (
                <Card key={payment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">Payment #{payment.paymentId}</h3>
                          <Badge className={getStatusColor(payment.status)}>
                            {getStatusIcon(payment.status)}
                            <span className="ml-1">{payment.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {payment.booking?.bookingNumber} - {payment.booking?.passengerName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {safeFormatDate(payment.createdAt, 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          ৳{payment.amount}
                        </div>
                        <div className="text-sm text-gray-600">
                          via {payment.method}
                        </div>
                        {payment.gatewayTransactionId && (
                          <div className="text-xs text-gray-500 font-mono">
                            {payment.gatewayTransactionId}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}