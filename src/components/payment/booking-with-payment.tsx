'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentForm } from './payment-form';
import SeatPlan from '@/components/seat-plan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Clock, Bus } from 'lucide-react';

interface TripDetails {
  id: number;
  tripNumber: string;
  heading: string;
  departureDateTime: string;
  arrivalDateTime: string;
  bus: {
    id: number;
    name: string;
    seatCount: number;
  };
  route: {
    id: number;
    name: string;
  };
}

interface BookingData {
  tripId: number;
  busId: number;
  seatId: number;
  seatName: string;
  boardingPointId: number;
  droppingPointId: number;
  totalAmount: string;
  boardingPoint: string;
  droppingPoint: string;
}

export function BookingWithPayment() {
  const [currentStep, setCurrentStep] = useState<'seat-selection' | 'payment'>('seat-selection');
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Mock user ID - in real app, get from auth context
  const userId = 'user123';

  useEffect(() => {
    // In real app, fetch trip details based on search params
    const tripId = searchParams.get('tripId');
    if (tripId) {
      // Mock trip data - replace with actual API call
      setTripDetails({
        id: Number.parseInt(tripId),
        tripNumber: 'TR-001',
        heading: 'Dhaka - Sylhet',
        departureDateTime: new Date().toISOString(),
        arrivalDateTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        bus: {
          id: 1,
          name: 'Shohagh Paribahan',
          seatCount: 40
        },
        route: {
          id: 1,
          name: 'Dhaka - Sylhet Express'
        }
      });
    }
  }, [searchParams]);

  const handleSeatSelect = (seatName: string) => {
    setSelectedSeat(seatName);
  };

  const handleProceedToPayment = () => {
    if (!selectedSeat || !tripDetails) return;

    // Mock booking data - in real app, calculate fare based on route
    const mockBookingData: BookingData = {
      tripId: tripDetails.id,
      busId: tripDetails.bus.id,
      seatId: 1, // Mock seat ID
      seatName: selectedSeat,
      boardingPointId: 1,
      droppingPointId: 2,
      totalAmount: '800',
      boardingPoint: 'Dhaka - Mohakhali',
      droppingPoint: 'Sylhet - Amberkhana'
    };

    setBookingData(mockBookingData);
    setCurrentStep('payment');
  };

  const handleBackToSeatSelection = () => {
    setCurrentStep('seat-selection');
    setBookingData(null);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    // Handle successful payment
    console.log('Payment successful:', paymentData);
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (!tripDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading trip details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => window.history.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h1 className="text-2xl font-bold">{tripDetails.heading}</h1>
                  <p className="text-gray-600">Trip: {tripDetails.tripNumber}</p>
                </div>
                <Badge variant="secondary" className="w-fit">
                  {currentStep === 'seat-selection' ? 'Select Seat' : 'Payment'}
                </Badge>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Bus className="mr-2 h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-semibold">{tripDetails.bus.name}</p>
                    <p className="text-sm text-gray-600">{tripDetails.bus.seatCount} seats</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-semibold">
                      {formatDateTime(tripDetails.departureDateTime).time}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(tripDetails.departureDateTime).date}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-red-500" />
                  <div>
                    <p className="font-semibold">{tripDetails.route.name}</p>
                    <p className="text-sm text-gray-600">Express Route</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {currentStep === 'seat-selection' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Seat Plan */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Select Your Seat</CardTitle>
                  <CardDescription>
                    Choose your preferred seat from the available options.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SeatPlan 
                    busId={tripDetails.bus.id}
                    onSeatSelect={handleSeatSelect}
                    selectedSeat={selectedSeat}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedSeat && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="font-semibold">Selected Seat: {selectedSeat}</p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Base Fare:</span>
                        <span>৳800</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total Amount:</span>
                        <span>৳800</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={handleProceedToPayment}
                      disabled={!selectedSeat}
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentStep === 'payment' && bookingData && (
          <PaymentForm
            bookingData={bookingData}
            userId={userId}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={handleBackToSeatSelection}
          />
        )}
      </div>
    </div>
  );
}
