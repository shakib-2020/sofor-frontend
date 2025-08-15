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
};

export function CityPicker({ cities }: { cities: City[] }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className="w-[200px] justify-between"
          variant="outline"
        >
          {value
            ? cities.find((city) => city.id.toString() === value)?.name
            : 'Select city...'}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandList>
            <CommandEmpty>No City found.</CommandEmpty>
            <CommandGroup>
              {cities.map((city) => (
                <CommandItem
                  key={city.id}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                  value={city.id.toString()}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === city.id.toString() ? 'opacity-100' : 'opacity-0'
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
