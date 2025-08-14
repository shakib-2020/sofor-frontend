"use client";

import { ChevronsUpDown, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

type City = { id: number; name: string };

type RouteStop = { id: number; name: string; serial: number };
type RouteFare = { from: string; to: string; amount: number };

interface RouteRow {
	id: number;
	name: string;
	stops: RouteStop[];
	fares: RouteFare[];
}

export default function ManageRoute() {
	const [routes, setRoutes] = useState<RouteRow[]>([]);
	const [cities, setCities] = useState<City[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	// Editing state
	const [selectedRoute, setSelectedRoute] = useState<RouteRow | null>(null);
	const [editStops, setEditStops] = useState<number[]>([]);
	const [editFares, setEditFares] = useState<Record<string, string>>({});
	const [cityPickerOpen, setCityPickerOpen] = useState(false);
	const [cityPickerInput, setCityPickerInput] = useState("");

	const router = useRouter();

	// Load data
	useEffect(() => {
		Promise.all([
			fetch("/api/route").then((r) => r.json()),
			fetch("/api/city").then((r) => r.json()),
		])
			.then(([routeData, cityData]) => {
				setRoutes(routeData);
				console.log("routedata", routeData);
				setCities(cityData);
			})
			.catch((err) => console.error("Error loading routes/cities:", err));
	}, []);

	// Helpers
	const getCityName = (id: number) =>
		cities.find((c) => c.id === id)?.name ?? "";

	const currentPageItems = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return routes.slice(start, start + itemsPerPage);
	}, [routes, currentPage]);

	const totalPages = Math.ceil(routes.length / itemsPerPage);

	const handleDelete = async (id: number) => {
		await fetch(`/api/route/${id}`, {
			method: "DELETE",
		});
		setRoutes((prev) => prev.filter((r) => r.id !== id));
		// adjust page if needed
		const after = routes.length - 1;
		const newTotalPages = Math.max(1, Math.ceil(after / itemsPerPage));
		if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
	};

	// Open Update dialog with prefilled data
	const openUpdate = (routeRow: RouteRow) => {
		setSelectedRoute(routeRow);

		// Sort stops & store ids
		const ids = routeRow.stops
			.sort((a, b) => a.serial - b.serial)
			.map((s) => s.id);
		setEditStops(ids);

		// Build fare record by matching stop IDs instead of names
		const faresRec: Record<string, string> = {};
		for (let i = 0; i < ids.length; i++) {
			for (let j = i + 1; j < ids.length; j++) {
				const fromId = ids[i];
				const toId = ids[j];

				// Find existing fare using stop IDs
				const existing = routeRow.fares.find(
					(f) =>
						routeRow.stops.find((s) => s.id === fromId)?.name === f.from &&
						routeRow.stops.find((s) => s.id === toId)?.name === f.to,
				);

				const key = `${fromId} - ${toId}`;
				faresRec[key] = existing ? String(existing.amount ?? "") : "";
			}
		}
		setEditFares(faresRec);

		setCityPickerInput("");
		setIsDialogOpen(true);
	};

	// City add/remove
	const addCityToRoute = (cityName: string) => {
		const city = cities.find((c) => c.name === cityName);
		if (!city) return;
		if (!editStops.includes(city.id)) {
			setEditStops((prev) => [...prev, city.id]);
		}
		setCityPickerInput("");
		setCityPickerOpen(false);
	};
	const removeCityFromRoute = (id: number) => {
		setEditStops((prev) => prev.filter((x) => x !== id));
		// also remove related fares
		setEditFares((prev) => {
			const next = { ...prev };
			Object.keys(next).forEach((k) => {
				const [a, b] = k.split(" - ").map(Number);
				if (a === id || b === id) delete next[k];
			});
			return next;
		});
	};

	// Fare grid keys based on current editStops
	const fareKeys = useMemo(() => {
		const keys: string[] = [];
		for (let i = 0; i < editStops.length; i++) {
			for (let j = i + 1; j < editStops.length; j++) {
				keys.push(`${editStops[i]} - ${editStops[j]}`);
			}
		}
		return keys;
	}, [editStops]);

	// Save (PUT)
	const handleUpdate = async () => {
		if (!selectedRoute) return;
		if (editStops.length < 2) return; // backend requires at least two

		setLoading(true);

		const routePayload = editStops
			.map((id) => {
				const city = cities.find((c) => c.id === id);
				return city ? { id: city.id, name: city.name } : null;
			})
			.filter(Boolean) as { id: number; name: string }[];

		const faresPayload: Record<string, number> = {};
		fareKeys.forEach((key) => {
			const raw = editFares[key];
			const num = raw ? Number(raw) : 0;
			faresPayload[key] = Number.isFinite(num) ? num : 0;
		});

		await fetch(`/api/route/${selectedRoute.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ route: routePayload, fares: faresPayload }),
		});

		// Update local list (to avoid full refetch)
		const newName = routePayload.map((c) => c.name).join(" to ");
		const newStops: RouteStop[] = routePayload.map((c, idx) => ({
			id: c.id,
			name: c.name,
			serial: idx + 1,
		}));
		const newFares: RouteFare[] = fareKeys.map((key) => {
			const [fromId, toId] = key.split(" - ").map(Number);
			return {
				from: getCityName(fromId),
				to: getCityName(toId),
				amount: Number(editFares[key] ?? 0),
			};
		});

		setRoutes((prev) =>
			prev.map((r) =>
				r.id === selectedRoute.id
					? { ...r, name: newName, stops: newStops, fares: newFares }
					: r,
			),
		);

		setLoading(false);
		setIsDialogOpen(false);
	};

	return (
		<div className="p-6">
			<div className="mb-4 flex justify-between">
				<h1 className="text-2xl font-bold">Manage Routes</h1>
				<Button onClick={() => router.push("/dashboard/add-route")}>
					Add Route
				</Button>
			</div>

			<table className="w-full rounded-lg border border-gray-300">
				<thead>
					<tr className="bg-gray-100">
						<th className="border p-2">ID</th>
						<th className="border p-2">Name</th>
						<th className="border p-2">Stops</th>
						<th className="border p-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{currentPageItems.map((route) => (
						<tr key={route.id}>
							<td className="border p-2">{route.id}</td>
							<td className="border p-2">{route.name}</td>
							<td className="border p-2">
								<div className="flex flex-wrap items-center gap-1">
									{route.stops
										.sort((a, b) => a.serial - b.serial)
										.map((s, idx, arr) => (
											<span
												className="flex items-center"
												key={`${route.id}-${s.id}`}
											>
												<span className="rounded border px-2 py-0.5">
													{s.name}
												</span>
												{idx < arr.length - 1 && (
													<span className="px-1">→</span>
												)}
											</span>
										))}
								</div>
							</td>
							<td className="flex justify-center gap-2 border p-2">
								<Button variant="outline" onClick={() => openUpdate(route)}>
									Update
								</Button>
								<Button
									variant="destructive"
									onClick={() => handleDelete(route.id)}
								>
									Delete
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{/* Pagination */}
			<div className="mt-4 flex justify-center gap-2">
				<Button
					variant="ghost"
					disabled={currentPage === 1}
					onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
				>
					Prev
				</Button>
				{Array.from({ length: totalPages }, (_, i) => (
					<Button
						key={`page-${i + 1}`}
						variant={currentPage === i + 1 ? "default" : "outline"}
						onClick={() => setCurrentPage(i + 1)}
					>
						{i + 1}
					</Button>
				))}
				<Button
					variant="ghost"
					disabled={currentPage === totalPages || totalPages === 0}
					onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
				>
					Next
				</Button>
			</div>

			{/* Update Route Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-3xl">
					<DialogHeader>
						<DialogTitle>Update Route</DialogTitle>
					</DialogHeader>

					{/* Add City to Route */}
					<div className="mb-4 flex gap-3">
						<Popover open={cityPickerOpen} onOpenChange={setCityPickerOpen}>
							<PopoverTrigger asChild>
								<Button variant="outline" className="w-[240px] justify-between">
									{cityPickerInput || "Search City"}
									<ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[240px] p-0">
								<Command>
									<CommandInput
										placeholder="Search city..."
										value={cityPickerInput}
										onValueChange={setCityPickerInput}
									/>
									<CommandEmpty>No city found.</CommandEmpty>
									<CommandGroup>
										{cities.map((c) => (
											<CommandItem
												key={c.id}
												value={c.name}
												disabled={editStops.includes(c.id)}
												onSelect={(val) => setCityPickerInput(val)}
											>
												{c.name}
											</CommandItem>
										))}
									</CommandGroup>
								</Command>
							</PopoverContent>
						</Popover>

						<Button
							type="button"
							onClick={() => addCityToRoute(cityPickerInput)}
						>
							+ Add to route
						</Button>
					</div>

					{/* Route chips */}
					<div className="mb-6">
						<Label className="mb-2 block">Route:</Label>
						<div className="flex flex-wrap gap-2 rounded border border-dotted p-2">
							{editStops.map((id, idx) => (
								<div className="flex items-center" key={id}>
									<span className="flex items-center gap-2 rounded border bg-gray-100 px-2 py-1">
										<span>{getCityName(id)}</span>
										<button
											type="button"
											className="hover:text-red-600"
											onClick={() => removeCityFromRoute(id)}
										>
											<X className="h-4 w-4" />
										</button>
									</span>
									{idx < editStops.length - 1 && (
										<span className="ml-1 text-xl">→</span>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Fare grid */}
					<div>
						<Label className="mb-2 block">Price / fare:</Label>
						<div className="grid gap-4">
							{editStops.map((fromId, i) =>
								editStops.slice(i + 1).map((toId) => {
									const key = `${fromId} - ${toId}`;
									const fromName = getCityName(fromId);
									const toName = getCityName(toId);
									return (
										<div
											className="grid grid-cols-2 items-center gap-4"
											key={key}
										>
											<Label htmlFor={key}>
												{fromName} - {toName}
											</Label>
											<Input
												id={key}
												type="number"
												placeholder="Enter fare"
												value={editFares[key] ?? ""}
												onChange={(e) =>
													setEditFares((prev) => ({
														...prev,
														[key]: e.target.value,
													}))
												}
											/>
										</div>
									);
								}),
							)}
							{editStops.length < 2 && (
								<p className="text-sm text-muted-foreground">
									Add at least two cities to define fares.
								</p>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button
							onClick={handleUpdate}
							disabled={loading || editStops.length < 2}
						>
							{loading ? "Updating..." : "Save"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
