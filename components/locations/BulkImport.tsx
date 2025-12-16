"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Upload, Download, AlertCircle } from "lucide-react";

interface BulkImportProps {
  onImportComplete: () => void;
}

export default function BulkImport({ onImportComplete }: BulkImportProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [jsonData, setJsonData] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{
    created: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const token = localStorage.getItem("accessToken");
  const handleImport = async () => {
    try {
      setImporting(true);
      setResults(null);

      // Parse JSON
      const locations = JSON.parse(jsonData);

      if (!Array.isArray(locations)) {
        toast.error("Data must be an array of locations");
        return;
      }

      // Send to API
      const response = await fetch("/api/admin/locations/bulk-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ locations }),
      });

      if (!response.ok) {
        throw new Error("Import failed");
      }

      const data = await response.json();
      setResults(data);

      if (data.created > 0) {
        toast.success(`Successfully imported ${data.created} locations`);
        onImportComplete();
      }

      if (data.skipped > 0) {
        toast.warning(`Skipped ${data.skipped} locations`);
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error("Invalid JSON format");
      } else {
        toast.error("Failed to import locations");
      }
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        zoneName: "Westlands",
        clusterName: "Upper Hill",
        locationName: "Kilimani",
        latitude: -1.2921,
        longitude: 36.7856,
        matchingRadius: 5,
      },
      {
        zoneName: "Westlands",
        locationName: "Parklands",
        latitude: -1.2647,
        longitude: 36.8219,
        matchingRadius: 5,
      },
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "locations-template.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Locations</DialogTitle>
          <DialogDescription>
            Import multiple locations from JSON data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Make sure to create zones and clusters first before importing
              locations. Locations with duplicate names will be skipped.
            </AlertDescription>
          </Alert>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">JSON Data</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={downloadTemplate}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>
            <Textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder={`[
  {
    "zoneName": "Westlands",
    "clusterName": "Upper Hill",
    "locationName": "Kilimani",
    "latitude": -1.2921,
    "longitude": 36.7856,
    "matchingRadius": 5
  }
]`}
              rows={15}
              className="font-mono text-sm"
            />
          </div>

          {results && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Import Results:</p>
                  <p className="text-green-600">Created: {results.created}</p>
                  <p className="text-yellow-600">Skipped: {results.skipped}</p>
                  {results.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold text-red-600">Errors:</p>
                      <ul className="list-disc list-inside text-sm">
                        {results.errors.slice(0, 10).map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                        {results.errors.length > 10 && (
                          <li>... and {results.errors.length - 10} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setJsonData("");
                setResults(null);
              }}
            >
              Close
            </Button>
            <Button onClick={handleImport} disabled={importing || !jsonData}>
              {importing ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
