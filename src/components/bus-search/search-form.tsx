"use client";

import { ArrowLeftRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { DatePicker } from "@/components/bus-search/date-picker";
import { Button } from "@/components/ui/button";
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

	const handleSwap = () => {
		const temp = from;
		setFrom(to);
		setTo(temp);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const params = new URLSearchParams({
			from: String(from.id),
			to: String(to.id),
			...(jDate && { jDate }),
			...(rDate && { rDate }),
		});

		router.push(`/ticket?${params.toString()}`);
	};

	return (
		<div className="w-full bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100/60">
			<h3 className="text-center font-black text-xl sm:text-2xl text-[#107050] tracking-tight mb-6 uppercase">
				Plan Your Journey
			</h3>
			
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					{/* From & To Container */}
					<div className="relative grid grid-cols-2 gap-4 col-span-2">
						<CityPicker
							label="From"
							cities={cities}
							setValue={setFrom}
							value={from}
							className="w-full h-28"
						/>

						{/* Swap Button */}
						<button
							type="button"
							onClick={handleSwap}
							className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-100 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:rotate-180 transition-all duration-300 shadow-md cursor-pointer"
							title="Swap cities"
						>
							<ArrowLeftRight className="h-4 w-4" />
						</button>

						<CityPicker
							label="To"
							cities={cities}
							setValue={setTo}
							value={to}
							className="w-full h-28"
						/>
					</div>

					{/* Departure Date */}
					<DatePicker
						label="Departure"
						curretDate={true}
						variant="ghost"
						className="w-full h-28"
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
							setJDate(formatted);
						}}
					/>

					{/* Return Date */}
					<DatePicker
						label="Return Date"
						variant="ghost"
						className="w-full h-28"
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
							setRDate(formatted);
						}}
					/>
				</div>

				{/* Search Button */}
				<div className="pt-2 flex justify-center">
					<Button 
						className="w-full max-w-md bg-[#107050] hover:bg-[#0e5c42] text-white font-extrabold text-lg py-6 rounded-2xl shadow-md shadow-emerald-700/10 hover:shadow-lg hover:shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 h-14" 
						type="submit"
					>
						Search Buses
					</Button>
				</div>

				{/* Footer Info inside Card */}
				<div className="pt-2 text-center space-y-2">
					<div className="flex justify-center gap-1.5 text-emerald-500">
						<span className="h-2 w-2 rounded-full bg-emerald-500/80 animate-pulse" />
						<span className="h-2 w-2 rounded-full bg-emerald-500/80 animate-pulse delay-75" />
						<span className="h-2 w-2 rounded-full bg-emerald-500/80 animate-pulse delay-150" />
					</div>
					<p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
						47 buses available today
					</p>
				</div>
			</form>
		</div>
	);
}
