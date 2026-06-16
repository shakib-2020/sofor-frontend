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
import { addCounterSiteText } from "./sitetext";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const formSchema = z.object({
	name: z.string().min(1, "Counter name is required"),
	divisionId: z.string().min(1, "Division is required"),
	districtId: z.string().min(1, "District is required"),
	cityId: z.string().min(1, "City is required"),
	locationNote: z.string().optional(),
	operatorId: z.string().optional(),
});

export function AddCounterForm() {
	const { user } = useAuth();
	const isAdmin = user?.role === "superAdmin" || user?.role === "admin";
	const { form_info } = addCounterSiteText;
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			divisionId: "",
			districtId: "",
			cityId: "",
			locationNote: "",
			operatorId: "",
		},
	});

	const { watch } = form;
	const divisionId = watch("divisionId");
	const districtId = watch("districtId");

	const [loading, setLoading] = useState(false);

	const [operators, setOperators] = useState<{ id: number; name: string }[]>([]);
	const [divisions, setDivisions] = useState([]);
	const [districts, setDistricts] = useState([]);
	const [cities, setCities] = useState([]);

	// Load operators for admin and divisions once
	useEffect(() => {
		if (isAdmin) {
			apiClient.get("/api/bus-owner")
				.then((res) => res.data)
				.then(setOperators)
				.catch((err) => console.error("Error fetching operators:", err));
		}

		apiClient.get("/api/division")
			.then((res) => res.data)
			.then(setDivisions);
	}, [isAdmin]);

	// Division change handler
	const handleDivisionChange = async (value: string) => {
		form.setValue("divisionId", value);
		form.setValue("districtId", "");
		form.setValue("cityId", "");
		setDistricts([]);
		setCities([]);

		const res = await apiClient.get(
			`/api/district?divisionId=${value}`,
		);
		setDistricts(res.data);
	};

	// District change handler
	const handleDistrictChange = async (value: string) => {
		form.setValue("districtId", value);
		form.setValue("cityId", "");
		setCities([]);

		const res = await apiClient.get(
			`/api/city?districtId=${value}`,
		);
		setCities(res.data);
	};

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		if (isAdmin && !data.operatorId) {
			toast.error("Please select a bus operator company");
			return;
		}

		setLoading(true);
		
		const payload = {
			name: data.name,
			divisionId: data.divisionId,
			districtId: data.districtId,
			cityId: data.cityId,
			locationNote: data.locationNote,
			operatorId: isAdmin ? Number(data.operatorId) : undefined,
		};

		try {
			await apiClient.post("/api/counter", payload);
			toast.success("Counter has been created.");
			form.reset();
		} catch (err) {
			toast.error("Failed to create counter");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Form {...form}>
			<form
				className="mb-4 max-w-lg space-y-6"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				{/* Operator Owner dropdown for Admins */}
				{isAdmin && (
					<FormField
						control={form.control}
						name="operatorId"
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
										{operators.map((owner) => (
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

				{/* Counter Name */}
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{form_info.headings.counter_name}</FormLabel>
							<FormControl>
								<Input
									placeholder={form_info.placeholder.counter_name}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Division */}
				<FormField
					control={form.control}
					name="divisionId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{form_info.headings.division}</FormLabel>
							<Select
								defaultValue={field.value}
								onValueChange={handleDivisionChange}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder={form_info.placeholder.division} />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{divisions.map((div: any) => (
										<SelectItem key={div.id} value={String(div.id)}>
											{div.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* District */}
				<FormField
					control={form.control}
					name="districtId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{form_info.headings.district}</FormLabel>
							<Select
								disabled={!divisionId}
								onValueChange={handleDistrictChange}
								value={field.value}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder={form_info.placeholder.district} />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{districts.map((dist: any) => (
										<SelectItem key={dist.id} value={String(dist.id)}>
											{dist.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* City */}
				<FormField
					control={form.control}
					name="cityId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{form_info.headings.city}</FormLabel>
							<Select
								disabled={!districtId}
								onValueChange={field.onChange}
								value={field.value}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder={form_info.placeholder.city} />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{cities.map((city: any) => (
										<SelectItem key={city.id} value={String(city.id)}>
											{city.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Location Note */}
				<FormField
					control={form.control}
					name="locationNote"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{form_info.headings.location_note}</FormLabel>
							<FormControl>
								<Input
									placeholder={form_info.placeholder.location_note}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button disabled={loading} type="submit">
					{loading
						? form_info.button.submit.onLoading
						: form_info.button.submit.regular}
				</Button>
			</form>
		</Form>
	);
}
