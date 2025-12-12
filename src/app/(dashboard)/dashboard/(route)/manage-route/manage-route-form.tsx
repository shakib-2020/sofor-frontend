'use client';

import { ChevronsUpDown, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { _error } from '@/lib/logs';
import { apiClient } from '@/lib/api';

type City = { id: number; name: string };
type RouteStop = { id: number; name: string; serial: number };
type RouteFare = {
  from: string;
  to: string;
  amount: number;
  fromStopId?: number;
  toStopId?: number;
};

interface RouteRow {
  id: number;
  name: string;
  stops: RouteStop[];
  fares: RouteFare[];
}

export default function ManageRoute() {
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Editing state
  const [selectedRoute, setSelectedRoute] = useState<RouteRow | null>(null);
  const [editStops, setEditStops] = useState<number[]>([]);
  const [editFares, setEditFares] = useState<Record<string, string>>({});
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [cityPickerInput, setCityPickerInput] = useState('');

  const router = useRouter();

  // Load data
  useEffect(() => {
    Promise.all([
      apiClient.get('/api/route').then((r) => r.data),
      apiClient.get('/api/city').then((r) => r.data),
    ])
      .then(([routeData, cityData]) => {
        setRoutes(routeData);
        setCities(cityData);
      })
      .catch((err) => _error('Error loading routes/cities:', err));
  }, []);

  const getCityName = (id: number) =>
    cities.find((c) => c.id === id)?.name ?? '';

  const currentPageItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return routes.slice(start, start + itemsPerPage);
  }, [routes, currentPage]);

  const totalPages = Math.ceil(routes.length / itemsPerPage);

  const handleDelete = async (id: number) => {
    await apiClient.delete(`/api/route/${id}`);
    setRoutes((prev) => prev.filter((r) => r.id !== id));
    const after = routes.length - 1;
    const newTotalPages = Math.max(1, Math.ceil(after / itemsPerPage));
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  };

  const openUpdate = (routeRow: RouteRow) => {
    setSelectedRoute(routeRow);

    // Sort stops & store ids
    const ids = routeRow.stops
      .sort((a, b) => a.serial - b.serial)
      .map((s) => s.id);
    setEditStops(ids);

    // Build fare record by stop IDs
    const faresRec: Record<string, string> = {};
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const fromId = ids[i];
        const toId = ids[j];
        const existing = routeRow.fares.find(
          (f: any) => f.fromStopId === fromId && f.toStopId === toId
        );
        const key = `${fromId} - ${toId}`;
        faresRec[key] = existing ? String(existing.amount ?? '') : '';
      }
    }
    setEditFares(faresRec);

    setCityPickerInput('');
    setIsDialogOpen(true);
  };

  const addCityToRoute = (cityName: string) => {
    const city = cities.find((c) => c.name === cityName);
    if (!city) return;
    if (!editStops.includes(city.id))
      setEditStops((prev) => [...prev, city.id]);
    setCityPickerInput('');
    setCityPickerOpen(false);
  };

  const removeCityFromRoute = (id: number) => {
    setEditStops((prev) => prev.filter((x) => x !== id));
    setEditFares((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        const [a, b] = k.split(' - ').map(Number);
        if (a === id || b === id) delete next[k];
      });
      return next;
    });
  };

  const fareKeys = useMemo(() => {
    const keys: string[] = [];
    for (let i = 0; i < editStops.length; i++) {
      for (let j = i + 1; j < editStops.length; j++)
        keys.push(`${editStops[i]} - ${editStops[j]}`);
    }
    return keys;
  }, [editStops]);

  const handleUpdate = async () => {
    if (!selectedRoute) return;
    if (editStops.length < 2) return;

    setLoading(true);

    const routePayload = editStops
      .map((id) => {
        const city = cities.find((c) => c.id === id);
        return city ? { id: city.id, name: city.name } : null;
      })
      .filter(Boolean) as { id: number; name: string }[];

    const faresPayload: Record<string, number> = {};
    fareKeys.forEach((key) => {
      const raw = editFares[key];
      const num = raw ? Number(raw) : 0;
      faresPayload[key] = Number.isFinite(num) ? num : 0;
    });

    await apiClient.put(`/api/route/${selectedRoute.id}`, { route: routePayload, fares: faresPayload });

    // Build updated route object
    const newName = routePayload.map((c) => c.name).join(' to ');
    const newStops: RouteStop[] = routePayload.map((c, idx) => ({
      id: c.id,
      name: c.name,
      serial: idx + 1,
    }));
    const newFares: RouteFare[] = fareKeys.map((key) => {
      const [fromId, toId] = key.split(' - ').map(Number);
      return {
        from: getCityName(fromId),
        to: getCityName(toId),
        amount: Number(editFares[key] ?? 0),
        fromStopId: fromId,
        toStopId: toId,
      };
    });

    const updatedRoute: RouteRow = {
      id: selectedRoute.id,
      name: newName,
      stops: newStops,
      fares: newFares,
    };

    // Update state
    setRoutes((prev) =>
      prev.map((r) => (r.id === selectedRoute.id ? updatedRoute : r))
    );
    setSelectedRoute(updatedRoute); // important: keep selectedRoute in sync

    setLoading(false);
    setIsDialogOpen(false);
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between">
        <h1 className="font-bold text-2xl">Manage Routes</h1>
        <Button onClick={() => router.push('/dashboard/add-route')}>
          Add Route
        </Button>
      </div>

      <table className="w-full rounded-lg border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Stops</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPageItems.map((route) => (
            <tr key={route.id}>
              <td className="border p-2">{route.id}</td>
              <td className="border p-2">{route.name}</td>
              <td className="border p-2">
                <div className="flex flex-wrap items-center gap-1">
                  {route.stops
                    .sort((a, b) => a.serial - b.serial)
                    .map((s, idx, arr) => (
                      <span
                        className="flex items-center"
                        key={`${route.id}-${s.id}`}
                      >
                        <span className="rounded border px-2 py-0.5">
                          {s.name}
                        </span>
                        {idx < arr.length - 1 && (
                          <span className="px-1">→</span>
                        )}
                      </span>
                    ))}
                </div>
              </td>
              <td className="flex justify-center gap-2 border p-2">
                <Button
                  onClick={() =>
                    openUpdate(routes.find((r) => r.id === route.id)!)
                  }
                  variant="outline"
                >
                  Update
                </Button>
                <Button
                  onClick={() => handleDelete(route.id)}
                  variant="destructive"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex justify-center gap-2">
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          variant="ghost"
        >
          Prev
        </Button>
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={`page-${i + 1}`}
            onClick={() => setCurrentPage(i + 1)}
            variant={currentPage === i + 1 ? 'default' : 'outline'}
          >
            {i + 1}
          </Button>
        ))}
        <Button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          variant="ghost"
        >
          Next
        </Button>
      </div>

      {/* Update Route Dialog */}
      <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Update Route</DialogTitle>
          </DialogHeader>

          <div className="mb-4 flex gap-3">
            <Popover onOpenChange={setCityPickerOpen} open={cityPickerOpen}>
              <PopoverTrigger asChild>
                <Button className="w-[240px] justify-between" variant="outline">
                  {cityPickerInput || 'Search City'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0">
                <Command>
                  <CommandInput
                    onValueChange={setCityPickerInput}
                    placeholder="Search city..."
                    value={cityPickerInput}
                  />
                  <CommandEmpty>No city found.</CommandEmpty>
                  <CommandGroup>
                    {cities.map((c) => (
                      <CommandItem
                        disabled={editStops.includes(c.id)}
                        key={c.id}
                        onSelect={(val) => setCityPickerInput(val)}
                        value={c.name}
                      >
                        {c.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <Button
              onClick={() => addCityToRoute(cityPickerInput)}
              type="button"
            >
              + Add to route
            </Button>
          </div>

          <div className="mb-6">
            <Label className="mb-2 block">Route:</Label>
            <div className="flex flex-wrap gap-2 rounded border border-dotted p-2">
              {editStops.map((id, idx) => (
                <div className="flex items-center" key={id}>
                  <span className="flex items-center gap-2 rounded border bg-gray-100 px-2 py-1">
                    <span>{getCityName(id)}</span>
                    <button
                      className="hover:text-red-600"
                      onClick={() => removeCityFromRoute(id)}
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                  {idx < editStops.length - 1 && (
                    <span className="ml-1 text-xl">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Price / fare:</Label>
            <div className="grid gap-4">
              {editStops.map((fromId, i) =>
                editStops.slice(i + 1).map((toId) => {
                  const key = `${fromId} - ${toId}`;
                  const fromName = getCityName(fromId);
                  const toName = getCityName(toId);
                  return (
                    <div
                      className="grid grid-cols-2 items-center gap-4"
                      key={key}
                    >
                      <Label htmlFor={key}>
                        {fromName} - {toName}
                      </Label>
                      <Input
                        id={key}
                        onChange={(e) =>
                          setEditFares((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        placeholder="Enter fare"
                        type="number"
                        value={editFares[key] ?? ''}
                      />
                    </div>
                  );
                })
              )}
              {editStops.length < 2 && (
                <p className="text-muted-foreground text-sm">
                  Add at least two cities to define fares.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={loading || editStops.length < 2}
              onClick={handleUpdate}
            >
              {loading ? 'Updating...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
