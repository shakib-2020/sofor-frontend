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
	name: z.string().min(1, "Owner name is required"),
	email: z.string().email("Invalid email address"),
});

export function AddBusOwnerForm() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
		},
	});

	const [loading, setLoading] = useState(false);

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		setLoading(true);

		try {
			await fetch("/api/bus-owner", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			toast.success("Bus owner has been created.");
			form.reset();
		} catch (err) {
			toast.error("Failed to create bus owner");
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
				{/* Owner Name */}
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Owner Name</FormLabel>
							<FormControl>
								<Input placeholder="Enter owner's name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Email */}
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input placeholder="Enter email address" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={loading}>
					{loading ? "Creating..." : "Create Bus Owner"}
				</Button>
			</form>
		</Form>
	);
}
