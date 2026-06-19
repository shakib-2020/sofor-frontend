'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { RefreshCw, Check, X } from 'lucide-react';

interface Booking {
  id: number;
  bookingNumber: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  totalAmount: string;
  commissionAmount?: string;
  status: string;
  bookingDate: string;
  seats: Array<{ seatName: string }>;
  trip?: {
    tripNumber: string;
    heading: string;
    departureDateTime: string;
  };
  bus?: {
    name: string;
  };
}

export default function BookingsManagementPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/booking?limit=1000');
      if (res.data?.success) {
        setBookings(res.data?.data?.bookings || []);
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await apiClient.put(`/api/booking/${id}/status`, { status: newStatus });
      if (res.data?.success) {
        toast.success(`Booking marked as ${newStatus}`);
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await apiClient.put(`/api/booking/${id}/cancel`, { reason: 'Cancelled by operator staff' });
      if (res.data?.success) {
        toast.success('Booking cancelled successfully');
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Bookings Management</CardTitle>
          <Button onClick={fetchBookings} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking No</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Trip / Bus</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-semibold">{booking.bookingNumber}</TableCell>
                    <TableCell>{booking.passengerName}</TableCell>
                    <TableCell>{booking.passengerPhone}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{booking.trip?.heading || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{booking.bus?.name || 'Bus'} ({booking.trip?.tripNumber || 'Trip'})</div>
                    </TableCell>
                    <TableCell>
                      {booking.seats?.map(s => s.seatName).join(', ') || 'N/A'}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">৳{booking.totalAmount}</TableCell>
                    <TableCell className="font-semibold text-blue-600">৳{booking.commissionAmount || (Number(booking.totalAmount) * 0.10).toFixed(0)}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="inline-flex gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <Button 
                              onClick={() => handleUpdateStatus(booking.id, 'confirmed')} 
                              size="icon" 
                              className="bg-green-600 hover:bg-green-700 text-white h-8 w-8"
                              title="Confirm Booking"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              onClick={() => handleCancelBooking(booking.id)} 
                              size="icon" 
                              variant="destructive"
                              className="h-8 w-8"
                              title="Cancel Booking"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button 
                            onClick={() => handleCancelBooking(booking.id)} 
                            size="icon" 
                            variant="destructive"
                            className="h-8 w-8"
                            title="Cancel Booking"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {bookings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No bookings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
