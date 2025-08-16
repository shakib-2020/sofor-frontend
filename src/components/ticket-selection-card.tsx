import { BusIcon, MapPin } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

type TripCardProps = {
	trip: {
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
};

function TicketSelectionCard({ trip }: TripCardProps) {
	// Safety checks for undefined data
	if (!trip || !trip.bus_info || !trip.route_info) {
		return (
			<div className="rounded-lg bg-white p-6 shadow-md mb-4">
				<div className="text-center text-gray-500">
					<p>Trip information unavailable</p>
				</div>
			</div>
		);
	}

	const departure = new Date(`${trip.departure_date}T${trip.departure_time}`);
	const arrival = new Date(`${trip.arrival_date}T${trip.arrival_time}`);

	const fromCity = trip.boarding_points?.[0]?.name ?? "N/A";
	const toCity =
		trip.dropping_points?.[trip.dropping_points.length - 1]?.name ?? "N/A";

	return (
		<div className="rounded-lg bg-white p-6 shadow-md mb-4">
			<div className="grid grid-cols-3 gap-4">
				{/* part 1 */}
				<div className="flex flex-col items-start">
					{/* <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center text-white"></div> */}
					<h2 className="font-bold text-lg">
						<BusIcon />
						{trip.bus_info?.name ?? "Unknown Bus"}
					</h2>
					<div className="font-semibold text-gray-700 text-xs">
						<p>Seats: {trip.bus_info?.seatCount ?? 0}</p>
						<p>Route: {trip.route_info?.name ?? "Unknown Route"}</p>
					</div>
				</div>

				{/* part 2 */}
				<div className="flex items-center justify-center gap-2">
					<div className="text-center">
						<span className="font-bold text-xl">
							{departure.toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>
						<p className="text-gray-500 text-sm">{departure.toDateString()}</p>
						<span>{fromCity}</span>
					</div>
					<div className="flex flex-col items-center">
						<span className="text-gray-500">{trip.duration ?? "N/A"}</span>
						<div className="relative h-6 w-40">
							<div className="absolute top-3 w-full border border-yellow-400" />
							<div className="absolute top-1 left-0 h-4 w-4 rounded-full bg-white">
								<MapPin className="h-4 w-4 text-red-600" />
							</div>
							<div className="absolute top-1 right-0 h-4 w-4 rounded-full bg-white">
								<MapPin className="h-4 w-4 text-green-500" />
							</div>
						</div>
					</div>
					<div className="text-end">
						<span className="font-bold text-xl">
							{arrival.toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>
						<p className="text-gray-500 text-sm">{arrival.toDateString()}</p>
						<span>{toCity}</span>
					</div>
				</div>

				{/* part 3 */}
				<div className="flex flex-col items-end justify-between text-gray-500 text-sm">
					<span className="font-bold text-blue-600 text-lg">৳{trip.fare ?? 0}</span>
					<span>{trip.bus_info?.seatCount ?? 0} Seat(s) Available</span>
					<Button className="bg-green-500 hover:bg-green-600">
						BOOK TICKET
					</Button>
				</div>
			</div>

			{/* boarding & dropping points */}
			<div className="flex flex-wrap gap-2 mt-4 text-xs text-gray-600">
				<div>
					<span className="font-semibold">Boarding Points: </span>
					{trip.boarding_points?.map((b) => b?.name).filter(Boolean).join(", ") || "N/A"}
				</div>
				<div>
					<span className="font-semibold">Dropping Points: </span>
					{trip.dropping_points?.map((d) => d?.name).filter(Boolean).join(", ") || "N/A"}
				</div>
			</div>
		</div>
	);
}

export default TicketSelectionCard;
