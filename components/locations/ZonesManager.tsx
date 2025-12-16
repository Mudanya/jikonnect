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

const zoneFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  order: z.number().min(0),
  active: z.boolean(),
});

type ZoneFormData = z.infer<typeof zoneFormSchema>;

interface Zone extends ZoneFormData {
  id: string;
  slug: string;
  createdAt: string;
  _count: {
    clusters: number;
    locations: number;
  };
}

export default function ZonesManager() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  const form = useForm<ZoneFormData>({
    resolver: zodResolver(zoneFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6",
      order: 0,
      active: true,
    },
  });
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    if (editingZone) {
      form.reset({
        name: editingZone.name,
        description: editingZone.description || "",
        color: editingZone.color,
        order: editingZone.order,
        active: editingZone.active,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        color: "#3B82F6",
        order: 0,
        active: true,
      });
    }
  }, [editingZone, form]);

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
      setZones(data);
    } catch (error) {
      toast.error("Failed to load zones");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ZoneFormData) => {
    try {
      const url = editingZone
        ? `/api/admin/zones/${editingZone.id}`
        : "/api/admin/zones";
      const method = editingZone ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save zone");

      toast.success(editingZone ? "Zone updated" : "Zone created");
      setDialogOpen(false);
      setEditingZone(null);
      form.reset();
      fetchZones();
    } catch (error) {
      toast.error("Failed to save zone");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this zone?")) return;

    try {
      const response = await fetch(`/api/admin/zones/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete zone");

      toast.success("Zone deleted");
      fetchZones();
    } catch (error) {
      toast.error("Failed to delete zone");
      console.error(error);
    }
  };

  const handleEdit = (zone: Zone) => {
    setEditingZone(zone);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingZone(null);
      form.reset();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading zones...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex-col gap-2 md:gap-0 md:flex-row justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Total zones: {zones.length}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Zone
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingZone ? "Edit Zone" : "Create Zone"}
              </DialogTitle>
              <DialogDescription>
                {editingZone
                  ? "Update the zone details below"
                  : "Add a new geographical zone"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="e.g., Westlands"
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
                  placeholder="Brief description of the zone"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="color">Color *</Label>
                  <Input
                    id="color"
                    type="color"
                    {...form.register("color")}
                    className="h-10"
                  />
                  {form.formState.errors.color && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.color.message}
                    </p>
                  )}
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
                    : editingZone
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
              <TableHead>Color</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Clusters</TableHead>
              <TableHead>Locations</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No zones found. Create your first zone to get started.
                </TableCell>
              </TableRow>
            ) : (
              zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: zone.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {zone.color}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{zone.order}</TableCell>
                  <TableCell>{zone._count.clusters}</TableCell>
                  <TableCell>{zone._count.locations}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        zone.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {zone.active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(zone)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(zone.id)}
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
