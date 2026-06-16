'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { paymentAPI } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const paymentFormSchema = z.object({
  passengerName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  passengerPhone: z
    .string()
    .regex(/^(\+?88)?0?1[3-9]\d{8}$/, 'Please enter a valid Bangladesh mobile number (e.g., 01761579485)')
    .transform((val) => {
      // Normalize phone number format
      let cleaned = val.replace(/[^\d]/g, '');
      if (cleaned.startsWith('88')) cleaned = cleaned.substring(2);
      if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
      return '0' + cleaned; // Return in 01XXXXXXXXX format
    }),
  passengerEmail: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required for payment processing'),
});

interface PaymentFormProps {
  bookingData: {
    tripId: number;
    busId: number;
    seatIds: number[];
    seatNames?: string[];
    boardingPointId: number;
    droppingPointId: number;
    totalAmount: string;
  };
  onPaymentSuccess: (paymentData: any) => void;
  onCancel: () => void;
}

export function PaymentForm({ bookingData, onPaymentSuccess, onCancel }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      passengerName: user?.name || '',
      passengerPhone: '',
      passengerEmail: user?.email || '',
    },
  });

  useEffect(() => {
    if (user) {
      const currentValues = form.getValues();
      if (!currentValues.passengerName && user.name) {
        form.setValue('passengerName', user.name);
      }
      if (!currentValues.passengerEmail && user.email) {
        form.setValue('passengerEmail', user.email);
      }
    }
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof paymentFormSchema>) => {
    setIsLoading(true);

    try {
      const paymentRequest = {
        ...bookingData,
        ...values,
      };

      const response = await paymentAPI.createBookingWithPayment(paymentRequest);

      if (response.data.success) {
        toast.success('Booking created! Redirecting to payment...');

        // Redirect to Bkash payment URL
        const { bkashURL, paymentId } = response.data.data;

        // Store payment info for callback handling
        localStorage.setItem('pendingPayment', JSON.stringify({
          paymentId,
          bookingData: response.data.data
        }));

        // Open Bkash payment URL
        window.open(bkashURL, '_self');

      } else {
        toast.error('Failed to create booking');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking with payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Passenger Information & Payment</CardTitle>
        <CardDescription>
          Please fill in the passenger details to proceed with booking and payment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="passengerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passenger Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Ahmed Hassan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passengerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="01761579485" {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-600">Bangladesh mobile number (required for Bkash payment)</p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passengerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="ahmed@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-600">Required for payment confirmation and ticket receipt</p>
                </FormItem>
              )}
            />

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Payment Summary</h3>
              <div className="flex justify-between items-center mb-2">
                <span>Seats:</span>
                <span className="font-medium">{bookingData.seatIds.length}</span>
              </div>
              {bookingData.seatNames?.length ? (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Selected seats</p>
                  <div className="flex flex-wrap gap-2">
                    {bookingData.seatNames.map((seatName) => (
                      <span
                        key={seatName}
                        className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                      >
                        {seatName}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="flex justify-between items-center">
                <span>Total Amount:</span>
                <span className="font-bold text-xl">৳{bookingData.totalAmount}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                You will be redirected to Bkash for secure payment processing.
              </p>
            </div>

            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
