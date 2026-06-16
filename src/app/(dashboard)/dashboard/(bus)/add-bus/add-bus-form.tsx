"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

// Zod Schema
const formSchema = z.object({
	name: z.string().min(1, "Bus name is required"),
	busNumber: z.string().min(1, "Bus number is required"),
	seatCount: z.number().int().positive().optional(),
	ownerId: z.string().optional(),
});

export function AddBusForm() {
	const { user } = useAuth();
	const isAdmin = user?.role === "superAdmin" || user?.role === "admin";
	const [owners, setOwners] = useState<{ id: number; name: string }[]>([]);
	const [loading, setLoading] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			busNumber: "",
			seatCount: 40, // default seat count, but field is disabled
			ownerId: "",
		},
	});

	useEffect(() => {
		if (isAdmin) {
			apiClient.get("/api/bus-owner")
				.then((res) => setOwners(res.data))
				.catch((err) => console.error("Error fetching owners:", err));
		}
	}, [isAdmin]);

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		if (isAdmin && !data.ownerId) {
			toast.error("Please select a bus operator company");
			return;
		}

		setLoading(true);

		const payload = {
			name: data.name,
			busNumber: data.busNumber,
			seatCount: data.seatCount,
			ownerId: isAdmin ? Number(data.ownerId) : undefined,
		};

		try {
			await apiClient.post("/api/bus", payload);
			toast.success("Bus has been added.");
			form.reset();
		} catch (err) {
			toast.error("Failed to add bus");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="max-w-lg space-y-6"
			>
				{/* Operator Owner dropdown for Admins */}
				{isAdmin && (
					<FormField
						control={form.control}
						name="ownerId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Operator / Bus Company</FormLabel>
								<Select value={field.value} onValueChange={field.onChange}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select Operator Company" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{owners.map((owner) => (
											<SelectItem key={owner.id} value={String(owner.id)}>
												{owner.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				{/* Bus Name */}
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Bus Name</FormLabel>
							<FormControl>
								<Input placeholder="Enter bus name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Bus Number */}
				<FormField
					control={form.control}
					name="busNumber"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Bus Number (License / Plate No)</FormLabel>
							<FormControl>
								<Input placeholder="e.g. DHAKA-METRO-1234" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Seat Count (Disabled) */}
				<FormField
					control={form.control}
					name="seatCount"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Seat Count</FormLabel>
							<FormControl>
								<Input
									type="number"
									disabled
									{...field}
									value={field.value ?? ""}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={loading}>
					{loading ? "Adding..." : "Add Bus"}
				</Button>
			</form>
		</Form>
	);
}
