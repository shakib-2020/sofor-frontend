"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReactSelect from "react-select";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface Counter {
	id: number;
	name: string;
	locationNote?: string;
	cityId: number;
}

interface Route {
	id: number;
	name: string;
}

interface Bus {
	id: number;
	name: string;
}

interface Trip {
	id: number;
	tripNumber: string;
	heading: string;
	busId: number;
	routeId: number;
	departureDateTime: string;
	arrivalDateTime: string;
	boarding_points: Counter[];
	dropping_points: Counter[];
}

export default function ManageTrip() {
	const [trips, setTrips] = useState<Trip[]>([]);
	const [counters, setCounters] = useState<Counter[]>([]);
	const [routes, setRoutes] = useState<Route[]>([]);
	const [buses, setBuses] = useState<Bus[]>([]);
	const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	const router = useRouter();

	useEffect(() => {
		Promise.all([
			fetch("http://localhost:5000/api/trip").then((res) => res.json()),
			fetch("http://localhost:5000/api/counter").then((res) => res.json()),
			fetch("http://localhost:5000/api/route").then((res) => res.json()),
			fetch("http://localhost:5000/api/bus").then((res) => res.json()),
		])
			.then(([tripData, counterData, routeData, busData]) => {
				setTrips(tripData);
				setCounters(counterData);
				setRoutes(routeData);
				setBuses(busData);
			})
			.catch((err) => console.error("Error fetching data:", err));
	}, []);

	const handleDelete = async (id: number) => {
		await fetch(`http://localhost:5000/api/trip/${id}`, { method: "DELETE" });
		setTrips((prev) => prev.filter((t) => t.id !== id));
	};

	const handleUpdate = async () => {
		if (!selectedTrip) return;

		setLoading(true);
		await fetch(`http://localhost:5000/api/trip/${selectedTrip.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(selectedTrip),
		});

		setTrips((prev) =>
			prev.map((t) => (t.id === selectedTrip.id ? selectedTrip : t)),
		);
		setLoading(false);
		setIsDialogOpen(false);
	};

	// Pagination
	const totalPages = Math.ceil(trips.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const currentItems = trips.slice(startIndex, startIndex + itemsPerPage);

	return (
		<div className="p-6">
			<div className="mb-4 flex justify-between">
				<h1 className="font-bold text-2xl">Manage Trips</h1>
				<Button onClick={() => router.push("/dashboard/add-trip")}>
					Add Trip
				</Button>
			</div>

			<table className="w-full rounded-lg border border-gray-300">
				<thead>
					<tr className="bg-gray-100">
						<th className="border p-2">ID</th>
						<th className="border p-2">Trip Number</th>
						<th className="border p-2">Heading</th>
						<th className="border p-2">Bus</th>
						<th className="border p-2">Route</th>
						<th className="border p-2">Departure</th>
						<th className="border p-2">Arrival</th>
						<th className="border p-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{currentItems.map((trip) => (
						<tr key={trip.id}>
							<td className="border p-2">{trip.id}</td>
							<td className="border p-2">{trip.tripNumber}</td>
							<td className="border p-2">{trip.heading}</td>
							<td className="border p-2">
								{buses.find((b) => b.id === trip.busId)?.name || "Unknown"}
							</td>
							<td className="border p-2">
								{routes.find((r) => r.id === trip.routeId)?.name || "Unknown"}
							</td>
							<td className="border p-2">{trip.departureDateTime}</td>
							<td className="border p-2">{trip.arrivalDateTime}</td>
							<td className="flex justify-center gap-2 border p-2">
								<Button
									onClick={() => {
										setSelectedTrip(trip);
										setIsDialogOpen(true);
									}}
									variant="outline"
								>
									Update
								</Button>
								<Button
									onClick={() => handleDelete(trip.id)}
									variant="destructive"
								>
									Delete
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{/* Pagination Controls */}
			<div className="mt-4 flex justify-center gap-2">
				<Button
					disabled={currentPage === 1}
					onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
					variant="ghost"
				>
					Prev
				</Button>
				{Array.from({ length: totalPages }, (_, i) => (
					<Button
						key={`page-${i + 1}`}
						onClick={() => setCurrentPage(i + 1)}
						variant={currentPage === i + 1 ? "default" : "outline"}
					>
						{i + 1}
					</Button>
				))}
				<Button
					disabled={currentPage === totalPages}
					onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
					variant="ghost"
				>
					Next
				</Button>
			</div>

			{/* Update Trip Dialog */}
			<Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Update Trip</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						<div>
							<Label>Trip Number</Label>
							<Input
								value={selectedTrip?.tripNumber || ""}
								onChange={(e) =>
									setSelectedTrip((prev) =>
										prev ? { ...prev, tripNumber: e.target.value } : null,
									)
								}
							/>
						</div>
						<div>
							<Label>Heading</Label>
							<Input
								value={selectedTrip?.heading || ""}
								onChange={(e) =>
									setSelectedTrip((prev) =>
										prev ? { ...prev, heading: e.target.value } : null,
									)
								}
							/>
						</div>
						<div>
							<Label>Bus</Label>
							<Select
								value={selectedTrip?.busId?.toString() || ""}
								onValueChange={(val) =>
									setSelectedTrip((prev) =>
										prev ? { ...prev, busId: Number(val) } : null,
									)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a bus" />
								</SelectTrigger>
								<SelectContent>
									{buses.map((bus) => (
										<SelectItem key={bus.id} value={bus.id.toString()}>
											{bus.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>Route</Label>
							<Select
								value={selectedTrip?.routeId?.toString() || ""}
								onValueChange={(val) =>
									setSelectedTrip((prev) =>
										prev ? { ...prev, routeId: Number(val) } : null,
									)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a route" />
								</SelectTrigger>
								<SelectContent>
									{routes.map((route) => (
										<SelectItem key={route.id} value={route.id.toString()}>
											{route.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>Departure DateTime</Label>
							<Input
								type="datetime-local"
								value={selectedTrip?.departureDateTime || ""}
								onChange={(e) =>
									setSelectedTrip((prev) =>
										prev
											? { ...prev, departureDateTime: e.target.value }
											: null,
									)
								}
							/>
						</div>
						<div>
							<Label>Arrival DateTime</Label>
							<Input
								type="datetime-local"
								value={selectedTrip?.arrivalDateTime || ""}
								onChange={(e) =>
									setSelectedTrip((prev) =>
										prev ? { ...prev, arrivalDateTime: e.target.value } : null,
									)
								}
							/>
						</div>
						<div>
							<Label>Boarding Points</Label>
							<ReactSelect
								isMulti
								options={counters.map((counter) => ({
									value: counter.id,
									label: counter.name,
								}))}
								value={
									selectedTrip?.boarding_points.map((b) => ({
										value: b.id,
										label: b.name,
									})) || []
								}
								onChange={(selected) =>
									setSelectedTrip((prev) =>
										prev
											? {
													...prev,
													boarding_points: (
														selected as { value: number; label: string }[]
													).map((s) => counters.find((c) => c.id === s.value)!),
												}
											: null,
									)
								}
								placeholder="Select boarding points..."
							/>
						</div>

						<div>
							<Label>Dropping Points</Label>
							<ReactSelect
								isMulti
								options={counters.map((counter) => ({
									value: counter.id,
									label: counter.name,
								}))}
								value={
									selectedTrip?.dropping_points.map((d) => ({
										value: d.id,
										label: d.name,
									})) || []
								}
								onChange={(selected) =>
									setSelectedTrip((prev) =>
										prev
											? {
													...prev,
													dropping_points: (
														selected as { value: number; label: string }[]
													).map((s) => counters.find((c) => c.id === s.value)!),
												}
											: null,
									)
								}
								placeholder="Select dropping points..."
							/>
						</div>
					</div>

					<DialogFooter>
						<Button onClick={handleUpdate}>
							{loading ? "Updating..." : "Save"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
