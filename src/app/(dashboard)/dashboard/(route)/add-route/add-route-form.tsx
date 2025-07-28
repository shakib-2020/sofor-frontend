"use client";
import { ArrowLeftRight, Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils"; // utility for className merge (if needed)

const cityList = [
  { id: 1, name: "Uttara", districtId: 1 },
  { id: 2, name: "Savar", districtId: 1 },
  { id: 3, name: "Sylhet City", districtId: 5 },

  // Add more cities as needed
];

export default function CreateRouteForm() {
  const [route, setRoute] = useState<number[]>([]); // route is array of city ids
  const [cityNameInput, setCityNameInput] = useState(""); // was counterInput
  const { register, handleSubmit, reset } = useForm();

  // Helper to get city name by id
  const getCityName = (id: number) =>
    cityList.find((c) => c.id === id)?.name || "";

  const onAddCity = () => {
    const selectedCity = cityList.find((c) => c.name === cityNameInput);
    if (selectedCity && !route.includes(selectedCity.id)) {
      setRoute([...route, selectedCity.id]);
      setCityNameInput("");
    }
  };

  const onSubmit = async (data: any) => {
    const fares: Record<string, string> = {};
    for (let i = 0; i < route.length; i++) {
      for (let j = i + 1; j < route.length; j++) {
        const key = `${route[i]} - ${route[j]}`;
        fares[key] = data[key];
      }
    }

    // Map route ids to city objects
    const routeCities = route
      .map((id) => {
        const city = cityList.find((c) => c.id === id);
        return city ? { id: city.id, name: city.name } : null;
      })
      .filter(Boolean);

    const payload = {
      route: routeCities,
      fares,
    };

    await fetch("http://localhost:5000/api/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    toast("Route has been created.");
    console.log(payload);
    reset();
    setRoute([]);
  };

  return (
    <div className="max-w-3xl p-6  text-black">
      <div className="flex gap-4 mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[200px] justify-between text-black border-black"
            >
              {cityNameInput ? cityNameInput : "Search City"}
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
                    key={city.id}
                    value={city.name}
                    onSelect={(currentValue) => {
                      setCityNameInput(currentValue);
                    }}
                    disabled={route.includes(city.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        route.includes(city.id) ? "opacity-100" : "opacity-0",
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
          onClick={onAddCity}
          className="border-black border text-white"
          type="button"
        >
          + Add to route
        </Button>
      </div>

      <div className="mb-6">
        <Label className="mb-2 block">Route :</Label>
        <div className="flex flex-wrap gap-2 border border-dotted border-black p-2 rounded">
          {route.map((cityId, index) => (
            <div key={cityId} className="flex">
              <span className="flex items-center gap-2 px-2 py-1 rounded bg-gray-100 border border-black">
                <span>{getCityName(cityId)}</span>
                <button
                  type="button"
                  onClick={() => {
                    setRoute(route.filter((r) => r !== cityId));
                  }}
                  className="hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
              {index < route.length - 1 && (
                <span className="text-xl ml-1">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Label className="mb-2 block">Price/fare:</Label>
        <div className="grid gap-4">
          {route.map((fromId, i) =>
            route.slice(i + 1).map((toId) => {
              const fromName = getCityName(fromId);
              const toName = getCityName(toId);
              const key = `${fromId} - ${toId}`;
              return (
                <div key={key} className="grid grid-cols-2 gap-4">
                  <Label htmlFor={key}>
                    {fromName} - {toName}:
                  </Label>
                  <Input
                    id={key}
                    {...register(key)}
                    placeholder="Enter fare"
                    type="number"
                    className=" text-black border-black border"
                  />
                </div>
              );
            }),
          )}
        </div>
        <Button type="submit" className="mt-6 border-black border text-white">
          Save
        </Button>
      </form>
    </div>
  );
}
