"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import SeatPlan from "@/components/seat-plan";
import TicketSelectionCard from "@/components/ticket-selection-card";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { _error, _log } from "@/lib/logs";
import seatplan from "@/lib/seatplan.json" with { type: "json" };

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

function TicketPage() {
	const searchParams = useSearchParams();
	const [trips, setTrips] = useState<Trip[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

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
				setTrips(data);
			} catch (err) {
				_error("Error fetching trips:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchTrips();
	}, [searchParams]);

	return (
		<Sheet>
			<h2 className="my-4 font-semibold text-3xl">Choose Departing Ticket :</h2>

			{/* Trip list */}
			{loading && <p>Loading trips...</p>}
			{!loading && trips.length === 0 && <p>No trips found.</p>}
			{!loading &&
				trips.map((trip) => (
					<button
						key={`${trip.id}`}
						type="button"
						onClick={() => setSelectedTrip(trip)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								setSelectedTrip(trip);
							}
						}}
						className="w-full text-left bg-transparent border-none p-0 m-0 cursor-pointer"
						tabIndex={0}
						aria-label={`Select trip ${trip.trip_number}`}
					>
						<TicketSelectionCard trip={trip} />
					</button>
				))}

			{/* Seat plan + details for selected trip */}
			{selectedTrip && (
				<SheetContent className="m-0 items-start overflow-x-hidden overflow-y-scroll border-none p-0">
					<div className="p-4">
						<SheetHeader className="mb-3">
							<SheetTitle>
								Choose your preferred seats for your journey.
							</SheetTitle>
						</SheetHeader>

						<div className="mb-4 flex w-auto flex-col items-start">
							<Image
								alt="bus company logo"
								className="h-auto w-16"
								height={100}
								src={
									"https://bus-promotion-bucket.s3-ap-southeast-1.amazonaws.com/production/busowners-logo/hanif.png?v=1.0.0"
								}
								width={100}
							/>
							<h2 className="font-bold text-lg">
								{selectedTrip.bus_info.name}
							</h2>
							<div className="mb-4 font-semibold text-gray-700 text-xs">
								<p>Seats: {selectedTrip.bus_info.seatCount}</p>
								<p>Route: {selectedTrip.route_info.name}</p>
							</div>
						</div>

						<div className="mb-4 flex items-center justify-between gap-2">
							<div>
								<span className="font-bold text-xl">
									{new Date(
										`${selectedTrip.departure_date}T${selectedTrip.departure_time}`,
									).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</span>
								<p className="text-gray-500 text-sm">
									{new Date(
										`${selectedTrip.departure_date}T${selectedTrip.departure_time}`,
									).toDateString()}
								</p>
								<span>{selectedTrip.boarding_points[0]?.name}</span>
							</div>
							<div className="flex flex-col items-center">
								<span className="text-gray-500">
									{selectedTrip.duration ?? "N/A"}
								</span>
							</div>
							<div className="text-end">
								<span className="font-bold text-xl">
									{new Date(
										`${selectedTrip.arrival_date}T${selectedTrip.arrival_time}`,
									).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</span>
								<p className="text-gray-500 text-sm">
									{new Date(
										`${selectedTrip.arrival_date}T${selectedTrip.arrival_time}`,
									).toDateString()}
								</p>
								<span>
									{
										selectedTrip.dropping_points[
											selectedTrip.dropping_points.length - 1
										]?.name
									}
								</span>
							</div>
						</div>

						<SeatPlan layout={seatplan?.data.seats[0].layout} />
					</div>

					{/* Confirm Order */}
					<div className="sticky bottom-0 w-full border-gray-200 border-t bg-white p-4">
						<div className="mb-2 flex justify-between">
							<span className="font-medium text-green-600">
								0 ticket(s) selected
							</span>
							<span className="font-bold text-green-600">৳0</span>
						</div>
						<Button className="w-full bg-green-500">Confirm Order</Button>
					</div>
				</SheetContent>
			)}
		</Sheet>
	);
}

export default TicketPage;
