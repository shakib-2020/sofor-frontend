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

interface Counter {
	id: number;
	name: string;
	locationNote?: string;
	cityId: number;
}

interface City {
	id: number;
	name: string;
}

export default function ManageCounter() {
	const [counters, setCounters] = useState<Counter[]>([]);
	const [cities, setCities] = useState<City[]>([]);
	const [selectedCounter, setSelectedCounter] = useState<Counter | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	const router = useRouter();

	useEffect(() => {
		Promise.all([
			fetch("http://localhost:5000/api/counter").then((res) => res.json()),
			fetch("http://localhost:5000/api/city").then((res) => res.json()),
		])
			.then(([counterData, cityData]) => {
				setCounters(counterData);
				setCities(cityData);
			})
			.catch((err) => console.error("Error fetching data:", err));
	}, []);

	const handleDelete = async (id: number) => {
		await fetch(`http://localhost:5000/api/counter/${id}`, {
			method: "DELETE",
		});
		setCounters((prev) => prev.filter((o) => o.id !== id));
	};

	const handleUpdate = async () => {
		if (!selectedCounter) return;

		setLoading(true);
		await fetch(`http://localhost:5000/api/counter/${selectedCounter.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(selectedCounter),
		});

		setCounters((prev) =>
			prev.map((o) => (o.id === selectedCounter.id ? selectedCounter : o)),
		);
		setLoading(false);
		setIsDialogOpen(false);
	};

	// Pagination
	const totalPages = Math.ceil(counters.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const currentItems = counters.slice(startIndex, startIndex + itemsPerPage);

	const getCityName = (id: number) => {
		const city = cities.find((c) => c.id === id);
		return city ? city.name : "Unknown";
	};

	return (
		<div className="p-6">
			<div className="mb-4 flex justify-between">
				<h1 className="font-bold text-2xl">Manage Counters</h1>
				<Button onClick={() => router.push("/dashboard/add-counter")}>
					Add Counter
				</Button>
			</div>

			<table className="w-full rounded-lg border border-gray-300">
				<thead>
					<tr className="bg-gray-100">
						<th className="border p-2">ID</th>
						<th className="border p-2">Name</th>
						<th className="border p-2">City</th>
						<th className="border p-2">Location Note</th>
						<th className="border p-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{currentItems.map((counter) => (
						<tr key={counter.id}>
							<td className="border p-2">{counter.id}</td>
							<td className="border p-2">{counter.name}</td>
							<td className="border p-2">{getCityName(counter.cityId)}</td>
							<td className="border p-2">{counter.locationNote || "-"}</td>
							<td className="flex justify-center gap-2 border p-2">
								<Button
									onClick={() => {
										setSelectedCounter(counter);
										setIsDialogOpen(true);
									}}
									variant="outline"
								>
									Update
								</Button>
								<Button
									onClick={() => handleDelete(counter.id)}
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

			{/* Update Counter Dialog */}
			<Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Update Counter</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						<div>
							<Label>Name</Label>
							<Input
								value={selectedCounter?.name || ""}
								onChange={(e) =>
									setSelectedCounter((prev) =>
										prev ? { ...prev, name: e.target.value } : null,
									)
								}
							/>
						</div>
						<div>
							<Label>City</Label>
							<Select
								value={selectedCounter?.cityId?.toString() || ""}
								onValueChange={(val) =>
									setSelectedCounter((prev) =>
										prev ? { ...prev, cityId: Number(val) } : null,
									)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a city" />
								</SelectTrigger>
								<SelectContent>
									{cities.map((city) => (
										<SelectItem key={city.id} value={city.id.toString()}>
											{city.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>Location Note</Label>
							<Input
								value={selectedCounter?.locationNote || ""}
								onChange={(e) =>
									setSelectedCounter((prev) =>
										prev ? { ...prev, locationNote: e.target.value } : null,
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
