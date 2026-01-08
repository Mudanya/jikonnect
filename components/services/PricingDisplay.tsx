import { BookingPricing, calculateBookingPrice, ServicePricing } from "@/lib/pricing/pricingUtils";
import { Clock, Package, Calculator, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

interface PricingDisplayProps {
  pricingType: 'HOURLY' | 'FIXED' | 'PER_UNIT' | 'CUSTOM';
  hourlyRate?: number;
  fixedPrice?: number;
  priceMin?: number;
  priceMax?: number;
  estimatedHours?: number;
  size?: 'small' | 'medium' | 'large';
}

export function PricingDisplay({
  pricingType,
  hourlyRate,
  fixedPrice,
  priceMin,
  priceMax,
  estimatedHours,
  size = 'medium',
}: PricingDisplayProps) {
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24,
  };

  const getIcon = () => {
    const iconSize = iconSizes[size];
    switch (pricingType) {
      case 'HOURLY':
        return <Clock size={iconSize} className="text-blue-600" />;
      case 'FIXED':
        return <Package size={iconSize} className="text-green-600" />;
      case 'PER_UNIT':
        return <Calculator size={iconSize} className="text-purple-600" />;
      case 'CUSTOM':
        return <DollarSign size={iconSize} className="text-orange-600" />;
    }
  };

  const getPriceText = () => {
    switch (pricingType) {
      case 'HOURLY':
        if (!hourlyRate) return 'Price not set';
        return (
          <div>
            <span className="font-bold">KES {hourlyRate.toLocaleString()}</span>
            <span className="text-gray-600">/hour</span>
            {estimatedHours && (
              <div className="text-xs text-gray-500 mt-1">
                ≈ KES {(hourlyRate * estimatedHours).toLocaleString()} for {estimatedHours}h
              </div>
            )}
          </div>
        );

      case 'FIXED':
        if (!fixedPrice) return 'Price not set';
        return (
          <div>
            <span className="font-bold">KES {fixedPrice.toLocaleString()}</span>
            <span className="text-gray-600"> per task</span>
          </div>
        );

      case 'PER_UNIT':
        if (!fixedPrice) return 'Price not set';
        return (
          <div>
            <span className="font-bold">KES {fixedPrice.toLocaleString()}</span>
            <span className="text-gray-600"> per unit</span>
          </div>
        );

      case 'CUSTOM':
        if (priceMin && priceMax) {
          return (
            <div>
              <span className="font-bold">
                KES {priceMin.toLocaleString()} - {priceMax.toLocaleString()}
              </span>
              <div className="text-xs text-gray-500 mt-1">Custom quote</div>
            </div>
          );
        }
        if (priceMin) {
          return (
            <div>
              <span className="font-bold">From KES {priceMin.toLocaleString()}</span>
              <div className="text-xs text-gray-500 mt-1">Custom quote</div>
            </div>
          );
        }
        return 'Contact for pricing';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${sizeClasses[size]}`}>
      {getIcon()}
      <div>{getPriceText()}</div>
    </div>
  );
}

// ============================================
// SERVICE CARD WITH PRICING
// ============================================

// Example usage in a service card
export function ServiceCard({ service }: { service: any }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold mb-2">{service.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{service.description}</p>

      {/* Pricing Display */}
      <PricingDisplay
        pricingType={service.pricingType}
        hourlyRate={service.hourlyRate}
        fixedPrice={service.fixedPrice}
        priceMin={service.priceMin}
        priceMax={service.priceMax}
        estimatedHours={service.estimatedHours}
        size="medium"
      />

      <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
        Book Now
      </button>
    </div>
  );
}


export function BookingPriceCalculator({
  service,
  onPriceCalculated,
}: {
  service: ServicePricing;
  onPriceCalculated: (price: number) => void;
}) {
  const [hours, setHours] = useState(service.estimatedHours || 1);
  const [quantity, setQuantity] = useState(1);

  const calculatePrice = () => {
    const booking: BookingPricing = {
      pricingType: service.pricingType,
      estimatedHours: hours,
      quantity,
    };
    return calculateBookingPrice(service, booking);
  };

  const price = calculatePrice();

  useEffect(() => {
    onPriceCalculated(price);
  }, [hours, quantity]);

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold mb-3">Calculate Price</h3>

      {/* Hourly inputs */}
      {service.pricingType === 'HOURLY' && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Number of Hours
          </label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(parseFloat(e.target.value) || 1)}
            min="0.5"
            step="0.5"
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      )}

      {/* Per unit inputs */}
      {service.pricingType === 'PER_UNIT' && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Quantity
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            min="1"
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      )}

      {/* Price display */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Estimated Total:</span>
          <span className="text-2xl font-bold text-blue-600">
            KES {price.toLocaleString()}
          </span>
        </div>

        
      </div>
    </div>
  );
}