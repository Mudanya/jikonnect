// components/locations/LocationSelector.tsx
"use client";

import { useState, useEffect } from "react";
import { MapPin, Search, ChevronRight } from "lucide-react";

type Location = {
  id: string;
  name: string;
  slug: string;
};

type Cluster = {
  id: string;
  name: string;
  slug: string;
  locations: Location[];
};

type Zone = {
  id: string;
  name: string;
  slug: string;
  color: string;
  clusters: Cluster[];
  locations: Location[];
};

type LocationSelectorProps = {
  value?: string; // locationId
  onChange: (locationId: string, locationName: string) => void;
  placeholder?: string;
  required?: boolean;
};

export function LocationSelector({
  value,
  onChange,
  placeholder = "Select your location",
  required = false,
}: LocationSelectorProps) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"zone" | "cluster" | "location">("zone");
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch zones on mount
  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/locations/zones");
      const data = await response.json();
      setZones(data.zones);
    } catch (error) {
      console.error("Error fetching zones:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search locations
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(async () => {
        try {
          setIsSearching(true);
          const response = await fetch(
            `/api/locations/search?q=${searchQuery}`
          );
          const data = await response.json();
          setSearchResults(data.locations || []);
        } catch (error) {
          console.error("Error searching:", error);
        } finally {
          setIsSearching(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleZoneSelect = (zone: Zone) => {
    setSelectedZone(zone);

    // If zone has clusters, go to cluster selection
    if (zone.clusters && zone.clusters.length > 0) {
      setStep("cluster");
    } else {
      // If no clusters, go straight to location selection
      setStep("location");
    }
  };

  const handleClusterSelect = (cluster: Cluster) => {
    setSelectedCluster(cluster);
    setStep("location");
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    onChange(location.id, location.name);
    setSearchQuery("");
    setSearchResults([]);
  };

  const resetSelection = () => {
    setSelectedZone(null);
    setSelectedCluster(null);
    setSelectedLocation(null);
    setStep("zone");
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for your location..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Search Results Dropdown */}
        {searchQuery.length >= 2 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleLocationSelect(location)}
                  className="w-full px-4 py-3 hover:bg-gray-50 text-left flex items-start gap-3 border-b last:border-b-0"
                >
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {location.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {location.cluster?.name && `${location.cluster.name} • `}
                      {location.zone.name}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No locations found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Current Selection Breadcrumb */}
      {(selectedZone || selectedCluster || selectedLocation) && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <button
            onClick={resetSelection}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Reset
          </button>
          {selectedZone && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{selectedZone.name}</span>
            </>
          )}
          {selectedCluster && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{selectedCluster.name}</span>
            </>
          )}
          {selectedLocation && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-900">
                {selectedLocation.name}
              </span>
            </>
          )}
        </div>
      )}

      {/* Step 1: Zone Selection */}
      {step === "zone" && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Select Your Area
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {zones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => handleZoneSelect(zone)}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                style={{ borderLeftColor: zone.color, borderLeftWidth: "4px" }}
              >
                <div className="font-medium text-gray-900">{zone.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {zone.clusters.length > 0
                    ? `${zone.clusters.length} clusters`
                    : `${zone.locations.length} locations`}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Cluster Selection */}
      {step === "cluster" && selectedZone && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Select Cluster in {selectedZone.name}
          </h3>
          <div className="space-y-2">
            {selectedZone.clusters.map((cluster) => (
              <button
                key={cluster.id}
                onClick={() => handleClusterSelect(cluster)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {cluster.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {cluster.locations.length} locations
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Location Selection */}
      {step === "location" && selectedZone && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Select Estate/Location
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(selectedCluster
              ? selectedCluster.locations
              : selectedZone.locations
            ).map((location) => (
              <button
                key={location.id}
                onClick={() => handleLocationSelect(location)}
                className="w-full p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left flex items-center gap-3"
              >
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">
                  {location.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
