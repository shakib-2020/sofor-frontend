"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

interface Bus {
	id: number;
	name: string;
	busNumber?: string;
	ownerId: number;
	ownerName?: string;
	seatCount: number;
}

interface BusOwner {
	id: number;
	name: string;
}

export default function ManageBus() {
	const { user } = useAuth();
	const isAdmin = user?.role === "superAdmin" || user?.role === "admin";
	const [buses, setBuses] = useState<Bus[]>([]);
	const [owners, setOwners] = useState<BusOwner[]>([]);
	const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	const router = useRouter();

	// Load buses and owners
	useEffect(() => {
		apiClient.get("/api/bus")
			.then((res) => res.data)
			.then((data) => setBuses(data))
			.catch((err) => console.error("Error fetching buses:", err));

		if (isAdmin) {
			apiClient.get("/api/bus-owner")
				.then((res) => res.data)
				.then((data) => setOwners(data))
				.catch((err) => console.error("Error fetching owners:", err));
		}
	}, [isAdmin]);

	const handleDelete = async (id: number) => {
		if (!confirm("Are you sure you want to delete this bus?")) return;
		await apiClient.delete(`/api/bus/${id}`);
		setBuses((prev) => prev.filter((b) => b.id !== id));
	};

	const handleUpdate = async () => {
		if (!selectedBus) return;
		setLoading(true);

		await apiClient.put(`/api/bus/${selectedBus.id}`, selectedBus);

		setBuses((prev) =>
			prev.map((b) => (b.id === selectedBus.id ? selectedBus : b)),
		);

		setLoading(false);
		setIsDialogOpen(false);
	};

	// Pagination logic
	const totalPages = Math.ceil(buses.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const currentItems = buses.slice(startIndex, startIndex + itemsPerPage);

	const getOwnerName = (bus: Bus) =>
		(bus.ownerName || owners.find((o) => o.id === bus.ownerId)?.name) ?? "Unknown";

	return (
		<div className="p-6">
			<div className="mb-4 flex justify-between">
				<h1 className="font-bold text-2xl">Manage Buses</h1>
				<Button onClick={() => router.push("/dashboard/add-bus")}>
					Add Bus
				</Button>
			</div>

			<table className="w-full rounded-lg border border-gray-300">
				<thead>
					<tr className="bg-gray-100">
						<th className="border p-2">ID</th>
						<th className="border p-2">Name</th>
						<th className="border p-2">Bus Number</th>
						<th className="border p-2">Owner</th>
						<th className="border p-2">Seats</th>
						<th className="border p-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{currentItems.map((bus) => (
						<tr key={bus.id}>
							<td className="border p-2">{bus.id}</td>
							<td className="border p-2">{bus.name}</td>
							<td className="border p-2">{bus.busNumber || "N/A"}</td>
							<td className="border p-2">{getOwnerName(bus)}</td>
							<td className="border p-2">{bus.seatCount}</td>
							<td className="flex justify-center gap-2 border p-2">
								<Button
									onClick={() => {
										setSelectedBus({ ...bus });
										setIsDialogOpen(true);
									}}
									variant="outline"
								>
									Update
								</Button>
								<Button
									onClick={() => handleDelete(bus.id)}
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

			{/* Update Bus Dialog */}
			<Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Update Bus</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						<div>
							<Label>Bus Name</Label>
							<Input
								value={selectedBus?.name || ""}
								onChange={(e) =>
									setSelectedBus((prev) =>
										prev ? { ...prev, name: e.target.value } : null,
									)
								}
							/>
						</div>
						<div>
							<Label>Bus Number (License / Plate No)</Label>
							<Input
								value={selectedBus?.busNumber || ""}
								onChange={(e) =>
									setSelectedBus((prev) =>
										prev ? { ...prev, busNumber: e.target.value } : null,
									)
								}
							/>
						</div>
						{isAdmin && (
							<div>
								<Label>Owner / Operator Company</Label>
								<Select
									value={
										selectedBus?.ownerId !== undefined
											? String(selectedBus.ownerId)
											: ""
									}
									onValueChange={(val) =>
										setSelectedBus((prev) =>
											prev ? { ...prev, ownerId: Number(val) } : null,
										)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select owner" />
									</SelectTrigger>
									<SelectContent>
										{owners.map((owner) => (
											<SelectItem key={owner.id} value={owner.id.toString()}>
												{owner.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
						<div>
							<Label>Seat Count</Label>
							<Input
								type="number"
								disabled
								value={selectedBus?.seatCount || 0}
								onChange={(e) =>
									setSelectedBus((prev) =>
										prev
											? { ...prev, seatCount: Number(e.target.value) }
											: null,
									)
								}
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
