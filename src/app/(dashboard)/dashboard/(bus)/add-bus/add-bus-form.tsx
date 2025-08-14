"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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

// Zod Schema
const formSchema = z.object({
	name: z.string().min(1, "Bus name is required"),
	seatCount: z.number().int().positive().optional(),
});

export function AddBusForm() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			seatCount: 40, // default seat count, but field is disabled
		},
	});

	const [loading, setLoading] = useState(false);

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		setLoading(true);

		// Just for now: hardcoded ownerId
		const payload = {
			ownerId: 1,
			...data,
		};
		try {
			await fetch("/api/bus", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
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
