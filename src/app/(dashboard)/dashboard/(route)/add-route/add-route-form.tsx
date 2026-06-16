'use client';
import { ArrowLeftRight, Check, ChevronsUpDown, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function CreateRouteForm() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'superAdmin' || user?.role === 'admin';
  const [cityList, setCityList] = useState<{ id: number; name: string }[]>([]);
  const [operators, setOperators] = useState<{ id: number; name: string }[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState('');
  const [route, setRoute] = useState<number[]>([]); // array of city IDs
  const [cityNameInput, setCityNameInput] = useState('');
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await apiClient.get('/api/city');
        setCityList(res.data);
      } catch (err) {
        console.error('Error fetching cities:', err);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      apiClient.get('/api/bus-owner')
        .then((res) => setOperators(res.data))
        .catch((err) => console.error('Error fetching operators:', err));
    }
  }, [isAdmin]);

  const getCityName = (id: number) =>
    cityList.find((c) => c.id === id)?.name || '';

  const onAddCity = () => {
    const selectedCity = cityList.find((c) => c.name === cityNameInput);
    if (selectedCity && !route.includes(selectedCity.id)) {
      setRoute([...route, selectedCity.id]);
      setCityNameInput('');
    }
  };

  const onSubmit = async (data: any) => {
    if (isAdmin && !selectedOperatorId) {
      toast.error('Please select an operator company');
      return;
    }

    // Build fares object using actual DB IDs
    const fares: Record<string, number> = {};
    for (let i = 0; i < route.length; i++) {
      for (let j = i + 1; j < route.length; j++) {
        const key = `${route[i]} - ${route[j]}`;
        fares[key] = Number(data[key]) || 0; // ensure number
      }
    }

    // Map route IDs to city objects (id + name)
    const routeCities = route
      .map((id) => {
        const city = cityList.find((c) => c.id === id);
        return city ? { id: city.id, name: city.name } : null;
      })
      .filter(Boolean);

    const payload = {
      route: routeCities,
      fares,
      operatorId: isAdmin ? Number(selectedOperatorId) : undefined,
    };

    console.log('Payload to backend:', payload);

    try {
      await apiClient.post('/api/route', payload);
      toast.success('Route has been created.');
      reset();
      setRoute([]);
      setSelectedOperatorId('');
    } catch (err) {
      console.error('Error creating route:', err);
      toast.error('Failed to create route.');
    }
  };

  return (
    <div className="max-w-3xl p-6 text-black">
      {/* Operator Selector for Admins */}
      {isAdmin && (
        <div className="mb-6 max-w-xs">
          <Label className="mb-2 block">Operator / Bus Company</Label>
          <Select value={selectedOperatorId} onValueChange={setSelectedOperatorId}>
            <SelectTrigger className="border-black text-black">
              <SelectValue placeholder="Select Operator Company" />
            </SelectTrigger>
            <SelectContent>
              {operators.map((op) => (
                <SelectItem key={op.id} value={String(op.id)}>
                  {op.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* City Selector */}
      <div className="mb-4 flex gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="w-[200px] justify-between border-black text-black"
              variant="outline"
            >
              {cityNameInput ? cityNameInput : 'Search City'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search city..." />
              <CommandEmpty>No city found.</CommandEmpty>
              <CommandGroup>
                {cityList.map((city) => (
                  <CommandItem
                    disabled={route.includes(city.id)}
                    key={city.id}
                    onSelect={(currentValue) => setCityNameInput(currentValue)}
                    value={city.name}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        route.includes(city.id) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {city.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        <Button
          className="border border-black text-white"
          onClick={onAddCity}
          type="button"
        >
          + Add to route
        </Button>
      </div>

      {/* Route Display */}
      {route.length > 0 && (
        <div className="mb-6">
          <Label className="mb-2 block">Route :</Label>
          <div className="flex flex-wrap gap-2 rounded border border-black border-dotted p-2">
            {route.map((cityId, index) => (
              <div className="flex" key={cityId}>
                <span className="flex items-center gap-2 rounded border border-black bg-gray-100 px-2 py-1">
                  <span>{getCityName(cityId)}</span>
                  <button
                    className="hover:text-red-500"
                    onClick={() => setRoute(route.filter((r) => r !== cityId))}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
                {index < route.length - 1 && (
                  <span className="ml-1 text-xl">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fare Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Label className="mb-2 block">Price/Fare:</Label>
        <div className="grid gap-4">
          {route.map((fromId, i) =>
            route.slice(i + 1).map((toId) => {
              const fromName = getCityName(fromId);
              const toName = getCityName(toId);
              const key = `${fromId} - ${toId}`;
              return (
                <div className="grid grid-cols-2 gap-4" key={key}>
                  <Label htmlFor={key}>
                    {fromName} - {toName}:
                  </Label>
                  <Input
                    id={key}
                    {...register(key)}
                    className="border border-black text-black"
                    placeholder="Enter fare"
                    type="number"
                  />
                </div>
              );
            })
          )}
        </div>
        <Button className="mt-6 border border-black text-white" type="submit">
          Save
        </Button>
      </form>
    </div>
  );
}
