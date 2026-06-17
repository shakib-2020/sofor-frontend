/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
// import Select from "react-select";
import { number, z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";

const formSchema = z.object({
	tripNumber: z.string().min(1, "Trip number is required"),
	heading: z.string().min(1, "Heading is required"),
	busId: z.string().min(1, "Bus selection is required"),
	routeId: z.string().min(1, "Route selection is required"),
	departureDate: z.date(),
	departureTime: z.string(),
	arrivalDate: z.date(),
	arrivalTime: z.string(),
	boardingPoints: z.array(z.object({ name: z.string(), id: z.number().int() })),
	droppingPoints: z.array(z.object({ name: z.string(), id: z.number().int() })),
});

type FormValues = z.infer<typeof formSchema>;

interface nameIdTypes {
	id: number;
	name: string;
}

interface Counter {
	id: number;
	name: string;
	cityId: number;
	operatorId?: number;
}

export function AddTripForm() {
	const [buses, setBuses] = useState<nameIdTypes[]>([]);
	const [routes, setRoutes] = useState<nameIdTypes[]>([]);
	const [counters, setCounters] = useState<Counter[]>([]);
	const [openDeparture, setOpenDeparture] = useState(false);
	const [openArrival, setOpenArrival] = useState(false);
	const [loading, setLoading] = useState(false);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			tripNumber: "",
			heading: "",
			busId: undefined,
			routeId: undefined,
			departureDate: undefined,
			departureTime: "00:00",
			arrivalDate: undefined,
			arrivalTime: "00:00",
			boardingPoints: [],
			droppingPoints: [],
		},
	});

	const selectedRouteId = form.watch("routeId");
	const selectedBusId = form.watch("busId");
	const [routeStopsList, setRouteStopsList] = useState<nameIdTypes[]>([]);

	// Compute filtered routes based on selected bus's operator
	const filteredRoutes = React.useMemo(() => {
		if (!selectedBusId) return routes;
		const selectedBus = buses.find((b) => String(b.id) === String(selectedBusId));
		if (!selectedBus) return routes;
		const operatorId = (selectedBus as any).ownerId;
		if (!operatorId) return routes;
		return routes.filter((r) => (r as any).operatorId === operatorId);
	}, [selectedBusId, buses, routes]);

	// Auto-reset selected route if selected bus's operator doesn't match
	useEffect(() => {
		if (selectedBusId && selectedRouteId) {
			const selectedBus = buses.find((b) => String(b.id) === String(selectedBusId));
			if (selectedBus) {
				const busOperatorId = (selectedBus as any).ownerId;
				const selectedRoute = routes.find((r) => String(r.id) === String(selectedRouteId));
				if (selectedRoute && (selectedRoute as any).operatorId !== busOperatorId) {
					form.setValue("routeId", "");
					form.setValue("heading", "");
				}
			}
		}
	}, [selectedBusId, buses, routes, selectedRouteId, form]);

	// Auto-generate Heading when Route changes
	useEffect(() => {
		if (selectedRouteId) {
			const routeObj = routes.find((r) => String(r.id) === String(selectedRouteId));
			if (routeObj) {
				form.setValue("heading", routeObj.name);
			}
		}
	}, [selectedRouteId, routes, form]);

	// Auto-generate Trip Number when Bus changes
	useEffect(() => {
		if (selectedBusId) {
			const busObj = buses.find((b) => String(b.id) === String(selectedBusId));
			if (busObj) {
				const busNum = (busObj as any).busNumber ? `-${(busObj as any).busNumber}` : "";
				const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
				const autoTripNum = `${busObj.name}${busNum}-${randomSuffix}`.replace(/\s+/g, "-");
				form.setValue("tripNumber", autoTripNum);
			}
		}
	}, [selectedBusId, buses, form]);

	const fetchBuses = async () => {
		try {
			const res = await apiClient.get("/api/bus");
			console.log("bus", res.data);
			setBuses(res.data);
		} catch (err) {
			console.error("Error fetching cities:", err);
		}
	};
	const fetchRoutes = async () => {
		try {
			const res = await apiClient.get("/api/route");
			console.log("Route", res.data);
			setRoutes(res.data);
		} catch (err) {
			console.error("Error fetching cities:", err);
		}
	};

	const fetchCounters = async () => {
		try {
			const res = await apiClient.get("/api/counter");
			console.log("Counter", res.data);
			setCounters(res.data);
		} catch (err) {
			console.error("Error fetching cities:", err);
		}
	};

	useEffect(() => {
		fetchBuses();
		fetchRoutes();
		fetchCounters();
	}, []);

	useEffect(() => {
		const currentBoarding = form.getValues("boardingPoints");
		const currentDropping = form.getValues("droppingPoints");
		if (currentBoarding && currentBoarding.length > 0) form.setValue("boardingPoints", []);
		if (currentDropping && currentDropping.length > 0) form.setValue("droppingPoints", []);

		if (selectedRouteId) {
			const fetchRouteStops = async () => {
				try {
					const res = await apiClient.get(`/api/route/${selectedRouteId}`);
					console.log("Route stops response:", res.data);
					const mappedStops = res.data.stops.map((stop: any) => ({
						id: stop.routeStopId,
						name: stop.name,
					}));
					setRouteStopsList(mappedStops);
				} catch (err) {
					console.error("Error fetching route stops:", err);
				}
			};
			fetchRouteStops();
		} else {
			setRouteStopsList([]);
		}
	}, [selectedRouteId, selectedBusId, form]);

	const matchedCounters = React.useMemo(() => {
		if (!selectedBusId || !selectedRouteId) return [];
		const selectedBus = buses.find((b) => String(b.id) === String(selectedBusId));
		if (!selectedBus) return [];
		const operatorId = (selectedBus as any).ownerId;
		if (!operatorId) return [];

		const routeCityIds = routeStopsList.map((stop) => stop.id);

		return counters.filter((c: any) => {
			const matchesOperator = String(c.operatorId) === String(operatorId);
			const matchesCity = routeCityIds.includes(c.cityId);
			return matchesOperator && matchesCity;
		});
	}, [selectedBusId, selectedRouteId, buses, routeStopsList, counters]);

	const getCityNameForCounter = (counterCityId: number) => {
		const stop = routeStopsList.find((s) => s.id === counterCityId);
		return stop ? stop.name : "";
	};

	async function onSubmit(data: z.infer<typeof formSchema>) {
		const departureDateTime = combineDateAndTime(
			data.departureDate,
			data.departureTime,
		);
		const arrivalDateTime = combineDateAndTime(
			data.arrivalDate,
			data.arrivalTime,
		);

		const payload = {
			tripNumber: data.tripNumber,
			heading: data.heading,
			busId: data.busId,
			routeId: data.routeId,
			departureDateTime,
			arrivalDateTime,
			boardingPoints: data.boardingPoints.map((item) => item.id),
			droppingPoints: data.droppingPoints.map((item) => item.id),
		};

		console.log("Submit Payload:", payload);

		setLoading(true);

		try {
			await apiClient.post("/api/trip", payload);
			toast.success("Trip has been created.");
			// After successful creation
			form.reset({
				tripNumber: "",
				heading: "",
				busId: undefined, // reset bus
				routeId: undefined, // reset route
				departureDate: undefined,
				departureTime: "00:00",
				arrivalDate: undefined,
				arrivalTime: "00:00",
				boardingPoints: [],
				droppingPoints: [],
			});
		} catch (err) {
			toast.error("Failed to create trip");
		} finally {
			setLoading(false);
		}
	}

	function combineDateAndTime(date: Date, time: string) {
		const yyyy = date.getFullYear();
		const mm = String(date.getMonth() + 1).padStart(2, "0");
		const dd = String(date.getDate()).padStart(2, "0");
		return `${yyyy}-${mm}-${dd}T${time}:00`;
	}

	return (
		<Form {...form}>
			<form
				className="mb-4 max-w-lg space-y-6"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FormField
					control={form.control}
					name="tripNumber"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Trip Number</FormLabel>
							<FormControl>
								<Input placeholder="TRIP-001" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="heading"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Heading</FormLabel>
							<FormControl>
								<Input placeholder="Dhaka – Ashuganj – Sylhet" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{/* Bus Select */}
				<FormField
					control={form.control}
					name="busId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Bus</FormLabel>
							<Select value={field.value} onValueChange={field.onChange}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select Bus" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{buses?.map((div: any) => (
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
				{/* Route Select */}
				<FormField
					control={form.control}
					name="routeId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Route</FormLabel>
							<Select value={field.value} onValueChange={field.onChange}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select Route" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{filteredRoutes?.map((div: any) => (
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
				{/* Departure Date & Time */}
				<div className="flex gap-4">
					<FormField
						control={form.control}
						name="departureDate"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Departure Date</FormLabel>
								<FormControl>
									<Popover onOpenChange={setOpenDeparture} open={openDeparture}>
										<PopoverTrigger asChild>
											<Button
												className="w-[150px] justify-between font-normal"
												variant="outline"
											>
												{field.value
													? format(field.value, "PPP")
													: "Select date"}
												<ChevronDownIcon />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="p-0">
											<Calendar
												captionLayout="dropdown"
												disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
												mode="single"
												onSelect={(date) => {
													if (!date) return;

													const safeDate = new Date(
														date.getFullYear(),
														date.getMonth(),
														date.getDate(),
														12 // noon
													);

													field.onChange(safeDate);
													setOpenDeparture(false);
												}}
												selected={field.value}
											/>
										</PopoverContent>
									</Popover>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="departureTime"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Departure Time</FormLabel>
								<FormControl>
									<Input type="time" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				{/* Arrival Date & Time */}
				<div className="flex gap-4">
					<FormField
						control={form.control}
						name="arrivalDate"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Arrival Date</FormLabel>
								<FormControl>
									<Popover onOpenChange={setOpenArrival} open={openArrival}>
										<PopoverTrigger asChild>
											<Button
												className="w-[150px] justify-between font-normal"
												variant="outline"
											>
												{field.value
													? format(field.value, "PPP")
													: "Select date"}
												<ChevronDownIcon />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="p-0">
											<Calendar
												captionLayout="dropdown"
												disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
												mode="single"
												onSelect={(date) => {
													if (!date) return;

													const safeDate = new Date(
														date.getFullYear(),
														date.getMonth(),
														date.getDate(),
														12 // noon
													);

													field.onChange(safeDate);
													setOpenArrival(false);
												}}
												selected={field.value}
											/>
										</PopoverContent>
									</Popover>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="arrivalTime"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Arrival Time</FormLabel>
								<FormControl>
									<Input type="time" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				{/* Boarding Points */}
				<FormField
					control={form.control}
					name="boardingPoints"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Boarding Points</FormLabel>
							<div className="space-y-2">
								{selectedRouteId ? (
									matchedCounters.length > 0 ? (
										matchedCounters.map((counter) => {
											const cityName = getCityNameForCounter(counter.cityId);
											const labelText = cityName ? `${counter.name} (${cityName})` : counter.name;
											return (
												<FormItem
													className="flex flex-row items-start space-x-3 space-y-0"
													key={counter.id}
												>
													<FormControl>
														<Checkbox
															checked={field.value?.some(
																(v) => v.id === counter.id,
															)}
															onCheckedChange={(checked) => {
																const currentValue = field.value || [];
																if (checked) {
																	field.onChange([
																		...currentValue,
																		{ name: counter.name, id: counter.id },
																	]);
																} else {
																	field.onChange(
																		currentValue.filter(
																			(v) => v.id !== counter.id,
																		),
																	);
																}
															}}
														/>
													</FormControl>
													<FormLabel className="font-normal">
														{labelText}
													</FormLabel>
												</FormItem>
											);
										})
									) : (
										<p className="text-sm text-gray-500 italic">No matching counters found for this operator along this route.</p>
									)
								) : (
									<p className="text-sm text-gray-500 italic">Please select a route first.</p>
								)}
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>
				{/* Dropping Points */}
				<FormField
					control={form.control}
					name="droppingPoints"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Dropping Points</FormLabel>
							<div className="space-y-2">
								{selectedRouteId ? (
									matchedCounters.length > 0 ? (
										matchedCounters.map((counter) => {
											const cityName = getCityNameForCounter(counter.cityId);
											const labelText = cityName ? `${counter.name} (${cityName})` : counter.name;
											return (
												<FormItem
													className="flex flex-row items-start space-x-3 space-y-0"
													key={counter.id}
												>
													<FormControl>
														<Checkbox
															checked={field.value?.some(
																(v) => v.id === counter.id,
															)}
															onCheckedChange={(checked) => {
																const currentValue = field.value || [];
																if (checked) {
																	field.onChange([
																		...currentValue,
																		{ name: counter.name, id: counter.id },
																	]);
																} else {
																	field.onChange(
																		currentValue.filter(
																			(v) => v.id !== counter.id,
																		),
																	);
																}
															}}
														/>
													</FormControl>
													<FormLabel className="font-normal">
														{labelText}
													</FormLabel>
												</FormItem>
											);
										})
									) : (
										<p className="text-sm text-gray-500 italic">No matching counters found for this operator along this route.</p>
									)
								) : (
									<p className="text-sm text-gray-500 italic">Please select a route first.</p>
								)}
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" disabled={loading}>
					{loading ? "Creating..." : "Create Trip"}
				</Button>{" "}
			</form>
		</Form>
	);
}
