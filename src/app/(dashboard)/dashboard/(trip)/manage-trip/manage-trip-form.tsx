"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
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
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ROLES } from "@/lib/permissions";

interface Counter {
	id: number;
	name: string;
	locationNote?: string;
	cityId: number;
}

interface Route {
	id: number;
	name: string;
	operatorId?: number;
}

interface Bus {
	id: number;
	name: string;
	ownerId?: number;
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
	const { user } = useAuth();
	const isOperatorOrAdmin = user?.role === ROLES.SUPER_ADMIN || 
		user?.role === "admin" || 
		[ROLES.OPERATOR_ADMIN, ROLES.OPERATOR_MANAGER, ROLES.OPERATOR_STAFF].includes(user?.role as any);

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
			apiClient.get("/api/trip").then((res) => res.data),
			apiClient.get("/api/counter").then((res) => res.data),
			apiClient.get("/api/route").then((res) => res.data),
			apiClient.get("/api/bus").then((res) => res.data),
		])
			.then(([tripData, counterData, routeData, busData]) => {
				setTrips(tripData);
				setCounters(counterData);
				setRoutes(routeData);
				setBuses(busData);
			})
			.catch((err) => console.error("Error fetching data:", err));
	}, []);

	const [editRouteStops, setEditRouteStops] = useState<{ id: number; name: string }[]>([]);

	// Compute filtered routes based on selected trip's bus's operator
	const filteredRoutesForEdit = useMemo(() => {
		if (!selectedTrip?.busId) return routes;
		const selectedBus = buses.find((b) => b.id === selectedTrip.busId);
		if (!selectedBus) return routes;
		const operatorId = (selectedBus as any).ownerId;
		if (!operatorId) return routes;
		return routes.filter((r) => (r as any).operatorId === operatorId);
	}, [selectedTrip?.busId, buses, routes]);

	// Fetch route stops whenever the selected trip's route changes
	useEffect(() => {
		if (selectedTrip?.routeId) {
			apiClient.get(`/api/route/${selectedTrip.routeId}`)
				.then((res) => {
					const mappedStops = res.data.stops.map((stop: any) => ({
						id: stop.routeStopId,
						name: stop.name,
					}));
					setEditRouteStops(mappedStops);
				})
				.catch((err) => {
					console.error("Error fetching route stops for edit:", err);
					setEditRouteStops([]);
				});
		} else {
			setEditRouteStops([]);
		}
	}, [selectedTrip?.routeId]);

	const editMatchedCounters = useMemo(() => {
		if (!selectedTrip?.busId || !selectedTrip?.routeId) return [];
		const selectedBus = buses.find((b) => b.id === selectedTrip.busId);
		if (!selectedBus) return [];
		const operatorId = (selectedBus as any).ownerId;
		if (!operatorId) return [];

		const routeCityIds = editRouteStops.map((stop) => stop.id);

		return counters.filter((c: any) => {
			const matchesOperator = String(c.operatorId) === String(operatorId);
			const matchesCity = routeCityIds.includes(c.cityId);
			return matchesOperator && matchesCity;
		});
	}, [selectedTrip?.busId, selectedTrip?.routeId, buses, editRouteStops, counters]);

	const handleDelete = async (id: number) => {
		await apiClient.delete(`/api/trip/${id}`);
		setTrips((prev) => prev.filter((t) => t.id !== id));
	};

	const handleUpdate = async () => {
		if (!selectedTrip) return;

		const payload = {
			tripNumber: selectedTrip.tripNumber,
			heading: selectedTrip.heading,
			busId: selectedTrip.busId,
			routeId: selectedTrip.routeId,
			departureDateTime: selectedTrip.departureDateTime,
			arrivalDateTime: selectedTrip.arrivalDateTime,
			boardingPoints: selectedTrip.boarding_points.map((bp) => bp.id),
			droppingPoints: selectedTrip.dropping_points.map((dp) => dp.id),
		};

		setLoading(true);
		await apiClient.put(`/api/trip/${selectedTrip.id}`, payload);

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
				{isOperatorOrAdmin && (
					<Button onClick={() => router.push("/dashboard/add-trip")}>
						Add Trip
					</Button>
				)}
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
						{isOperatorOrAdmin && <th className="border p-2">Actions</th>}
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
							{isOperatorOrAdmin && (
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
							)}
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
								onValueChange={(val) => {
									const newBusId = Number(val);
									setSelectedTrip((prev) => {
										if (!prev) return null;
										const selectedBus = buses.find((b) => b.id === newBusId);
										const busOperatorId = selectedBus ? (selectedBus as any).ownerId : null;
										
										const currentRoute = routes.find((r) => r.id === prev.routeId);
										const isRouteValid = currentRoute && (currentRoute as any).operatorId === busOperatorId;
										
										return {
											...prev,
											busId: newBusId,
											routeId: isRouteValid ? prev.routeId : 0,
											heading: isRouteValid ? prev.heading : "",
											boarding_points: isRouteValid ? prev.boarding_points : [],
											dropping_points: isRouteValid ? prev.dropping_points : [],
										};
									});
								}}
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
								value={selectedTrip?.routeId && selectedTrip.routeId !== 0 ? selectedTrip.routeId.toString() : ""}
								onValueChange={(val) => {
									const newRouteId = Number(val);
									setSelectedTrip((prev) => {
										if (!prev) return null;
										const routeObj = routes.find((r) => r.id === newRouteId);
										return {
											...prev,
											routeId: newRouteId,
											heading: routeObj ? routeObj.name : prev.heading,
											boarding_points: [],
											dropping_points: [],
										};
									});
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a route" />
								</SelectTrigger>
								<SelectContent>
									{filteredRoutesForEdit.map((route) => (
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
								value={selectedTrip?.departureDateTime ? selectedTrip.departureDateTime.substring(0, 16) : ""}
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
								value={selectedTrip?.arrivalDateTime ? selectedTrip.arrivalDateTime.substring(0, 16) : ""}
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
								options={editMatchedCounters.map((counter) => {
									const stop = editRouteStops.find((s) => s.id === counter.cityId);
									const cityName = stop ? stop.name : "";
									return {
										value: counter.id,
										label: cityName ? `${counter.name} (${cityName})` : counter.name,
									};
								})}
								value={
									selectedTrip?.boarding_points.map((b) => {
										const stop = editRouteStops.find((s) => s.id === b.cityId);
										const cityName = stop ? stop.name : "";
										return {
											value: b.id,
											label: cityName ? `${b.name} (${cityName})` : b.name,
										};
									}) || []
								}
								onChange={(selected) =>
									setSelectedTrip((prev) =>
										prev
											? {
													...prev,
													boarding_points: (
														selected as { value: number; label: string }[]
													)
														.map((s) => counters.find((c) => c.id === s.value))
														.filter((c): c is Counter => !!c),
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
								options={editMatchedCounters.map((counter) => {
									const stop = editRouteStops.find((s) => s.id === counter.cityId);
									const cityName = stop ? stop.name : "";
									return {
										value: counter.id,
										label: cityName ? `${counter.name} (${cityName})` : counter.name,
									};
								})}
								value={
									selectedTrip?.dropping_points.map((d) => {
										const stop = editRouteStops.find((s) => s.id === d.cityId);
										const cityName = stop ? stop.name : "";
										return {
											value: d.id,
											label: cityName ? `${d.name} (${cityName})` : d.name,
										};
									}) || []
								}
								onChange={(selected) =>
									setSelectedTrip((prev) =>
										prev
											? {
													...prev,
													dropping_points: (
														selected as { value: number; label: string }[]
													)
														.map((s) => counters.find((c) => c.id === s.value))
														.filter((c): c is Counter => !!c),
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
