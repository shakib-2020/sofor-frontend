"use client";

import { ChevronDownIcon, Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";

type DatePickerProps = {
	curretDate?: boolean;
	onDateSelect?: (date: Date) => void;
	className?: string;
	variant?: "outline" | "default" | "ghost" | "link" | "secondary";
	label?: string;
};

export function DatePicker({ curretDate, onDateSelect, className, variant = "outline", label }: DatePickerProps) {
	const [open, setOpen] = React.useState(false);
	const [date, setDate] = React.useState<Date | undefined>(
		curretDate ? new Date() : undefined,
	);

	const handleSelect = (selectedDate: Date | undefined) => {
		if (!selectedDate) return;
		setDate(selectedDate);
		setOpen(false);
		onDateSelect?.(selectedDate); // Send value to parent
	};

	return (
		<div className="flex flex-col gap-3 w-full">
			<Popover onOpenChange={setOpen} open={open}>
				<PopoverTrigger asChild>
					<Button
						className={cn(
							"h-full w-full flex flex-col items-start justify-between p-5 bg-slate-50 border border-slate-100 hover:border-emerald-500/30 hover:bg-white hover:shadow-md rounded-[24px] text-slate-800 transition-all font-normal text-left",
							className
						)}
						id="date"
						variant={variant}
					>
						<div className="w-full flex flex-col items-start gap-1">
							<span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
								{label || "Date"}
							</span>
							<span className="text-xl font-extrabold text-slate-800 block mt-1 truncate max-w-full">
								{date
									? `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`
									: "Select date"}
							</span>
						</div>
						<span className="text-xs text-emerald-600/70 flex items-center gap-1.5 mt-2">
							<CalendarIcon className="h-3.5 w-3.5 text-emerald-500" />
							Choose date
						</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-auto overflow-hidden p-0">
					<Calendar
						captionLayout="dropdown"
						disabled={{ before: new Date() }}
						mode="single"
						onSelect={handleSelect}
						required={false}
						selected={date}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
