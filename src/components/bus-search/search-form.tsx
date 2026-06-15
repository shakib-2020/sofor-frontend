"use client";

import { ArrowLeftRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { DatePicker } from "@/components/bus-search/date-picker";
import { Button } from "@/components/ui/button";
import { Card, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { _error } from "@/lib/logs";
import { apiClient } from "@/lib/api";
import { CityPicker } from "./city-picker";

type City = {
	id: number;
	name: string;
	districtId: number;
};

const formateDate = (date: Date) => {
	return date.toISOString().split("T")[0];
};

export default function SearchForm() {
	const [to, setTo] = useState<City>({
		id: 5,
		name: "Sreemangal",
		districtId: 6,
	});
	const [from, setFrom] = useState<City>({
		id: 1,
		name: "Uttara",
		districtId: 1,
	});
	const [jDate, setJDate] = useState<string>(formateDate(new Date("2026-02-09"))); // YYYY-MM-DD
	const [rDate, setRDate] = useState<string>("2026-02-10"); // YYYY-MM-DD
	const [cities, setCities] = useState<City[]>([]);
	const router = useRouter();

	// useEffect(() => {
	// 	const socket = new WebSocket('ws://localhost:5000/ws');


	// 	socket.onopen = () => console.log('Connected to Hono!');
	// 	socket.onmessage = (event) => console.log('From server:', event.data);

	// 	return () => socket.close();
	// }, []);

	const fetchCities = useCallback(async () => {
		try {
			const res = await apiClient.get("/api/city");
			setCities(res.data);
		} catch (err) {
			_error("Error fetching cities:", err);
		}
	}, []);

	useEffect(() => {
		fetchCities();
	}, [fetchCities]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const params = new URLSearchParams({
			from: String(from.id),
			to: String(to.id),
			...(jDate && { jDate }),
			...(rDate && { rDate }),
		});

		// Option 1: Navigate with query params so /ticket can fetch
		router.push(`/ticket?${params.toString()}`);

		// Option 2: If you want to fetch trips here and send data via state:
		/*
		const res = await fetch(`/api/trip/search?${params.toString()}`);
		const trips = await res.json();
		router.push(`/ticket?${params.toString()}`, { state: { trips } });
		*/
	};

	return (
		<Card className="h-fit max-w-[1024px]">
			<CardDescription>
				<form onSubmit={handleSubmit}>
					<div className="flex flex-col items-center gap-4 px-6 py-3">
						<div className="grid items-center gap-4 lg:grid-cols-2">
							<div className="flex items-center justify-between gap-4">
								<div className="w-[45.25%] space-y-2">
									<Label htmlFor="from">From</Label>
									<CityPicker cities={cities} setValue={setFrom} value={from} />
								</div>
								<div className="mt-6 flex h-full w-[5%] items-end justify-center">
									<ArrowLeftRight />
								</div>
								<div className="w-[45.25%] space-y-2">
									<Label htmlFor="to">To</Label>
									<CityPicker cities={cities} setValue={setTo} value={to} />
								</div>
							</div>

							<div className="grid gap-4 lg:grid-cols-2">
								<div className="space-y-2">
									<Label>Journey Date</Label>
									<DatePicker
										curretDate={true}
										onDateSelect={(date: Date) => {
											const safeDate = new Date(
												date.getFullYear(),
												date.getMonth(),
												date.getDate(),
												12 // normalize
											);

											const yyyy = safeDate.getFullYear();
											const mm = String(safeDate.getMonth() + 1).padStart(2, "0");
											const dd = String(safeDate.getDate()).padStart(2, "0");

											const formatted = `${yyyy}-${mm}-${dd}`;

											console.log(formatted);
											setJDate(formatted);
										}}

									/>
								</div>
								<div className="space-y-2">
									<Label>Return Date</Label>
									<DatePicker
										onDateSelect={(date: Date) => {
											const safeDate = new Date(
												date.getFullYear(),
												date.getMonth(),
												date.getDate(),
												12 // normalize
											);

											const yyyy = safeDate.getFullYear();
											const mm = String(safeDate.getMonth() + 1).padStart(2, "0");
											const dd = String(safeDate.getDate()).padStart(2, "0");

											const formatted = `${yyyy}-${mm}-${dd}`;

											console.log(formatted);
											setRDate(formatted);
										}}
									/>
								</div>
							</div>
						</div>
						<div>
							<Button className="h-full w-full bg-primary" type="submit">
								Search Buses
							</Button>
						</div>
					</div>
				</form>
			</CardDescription>
		</Card>
	);
}
