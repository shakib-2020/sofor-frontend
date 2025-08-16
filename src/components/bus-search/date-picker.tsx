"use client";

import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerProps = {
	curretDate?: boolean;
	onDateSelect?: (date: Date) => void;
};

export function DatePicker({ curretDate, onDateSelect }: DatePickerProps) {
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
		<div className="flex flex-col gap-3">
			<Popover onOpenChange={setOpen} open={open}>
				<PopoverTrigger asChild>
					<Button
						className="justify-start font-normal"
						id="date"
						variant="outline"
					>
						{date
							? `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
							: "Select date"}
						<ChevronDownIcon />
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
