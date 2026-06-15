"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MapPin,
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Info,
  Map
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ROLES } from "@/lib/permissions";

interface Counter {
  id: number;
  name: string;
  locationNote?: string;
  cityId: number;
}

interface City {
  id: number;
  name: string;
  districtId: number;
}

interface District {
  id: number;
  name: string;
  divisionId: number;
}

interface Division {
  id: number;
  name: string;
}

export default function ManageCounter() {
  const { user } = useAuth();
  const router = useRouter();

  const [counters, setCounters] = useState<Counter[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCityFilter, setSelectedCityFilter] = useState("all");

  const [selectedCounter, setSelectedCounter] = useState<Counter | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Edit dialog hierarchy selections
  const [editDivisionId, setEditDivisionId] = useState<string>("");
  const [editDistrictId, setEditDistrictId] = useState<string>("");
  const [editCityId, setEditCityId] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // RBAC checks
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === "admin";
  const isOperatorAdmin = user?.role === ROLES.OPERATOR_ADMIN || user?.role === ROLES.OPERATOR_MANAGER;
  const canAdd = isSuperAdmin || isOperatorAdmin;
  const canEdit = isSuperAdmin || isOperatorAdmin;
  const canDelete = isSuperAdmin || user?.role === ROLES.OPERATOR_ADMIN;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiClient.get("/api/counter").then((res) => res.data),
      apiClient.get("/api/division").then((res) => res.data),
      apiClient.get("/api/district").then((res) => res.data),
      apiClient.get("/api/city").then((res) => res.data),
    ])
      .then(([counterData, divisionData, districtData, cityData]) => {
        setCounters(counterData);
        setDivisions(divisionData);
        setDistricts(districtData);
        setCities(cityData);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        toast.error("Failed to load counter dashboard data");
      })
      .finally(() => setLoading(false));
  }, []);

  // Update edit dialog select states when selected counter changes
  useEffect(() => {
    if (selectedCounter && cities.length > 0 && districts.length > 0) {
      const city = cities.find((c) => c.id === selectedCounter.cityId);
      if (city) {
        setEditCityId(String(city.id));
        const dist = districts.find((d) => d.id === city.districtId);
        if (dist) {
          setEditDistrictId(String(dist.id));
          setEditDivisionId(String(dist.divisionId));
        }
      }
    }
  }, [selectedCounter, cities, districts]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete counter "${name}"?`)) return;
    try {
      setActionLoading(true);
      await apiClient.delete(`/api/counter/${id}`);
      setCounters((prev) => prev.filter((o) => o.id !== id));
      toast.success(`Counter "${name}" has been deleted.`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete counter.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCounter || !editCityId) return;

    try {
      setActionLoading(true);
      const payload = {
        ...selectedCounter,
        cityId: Number(editCityId),
      };

      await apiClient.put(`/api/counter/${selectedCounter.id}`, payload);

      setCounters((prev) =>
        prev.map((o) => (o.id === selectedCounter.id ? { ...selectedCounter, cityId: Number(editCityId) } : o))
      );
      toast.success("Counter details updated successfully.");
      setIsDialogOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update counter.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDivisionChange = (val: string) => {
    setEditDivisionId(val);
    setEditDistrictId("");
    setEditCityId("");
  };

  const handleDistrictChange = (val: string) => {
    setEditDistrictId(val);
    setEditCityId("");
  };

  // Helper to fetch details
  const getFullLocationText = (cityId: number) => {
    const city = cities.find((c) => c.id === cityId);
    if (!city) return "Unknown Location";

    const dist = districts.find((d) => d.id === city.districtId);
    if (!dist) return city.name;

    const div = divisions.find((d) => d.id === dist.divisionId);
    if (!div) return `${city.name}, ${dist.name}`;

    return `${city.name}, ${dist.name} (${div.name})`;
  };

  // Filtered counters search list
  const filteredCounters = counters.filter((c) => {
    const locText = getFullLocationText(c.cityId).toLowerCase();
    const nameMatch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const noteMatch = (c.locationNote || "").toLowerCase().includes(searchQuery.toLowerCase());
    const locMatch = locText.includes(searchQuery.toLowerCase());

    const matchesSearch = nameMatch || noteMatch || locMatch;
    const matchesFilter = selectedCityFilter === "all" || String(c.cityId) === selectedCityFilter;

    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCounters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredCounters.slice(startIndex, startIndex + itemsPerPage);

  const filteredDistricts = districts.filter((d) => String(d.divisionId) === editDivisionId);
  const filteredCities = cities.filter((c) => String(c.districtId) === editDistrictId);

  return (
    <div className="space-y-6 p-1 md:p-4">
      {/* Premium Glassmorphic Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent p-6 shadow-xl backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="flex items-center gap-2 font-bold text-3xl tracking-tight text-gray-900 dark:text-white">
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              Counter Directory
            </h1>
            <p className="text-gray-500 text-sm dark:text-gray-400">
              Manage and configure your ticketing counters, locations, and structural properties.
            </p>
          </div>
          {canAdd && (
            <Button
              onClick={() => router.push("/dashboard/add-counter")}
              className="group flex items-center gap-2 bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-blue-500/25 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              Add Counter
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search counters by name, city, note..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 bg-gray-50/50 focus:bg-white dark:bg-gray-900"
          />
        </div>
        <div className="w-full sm:w-64">
          <Select
            value={selectedCityFilter}
            onValueChange={(val) => {
              setSelectedCityFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="bg-gray-50/50 dark:bg-gray-900">
              <SelectValue placeholder="Filter by City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={`filter-${city.id}`} value={String(city.id)}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="font-medium text-gray-500 text-sm">Loading counters database...</p>
        </div>
      ) : filteredCounters.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-12 px-4 text-center dark:border-gray-800 dark:bg-gray-950">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 font-semibold text-lg text-gray-900 dark:text-white">No counters found</h3>
          <p className="mt-2 max-w-sm text-gray-500 text-sm">
            {searchQuery || selectedCityFilter !== "all"
              ? "We couldn't find any counters matching your search filters. Try clearing them."
              : "There are no ticketing counters configured yet. Let's create your first one!"}
          </p>
          {(searchQuery || selectedCityFilter !== "all") && (
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCityFilter("all");
              }}
              variant="outline"
              className="mt-4"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-55/75 font-semibold text-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="py-3.5 px-4">Counter Name</th>
                  <th className="py-3.5 px-4">Location (Upazila, District, Division)</th>
                  <th className="py-3.5 px-4">Location Note</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                {currentItems.map((counter) => (
                  <tr
                    key={counter.id}
                    className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/20"
                  >
                    <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          <Building2 className="h-4.5 w-4.5" />
                        </div>
                        {counter.name}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {getFullLocationText(counter.cityId)}
                      </span>
                    </td>
                    <td className="py-4 px-4 max-w-xs truncate text-gray-500 dark:text-gray-400">
                      {counter.locationNote ? (
                        <span className="flex items-center gap-1">
                          <Info className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                          {counter.locationNote}
                        </span>
                      ) : (
                        <span className="italic text-gray-300 dark:text-gray-700">No notes</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {canEdit && (
                          <Button
                            onClick={() => {
                              setSelectedCounter(counter);
                              setIsDialogOpen(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1.5 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            onClick={() => handleDelete(counter.id, counter.name)}
                            variant="ghost"
                            size="sm"
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Styled Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-150 py-4 px-6 dark:border-gray-900">
              <span className="text-gray-500 text-sm dark:text-gray-400">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{startIndex + 1}</span> to{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.min(startIndex + itemsPerPage, filteredCounters.length)}
                </span>{" "}
                of <span className="font-semibold text-gray-900 dark:text-white">{filteredCounters.length}</span>{" "}
                counters
              </span>
              <div className="flex gap-2">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={`page-${i + 1}`}
                    onClick={() => setCurrentPage(i + 1)}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Polished Update Counter Dialog with Location Hierarchy */}
      <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950">
          <DialogHeader className="border-b border-gray-100 pb-3 dark:border-gray-900">
            <DialogTitle className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white">
              <Building2 className="h-5 w-5 text-blue-600" />
              Update Counter Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="counter-name" className="font-semibold">Counter Name</Label>
              <Input
                id="counter-name"
                value={selectedCounter?.name || ""}
                onChange={(e) =>
                  setSelectedCounter((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                className="bg-gray-50/50 dark:bg-gray-900"
              />
            </div>

            {/* Division Selector */}
            <div className="space-y-1.5">
              <Label className="font-semibold">Division</Label>
              <Select
                value={editDivisionId}
                onValueChange={handleDivisionChange}
              >
                <SelectTrigger className="bg-gray-50/50 dark:bg-gray-900">
                  <SelectValue placeholder="Select Division" />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((div) => (
                    <SelectItem key={`edit-div-${div.id}`} value={String(div.id)}>
                      {div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District Selector */}
            <div className="space-y-1.5">
              <Label className="font-semibold">District</Label>
              <Select
                disabled={!editDivisionId}
                value={editDistrictId}
                onValueChange={handleDistrictChange}
              >
                <SelectTrigger className="bg-gray-50/50 dark:bg-gray-900">
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  {filteredDistricts.map((dist) => (
                    <SelectItem key={`edit-dist-${dist.id}`} value={String(dist.id)}>
                      {dist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City Selector */}
            <div className="space-y-1.5">
              <Label className="font-semibold">City (Upazila)</Label>
              <Select
                disabled={!editDistrictId}
                value={editCityId}
                onValueChange={setEditCityId}
              >
                <SelectTrigger className="bg-gray-50/50 dark:bg-gray-900">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCities.map((city) => (
                    <SelectItem key={`edit-city-${city.id}`} value={String(city.id)}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location-note" className="font-semibold">Location Note / Landmark</Label>
              <Input
                id="location-note"
                placeholder="e.g. Opposite the central terminal building"
                value={selectedCounter?.locationNote || ""}
                onChange={(e) =>
                  setSelectedCounter((prev) =>
                    prev ? { ...prev, locationNote: e.target.value } : null
                  )
                }
                className="bg-gray-50/50 dark:bg-gray-900"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-gray-100 pt-3 dark:border-gray-900">
            <Button
              onClick={() => setIsDialogOpen(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={actionLoading || !editCityId || !selectedCounter?.name}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {actionLoading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

