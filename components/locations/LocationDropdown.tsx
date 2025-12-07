// components/locations/LocationDropdown.tsx
"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { FieldError } from "react-hook-form";

type LocationDropdownProps = {
  value?: string;
  onChange: (locationId: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

type Location = {
  id: string;
  name: string;
  zone: { name: string; color: string };
  cluster?: { name: string };
};

export function LocationDropdown({
  value,
  onChange,
  placeholder = "Select location",
  required = false,
  className = "",
}: LocationDropdownProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllLocations();
  }, []);

  const fetchAllLocations = async () => {
    try {
      const response = await fetch("/api/locations/zones");
      const data = await response.json();

      // Flatten all locations from all zones
      const allLocations: Location[] = [];

      data.data.forEach((zone: any) => {
        // Add locations in clusters
        zone.clusters.forEach((cluster: any) => {
          cluster.locations.forEach((loc: any) => {
            allLocations.push({
              id: loc.id,
              name: loc.name,
              zone: { name: zone.name, color: zone.color },
              cluster: { name: cluster.name },
            });
          });
        });

        // Add standalone locations
        zone.locations.forEach((loc: any) => {
          allLocations.push({
            id: loc.id,
            name: loc.name,
            zone: { name: zone.name, color: zone.color },
          });
        });
      });

      // Sort alphabetically
      allLocations.sort((a, b) => a.name.localeCompare(b.name));

      setLocations(allLocations);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      <Select
        value={value || ""}
        onValueChange={(value) => onChange(value)}
        key={`select-${loading}-${locations.length}-${value}`}
      >
        <SelectTrigger
          className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            required && "border-red-300"
          }`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{placeholder}</SelectLabel>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name} ({location.cluster?.name || location.zone.name})
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {/* <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={loading}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100"
      >
        <option value="">{loading ? "Loading..." : placeholder}</option>

        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name} ({location.cluster?.name || location.zone.name})
          </option>
        ))}
      </select> */}
    </div>
  );
}
