"use client";

import { Calculator, Clock, Package } from "lucide-react";
import { useState } from "react";

interface ServicePricingFormProps {
  value: {
    pricingType: "HOURLY" | "FIXED" | "PER_UNIT";
    hourlyRate?: number;
    fixedPrice?: number;
   
    estimatedHours?: number;
  };
  onChange: (pricing: any) => void;
}

export default function ServicePricingForm({
  value,
  onChange,
}: ServicePricingFormProps) {
  const [pricingType, setPricingType] = useState(value.pricingType || "HOURLY");

  const handlePricingTypeChange = (type: string) => {
    setPricingType(type as any);
    onChange({
      ...value,
      pricingType: type,
      // Clear irrelevant fields
      hourlyRate: type === "HOURLY" ? value.hourlyRate : undefined,
      fixedPrice: type === "FIXED" ? value.fixedPrice : undefined,
     
    });
  };

  return (
    <div className="space-y-6">
      {/* Pricing Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Pricing Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Hourly */}
          <button
            type="button"
            onClick={() => handlePricingTypeChange("HOURLY")}
            className={`p-4 border-2 rounded-lg transition ${
              pricingType === "HOURLY"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Clock
              size={24}
              className={`mx-auto mb-2 ${
                pricingType === "HOURLY" ? "text-blue-600" : "text-gray-400"
              }`}
            />
            <p
              className={`text-sm font-medium ${
                pricingType === "HOURLY" ? "text-blue-900" : "text-gray-700"
              }`}
            >
              Hourly Rate
            </p>
            <p className="text-xs text-gray-500 mt-1">Per hour pricing</p>
          </button>

          {/* Fixed */}
          <button
            type="button"
            onClick={() => handlePricingTypeChange("FIXED")}
            className={`p-4 border-2 rounded-lg transition ${
              pricingType === "FIXED"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Package
              size={24}
              className={`mx-auto mb-2 ${
                pricingType === "FIXED" ? "text-blue-600" : "text-gray-400"
              }`}
            />
            <p
              className={`text-sm font-medium ${
                pricingType === "FIXED" ? "text-blue-900" : "text-gray-700"
              }`}
            >
              Fixed Price
            </p>
            <p className="text-xs text-gray-500 mt-1">Per task pricing</p>
          </button>

          {/* Per Unit */}
          <button
            type="button"
            onClick={() => handlePricingTypeChange("PER_UNIT")}
            className={`p-4 border-2 rounded-lg transition ${
              pricingType === "PER_UNIT"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Calculator
              size={24}
              className={`mx-auto mb-2 ${
                pricingType === "PER_UNIT" ? "text-blue-600" : "text-gray-400"
              }`}
            />
            <p
              className={`text-sm font-medium ${
                pricingType === "PER_UNIT" ? "text-blue-900" : "text-gray-700"
              }`}
            >
              Per Unit
            </p>
            <p className="text-xs text-gray-500 mt-1">Per room/item/sqft</p>
          </button>

          {/* Custom */}
         
        </div>
      </div>

      {/* Pricing Details */}
      <div className="bg-gray-50 rounded-lg p-4">
        {/* Hourly Rate */}
        {pricingType === "HOURLY" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hourly Rate (KES)
              </label>
              <input
                type="number"
                value={value.hourlyRate || ""}
                onChange={(e) =>
                  onChange({
                    ...value,
                    hourlyRate: parseFloat(e.target.value) || undefined,
                  })
                }
                placeholder="e.g., 500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Hours (Optional)
              </label>
              <input
                type="number"
                step="0.5"
                value={value.estimatedHours || ""}
                onChange={(e) =>
                  onChange({
                    ...value,
                    estimatedHours: parseFloat(e.target.value) || undefined,
                  })
                }
                placeholder="e.g., 2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Typical duration for this service
              </p>
            </div>
          </div>
        )}

        {/* Fixed Price */}
        {pricingType === "FIXED" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fixed Price (KES)
              </label>
              <input
                type="number"
                value={value.fixedPrice || ""}
                onChange={(e) =>
                  onChange({
                    ...value,
                    fixedPrice: parseFloat(e.target.value) || undefined,
                  })
                }
                placeholder="e.g., 5000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Hours (Optional)
              </label>
              <input
                type="number"
                step="0.5"
                value={value.estimatedHours || ""}
                onChange={(e) =>
                  onChange({
                    ...value,
                    estimatedHours: parseFloat(e.target.value) || undefined,
                  })
                }
                placeholder="e.g., 3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                How long this task typically takes
              </p>
            </div>
          </div>
        )}

        {/* Per Unit */}
        {pricingType === "PER_UNIT" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Per Unit (KES)
            </label>
            <input
              type="number"
              value={value.fixedPrice || ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  fixedPrice: parseFloat(e.target.value) || undefined,
                })
              }
              placeholder="e.g., 1000 per room"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              Examples: KES 1,000 per room, KES 500 per sqft, KES 200 per item
            </p>
          </div>
        )}

      
      </div>

      {/* Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900 mb-2">Pricing Preview:</p>
        <div className="text-sm text-blue-800">
          {pricingType === "HOURLY" && value.hourlyRate && (
            <p>
              KES {value.hourlyRate.toLocaleString()}/hour
              {value.estimatedHours && (
                <span className="text-blue-600">
                  {" "}
                  (≈ KES {(value.hourlyRate * value.estimatedHours).toLocaleString()}{" "}
                  for {value.estimatedHours}h)
                </span>
              )}
            </p>
          )}
          {pricingType === "FIXED" && value.fixedPrice && (
            <p>KES {value.fixedPrice.toLocaleString()} per task</p>
          )}
          {pricingType === "PER_UNIT" && value.fixedPrice && (
            <p>KES {value.fixedPrice.toLocaleString()} per unit</p>
          )}
         
        </div>
      </div>
    </div>
  );
}