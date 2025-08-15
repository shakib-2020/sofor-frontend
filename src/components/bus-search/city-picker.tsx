'use client';

import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
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
}: {
  cities: City[];
  value: City;
  setValue: (value: City) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className="w-[200px] justify-between"
          variant="outline"
        >
          {value && value.id !== 0
            ? cities.find((city) => city.id === value.id)?.name
            : 'Select city...'}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
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
