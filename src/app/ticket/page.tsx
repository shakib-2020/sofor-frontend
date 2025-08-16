"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import TicketSelectionCard from "@/components/ticket-selection-card";
import { EnhancedSeatPlan } from "@/components/seat-selection/enhanced-seat-plan";
import { PaymentForm } from "@/components/payment/payment-form";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { _error, _log } from "@/lib/logs";
import { LoadingCard, LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/use-auth-user";

type Trip = {
	id: number;
	trip_number: string;
	heading: string;
	bus_info: {
		id: number;
		ownerId: number;
		name: string;
		seatCount: number;
	};
	route_info: {
		id: number;
		name: string;
	};
	departure_date: string;
	departure_time: string;
	arrival_date: string;
	arrival_time: string;
	boarding_points: { counterId: number; name: string; serial: number }[];
	dropping_points: { counterId: number; name: string; serial: number }[];
	fare: number;
	duration?: string;
};

interface SelectedSeat {
	id: number;
	seatName: string;
	status: 'available' | 'occupied' | 'booked';
	row: number;
	column: number;
}

function TicketPageContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { user, isLoading: authLoading } = useAuthUser();
	const [trips, setTrips] = useState<Trip[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
	const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
	const [currentStep, setCurrentStep] = useState<'trip-selection' | 'seat-selection' | 'payment'>('trip-selection');

	useEffect(() => {
		const from = searchParams.get("from");
		const to = searchParams.get("to");
		const jDate = searchParams.get("jDate");
		const rDate = searchParams.get("rDate");

		if (!from || !to || !jDate) return; // required params

		const fetchTrips = async () => {
			setLoading(true);
			try {
				const res = await fetch(
					`/api/trip/search?from=${from}&to=${to}&jDate=${jDate}${
						rDate ? `&rDate=${rDate}` : ""
					}`,
				);
				const data = await res.json();
				
				// Ensure data is an array and filter valid trips
				let validTrips = [];
				if (Array.isArray(data)) {
					validTrips = data.filter(trip => trip && trip.id && trip.bus_info && trip.route_info);
				}
				
				setTrips(validTrips);
			} catch (err) {
				_error("Error fetching trips:", err);
				setTrips([]); // Reset to empty array on error
			} finally {
				setLoading(false);
			}
		};

		fetchTrips();
	}, [searchParams]);

	const handleTripSelect = (trip: Trip) => {
		setSelectedTrip(trip);
		setCurrentStep('seat-selection');
		setSelectedSeats([]);
	};

	const handleSeatSelect = (seats: SelectedSeat[]) => {
		setSelectedSeats(seats);
	};

	const handleProceedToPayment = () => {
		if (selectedSeats.length === 0) {
			toast.error('Please select at least one seat');
			return;
		}
		
		// 🚫 Socket seat occupation disabled for Vercel deployment
		// Seats will be reserved during the payment process on the backend
		// No need for real-time seat occupation via WebSocket
		
		setCurrentStep('payment');
	};

	const handleBackToTripSelection = () => {
		setCurrentStep('trip-selection');
		setSelectedTrip(null);
		setSelectedSeats([]);
	};

	const handleBackToSeatSelection = () => {
		// 🚫 Socket seat release disabled for Vercel deployment
		// Seats will be automatically released if payment is not completed within timeout
		// No need for real-time seat release via WebSocket
		
		setCurrentStep('seat-selection');
	};

	const handlePaymentSuccess = (paymentData: any) => {
		// Handle successful payment
		console.log('Payment successful:', paymentData);
		toast.success('Payment successful! Your booking is confirmed.');
		
		// Seats will be automatically marked as "booked" by the backend
		// Clear local selection state
		setSelectedSeats([]);
		
		// Redirect to my bookings page or success page
		setTimeout(() => {
			router.push('/my-bookings');
		}, 2000);
	};

	const calculateTotalAmount = () => {
		const farePerSeat = selectedTrip?.fare || 800;
		return (farePerSeat * selectedSeats.length).toString();
	};

	return (
		<Sheet>
			<h2 className="my-4 font-semibold text-3xl">Choose Departing Ticket :</h2>

			{/* Trip list */}
			{loading && (
				<div>
					<div className="flex items-center justify-center mb-4">
						<LoadingSpinner size="md" />
						<span className="ml-2 text-gray-600">Loading trips...</span>
					</div>
					<LoadingCard />
					<LoadingCard />
					<LoadingCard />
				</div>
			)}
			{!loading && trips.length === 0 && (
				<div className="text-center py-8">
					<p className="text-gray-500 mb-4">No trips found for your search criteria.</p>
					<p className="text-sm text-gray-400">Try adjusting your search parameters.</p>
				</div>
			)}
			{!loading &&
				trips.map((trip) => (
					<div
						key={`${trip.id}`}
						onClick={() => handleTripSelect(trip)}
						className="cursor-pointer"
					>
						<TicketSelectionCard trip={trip} />
					</div>
				))}

			{/* Step 2: Seat Selection */}
			{currentStep === 'seat-selection' && selectedTrip && (
				<div className="max-w-4xl mx-auto">
					{/* Header */}
					<div className="mb-6">
						<Button 
							variant="ghost" 
							onClick={handleBackToTripSelection}
							className="mb-4"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Trip Selection
						</Button>

						<div className="bg-white p-6 rounded-lg shadow-sm border">
							<div className="flex items-center justify-between mb-4">
								<div>
									<h2 className="text-xl font-bold">{selectedTrip.heading}</h2>
									<p className="text-gray-600">{selectedTrip.trip_number}</p>
								</div>
								<div className="text-right">
									<p className="text-sm text-gray-600">Bus</p>
									<p className="font-semibold">{selectedTrip.bus_info?.name}</p>
							</div>
						</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								<div>
									<span className="text-gray-600">Departure:</span>
									<p className="font-medium">
										{new Date(`${selectedTrip.departure_date}T${selectedTrip.departure_time}`).toLocaleString()}
									</p>
									<p className="text-gray-600">{selectedTrip.boarding_points?.[0]?.name}</p>
								</div>
							<div>
									<span className="text-gray-600">Arrival:</span>
									<p className="font-medium">
										{new Date(`${selectedTrip.arrival_date}T${selectedTrip.arrival_time}`).toLocaleString()}
									</p>
									<p className="text-gray-600">
										{selectedTrip.dropping_points?.[selectedTrip.dropping_points.length - 1]?.name}
									</p>
							</div>
							</div>
							</div>
						</div>

					{/* Seat Selection */}
					<div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
						<h3 className="text-lg font-semibold mb-4">Select Your Seats</h3>
						<EnhancedSeatPlan
							busId={selectedTrip.bus_info?.id || 1}
							tripId={selectedTrip.id}
							onSeatSelect={handleSeatSelect}
							maxSeats={4}
						/>
					</div>

					{/* Booking Summary & Proceed */}
					{selectedSeats.length > 0 && (
						<div className="bg-white p-6 rounded-lg shadow-sm border">
							<h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
							
							<div className="space-y-2 mb-4">
								<div className="flex justify-between">
									<span>Selected Seats:</span>
									<span className="font-medium">
										{selectedSeats.map(seat => seat.seatName).join(', ')}
							</span>
								</div>
								<div className="flex justify-between">
									<span>Number of Seats:</span>
									<span className="font-medium">{selectedSeats.length}</span>
								</div>
								<div className="flex justify-between">
									<span>Price per Seat:</span>
									<span className="font-medium">৳{selectedTrip.fare}</span>
								</div>
								<div className="border-t pt-2">
									<div className="flex justify-between text-lg font-bold">
										<span>Total Amount:</span>
										<span className="text-green-600">৳{calculateTotalAmount()}</span>
									</div>
								</div>
							</div>

							<Button 
								onClick={handleProceedToPayment}
								className="w-full bg-green-500 hover:bg-green-600"
								size="lg"
							>
								Proceed to Payment (৳{calculateTotalAmount()})
							</Button>
						</div>
					)}
						</div>
			)}

			{/* Step 3: Payment */}
			{currentStep === 'payment' && selectedTrip && selectedSeats.length > 0 && (
				<div className="max-w-2xl mx-auto">
					<Button 
						variant="ghost" 
						onClick={handleBackToSeatSelection}
						className="mb-4"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Seat Selection
					</Button>

					<PaymentForm
						bookingData={{
							tripId: selectedTrip.id,
							busId: selectedTrip.bus_info?.id || 1,
							seatId: selectedSeats[0].id, // For now, using first seat ID
							boardingPointId: selectedTrip.boarding_points?.[0]?.counterId || 1,
							droppingPointId: selectedTrip.dropping_points?.[selectedTrip.dropping_points.length - 1]?.counterId || 2,
							totalAmount: calculateTotalAmount(),
						}}
						onPaymentSuccess={handlePaymentSuccess}
						onCancel={handleBackToSeatSelection}
					/>
					</div>
			)}
		</Sheet>
	);
}

function TicketPage() {
	return (
		<Suspense fallback={
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		}>
			<TicketPageContent />
		</Suspense>
	);
}

export default TicketPage;
