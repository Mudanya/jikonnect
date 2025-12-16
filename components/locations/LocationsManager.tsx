"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import BulkImport from "./BulkImport";

const locationFormSchema = z.object({
  zoneId: z.string().min(1, "Zone is required"),
  clusterId: z.string().nullable().optional(),
  name: z.string().min(1, "Name is required"),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  matchingRadius: z.number().int().min(1).max(50),
  active: z.boolean(),
});

type LocationFormData = z.infer<typeof locationFormSchema>;

interface Zone {
  id: string;
  name: string;
  color: string;
}

interface Cluster {
  id: string;
  name: string;
  zoneId: string;
}

interface Location extends LocationFormData {
  id: string;
  slug: string;
  zone: Zone;
  cluster: Cluster | null;
  _count: {
    profiles: number;
  };
}

export default function LocationsManager() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [filterZoneId, setFilterZoneId] = useState<string>("all");
  const [filterClusterId, setFilterClusterId] = useState<string>("all");

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      zoneId: "",
      clusterId: null,
      name: "",
      latitude: null,
      longitude: null,
      matchingRadius: 5,
      active: true,
    },
  });

  const selectedZoneId = form.watch("zoneId");
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchZones();
    fetchClusters();
    fetchLocations();
  }, []);

  useEffect(() => {
    if (filterZoneId) {
      fetchLocations(filterZoneId, filterClusterId);
    } else {
      fetchLocations();
    }
  }, [filterZoneId, filterClusterId]);

  useEffect(() => {
    if (selectedZoneId) {
      const zoneClusters = clusters.filter((c) => c.zoneId === selectedZoneId);
      if (zoneClusters.length === 0) {
        form.setValue("clusterId", null);
      }
    }
  }, [selectedZoneId, clusters, form]);

  useEffect(() => {
    if (editingLocation) {
      form.reset({
        zoneId: editingLocation.zoneId,
        clusterId: editingLocation.clusterId,
        name: editingLocation.name,
        latitude: editingLocation.latitude,
        longitude: editingLocation.longitude,
        matchingRadius: editingLocation.matchingRadius,
        active: editingLocation.active,
      });
    } else {
      form.reset({
        zoneId: "all",
        clusterId: "all",
        name: "",
        latitude: null,
        longitude: null,
        matchingRadius: 5,
        active: true,
      });
    }
  }, [editingLocation, form]);

  const fetchZones = async () => {
    try {
      const response = await fetch("/api/admin/zones", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch zones");
      const data = await response.json();
      setZones(data.filter((z: any) => z.active));
    } catch (error) {
      toast.error("Failed to load zones");
      console.error(error);
    }
  };

  const fetchClusters = async () => {
    try {
      const response = await fetch("/api/admin/clusters", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch clusters");
      const data = await response.json();
      setClusters(data.filter((c: any) => c.active));
    } catch (error) {
      toast.error("Failed to load clusters");
      console.error(error);
    }
  };

  const fetchLocations = async (zoneId?: string, clusterId?: string) => {
    try {
      let url = "/api/admin/locations";
      const params = new URLSearchParams();
      if (zoneId) params.append("zoneId", zoneId);
      if (clusterId) params.append("clusterId", clusterId);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch locations");
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      toast.error("Failed to load locations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LocationFormData) => {
    try {
      const url = editingLocation
        ? `/api/admin/locations/${editingLocation.id}`
        : "/api/admin/locations";
      const method = editingLocation ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save location");

      toast.success(editingLocation ? "Location updated" : "Location created");
      setDialogOpen(false);
      setEditingLocation(null);
      form.reset();
      fetchLocations(filterZoneId, filterClusterId);
    } catch (error) {
      toast.error("Failed to save location");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    try {
      const response = await fetch(`/api/admin/locations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete location");

      toast.success("Location deleted");
      fetchLocations(filterZoneId, filterClusterId);
    } catch (error) {
      toast.error("Failed to delete location");
      console.error(error);
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingLocation(null);
      form.reset();
    }
  };

  const getAvailableClusters = () => {
    return clusters.filter((c) => c.zoneId === selectedZoneId);
  };

  const getFilterClusters = () => {
    if (!filterZoneId) return [];
    return clusters.filter((c) => c.zoneId === filterZoneId);
  };

  if (loading) {
    return <div className="text-center py-8">Loading locations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex-col md:flex-row justify-between items-center gap-4 flex-wrap">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="">
            <Label htmlFor="filter-zone">Filter by Zone</Label>
            <Select
              value={filterZoneId}
              onValueChange={(value) => {
                setFilterZoneId(value);
                setFilterClusterId("");
              }}
            >
              <SelectTrigger id="filter-zone">
                <SelectValue placeholder="All zones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All zones</SelectItem>
                {zones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {filterZoneId && (
            <div className="">
              <Label htmlFor="filter-cluster">Filter by Cluster</Label>
              <Select
                value={filterClusterId}
                onValueChange={setFilterClusterId}
              >
                <SelectTrigger id="filter-cluster">
                  <SelectValue placeholder="All clusters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All clusters</SelectItem>
                  {getFilterClusters().map((cluster) => (
                    <SelectItem key={cluster.id} value={cluster.id}>
                      {cluster.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-6">
            Total locations: {locations.length}
          </p>
        </div>
        <div className="flex md:items-center flex-col md:flex-row gap-2 mt-6">
          <BulkImport
            onImportComplete={() =>
              fetchLocations(filterZoneId, filterClusterId)
            }
          />
          <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="mt-6">
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingLocation ? "Edit Location" : "Create Location"}
                </DialogTitle>
                <DialogDescription>
                  {editingLocation
                    ? "Update the location details below"
                    : "Add a new specific location"}
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="zoneId">Zone *</Label>
                  <Select
                    value={form.watch("zoneId")}
                    onValueChange={(value) => {
                      form.setValue("zoneId", value);
                      form.setValue("clusterId", null);
                    }}
                  >
                    <SelectTrigger id="zoneId">
                      <SelectValue placeholder="Select a zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.zoneId && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.zoneId.message}
                    </p>
                  )}
                </div>

                {selectedZoneId && getAvailableClusters().length > 0 && (
                  <div>
                    <Label htmlFor="clusterId">Cluster (Optional)</Label>
                    <Select
                      value={form.watch("clusterId") || ""}
                      onValueChange={(value) =>
                        form.setValue("clusterId", value || null)
                      }
                    >
                      <SelectTrigger id="clusterId">
                        <SelectValue placeholder="Select a cluster (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No cluster</SelectItem>
                        {getAvailableClusters().map((cluster) => (
                          <SelectItem key={cluster.id} value={cluster.id}>
                            {cluster.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="e.g., Kilimani"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      {...form.register("latitude",{valueAsNumber:true})}
                      placeholder="-1.2921"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      {...form.register("longitude",{valueAsNumber:true})}
                      placeholder="36.8219"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="matchingRadius">Matching Radius (km) *</Label>
                  <Input
                    id="matchingRadius"
                    type="number"
                    {...form.register("matchingRadius",{valueAsNumber:true})}
                    min="1"
                    max="50"
                  />
                  {form.formState.errors.matchingRadius && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.matchingRadius.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={form.watch("active")}
                    onCheckedChange={(checked) =>
                      form.setValue("active", checked)
                    }
                  />
                  <Label htmlFor="active">Active</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogClose(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting
                      ? "Saving..."
                      : editingLocation
                      ? "Update"
                      : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>Coordinates</TableHead>
                <TableHead>Radius</TableHead>
                <TableHead>Providers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No locations found. Create your first location to get
                    started.
                  </TableCell>
                </TableRow>
              ) : (
                locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">
                      {location.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: location.zone.color }}
                        />
                        <span>{location.zone.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {location.cluster ? location.cluster.name : "-"}
                    </TableCell>
                    <TableCell>
                      {location.latitude && location.longitude ? (
                        <span className="text-xs text-muted-foreground">
                          {location.latitude.toFixed(4)},{" "}
                          {location.longitude.toFixed(4)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{location.matchingRadius} km</TableCell>
                    <TableCell>{location._count.profiles}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          location.active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {location.active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(location)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(location.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
