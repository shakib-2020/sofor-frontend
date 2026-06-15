'use client';

import { CheckIcon, ChevronsUpDownIcon, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type City = {
  id: number;
  name: string;
  districtId: number;
};

export function CityPicker({
  cities,
  value,
  setValue,
  className,
  label,
}: {
  cities: City[];
  value: City;
  setValue: (value: City) => void;
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className={cn(
            "h-full w-full flex flex-col items-start justify-between p-5 bg-slate-50 border border-slate-100 hover:border-emerald-500/30 hover:bg-white hover:shadow-md rounded-[24px] text-slate-800 transition-all font-normal text-left",
            className
          )}
          variant="outline"
        >
          <div className="w-full flex flex-col items-start gap-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              {label || "City"}
            </span>
            <span className="text-xl font-extrabold text-slate-800 block mt-1 truncate max-w-full">
              {value && value.id !== 0
                ? cities.find((city) => city.id === value.id)?.name
                : 'Select city'}
            </span>
          </div>
          <span className="text-xs text-emerald-600/70 flex items-center gap-1.5 mt-2">
            <MapPin className="h-3.5 w-3.5 text-emerald-500" />
            Bangladesh
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[200px] p-0", className?.includes("w-full") && "w-[var(--radix-popover-trigger-width)]")} align="start">
        <Command>
          <CommandInput placeholder="Search city..." />
          <CommandList>
            <CommandEmpty>No City found.</CommandEmpty>
            <CommandGroup>
              {cities.map((city) => (
                <CommandItem
                  key={city.id}
                  onSelect={(currentValue) => {
                    setValue(
                      currentValue === value.id.toString()
                        ? {
                            id: 0,
                            name: '',
                            districtId: 0,
                          }
                        : city
                    );
                    setOpen(false);
                  }}
                  value={city.name}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 h-4 w-4',
                      value.id === city.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {city.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
