"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const clusterFormSchema = z.object({
  zoneId: z.string().min(1, "Zone is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  order: z.number().min(0),
  active: z.boolean(),
});

type ClusterFormData = z.infer<typeof clusterFormSchema>;

interface Zone {
  id: string;
  name: string;
  color: string;
}

interface Cluster extends ClusterFormData {
  id: string;
  slug: string;
  zone: Zone;
  _count: {
    locations: number;
  };
}

export default function ClustersManager() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCluster, setEditingCluster] = useState<Cluster | null>(null);
  const [filterZoneId, setFilterZoneId] = useState<string>("all");

  const form = useForm<ClusterFormData>({
    resolver: zodResolver(clusterFormSchema),
    defaultValues: {
      zoneId: "",
      name: "",
      description: "",
      order: 0,
      active: true,
    },
  });

  useEffect(() => {
    fetchZones();
    fetchClusters();
  }, []);
  const token = localStorage.getItem("accessToken");
  useEffect(() => {
    if (filterZoneId) {
      fetchClusters(filterZoneId);
    } else {
      fetchClusters();
    }
  }, [filterZoneId]);

  useEffect(() => {
    if (editingCluster) {
      form.reset({
        zoneId: editingCluster.zoneId,
        name: editingCluster.name,
        description: editingCluster.description || "",
        order: editingCluster.order,
        active: editingCluster.active,
      });
    } else {
      form.reset({
        zoneId: "all",
        name: "",
        description: "",
        order: 0,
        active: true,
      });
    }
  }, [editingCluster, form]);

  const fetchZones = async () => {
    try {
      const response = await fetch("/api/admin/zones", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

  const fetchClusters = async (zoneId?: string) => {
    try {
      const url = zoneId
        ? `/api/admin/clusters?zoneId=${zoneId}`
        : "/api/admin/clusters";
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch clusters");
      const data = await response.json();
      setClusters(data);
    } catch (error) {
      toast.error("Failed to load clusters");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ClusterFormData) => {
    try {
      const url = editingCluster
        ? `/api/admin/clusters/${editingCluster.id}`
        : "/api/admin/clusters";
      const method = editingCluster ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save cluster");

      toast.success(editingCluster ? "Cluster updated" : "Cluster created");
      setDialogOpen(false);
      setEditingCluster(null);
      form.reset();
      fetchClusters(filterZoneId);
    } catch (error) {
      toast.error("Failed to save cluster");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cluster?")) return;

    try {
      const response = await fetch(`/api/admin/clusters/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete cluster");

      toast.success("Cluster deleted");
      fetchClusters(filterZoneId);
    } catch (error) {
      toast.error("Failed to delete cluster");
      console.error(error);
    }
  };

  const handleEdit = (cluster: Cluster) => {
    setEditingCluster(cluster);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingCluster(null);
      form.reset();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading clusters...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex-col md:flex-row  items-center gap-4">
          <div className="">
            <Label htmlFor="filter-zone">Filter by Zone</Label>
            <Select value={filterZoneId} onValueChange={setFilterZoneId}>
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
          <p className="text-sm text-muted-foreground mt-6">
            Total clusters: {clusters.length}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="mt-6">
              <Plus className="w-4 h-4 mr-2" />
              Add Cluster
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCluster ? "Edit Cluster" : "Create Cluster"}
              </DialogTitle>
              <DialogDescription>
                {editingCluster
                  ? "Update the cluster details below"
                  : "Add a new cluster within a zone"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="zoneId">Zone *</Label>
                <Select
                  value={form.watch("zoneId") || "none"}
                  onValueChange={(value) => form.setValue("zoneId", value)}
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

              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="e.g., Upper Hill"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Brief description of the cluster"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="order">Order *</Label>
                <Input
                  id="order"
                  type="number"
                  {...form.register("order",{valueAsNumber:true})}
                  min="0"
                />
                {form.formState.errors.order && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.order.message}
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
                    : editingCluster
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
              <TableHead>Order</TableHead>
              <TableHead>Locations</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clusters.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No clusters found. Create your first cluster to get started.
                </TableCell>
              </TableRow>
            ) : (
              clusters.map((cluster) => (
                <TableRow key={cluster.id}>
                  <TableCell className="font-medium">{cluster.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cluster.zone.color }}
                      />
                      <span>{cluster.zone.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{cluster.order}</TableCell>
                  <TableCell>{cluster._count.locations}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        cluster.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {cluster.active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(cluster)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cluster.id)}
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
  );
}
