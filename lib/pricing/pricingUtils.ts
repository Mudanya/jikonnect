import { getSettingsByKey } from "@/services/queries/admin.query";

export interface ServicePricing {
  pricingType: 'HOURLY' | 'FIXED' | 'PER_UNIT' ;
  hourlyRate?: number;
  fixedPrice?: number;
  estimatedHours?: number;
}

export interface BookingPricing {
  pricingType: 'HOURLY' | 'FIXED' | 'PER_UNIT' ;
  hourlyRate?: number;
  estimatedHours?: number;
  quantity?: number;
  unitType?: string;
  unitPrice?: number;
  customAmount?: number;
}


export function calculateBookingPrice(
  service: ServicePricing,
  booking?: BookingPricing
): number {
  switch (service.pricingType) {
    case 'HOURLY':
      const rate = service.hourlyRate || 0;
      const hours = booking?.estimatedHours || service.estimatedHours || 1;
      return rate * hours;

    case 'FIXED':
      return service.fixedPrice || 0;

    case 'PER_UNIT':
      const unitPrice = booking?.unitPrice || 0;
      const quantity = booking?.quantity || 1;
      return unitPrice * quantity;

    // case 'CUSTOM':
    //   // For custom pricing, use the negotiated amount
    //   return booking?.customAmount || service.priceMin || 0;

    default:
      return 0;
  }
}


export function formatPriceDisplay(service: ServicePricing): string {
  switch (service.pricingType) {
    case 'HOURLY':
      if (!service.hourlyRate) return 'Price not set';
      const hourlyDisplay = `KES ${service.hourlyRate.toLocaleString()}/hour`;
      if (service.estimatedHours) {
        const total = service.hourlyRate * service.estimatedHours;
        return `${hourlyDisplay} (≈ KES ${total.toLocaleString()} for ${service.estimatedHours}h)`;
      }
      return hourlyDisplay;

    case 'FIXED':
      if (!service.fixedPrice) return 'Price not set';
      return `KES ${service.fixedPrice.toLocaleString()} per task`;

    case 'PER_UNIT':
      if (!service.fixedPrice) return 'Price not set';
      return `KES ${service.fixedPrice.toLocaleString()} per unit`;

    // case 'CUSTOM':
    //   if (service.priceMin && service.priceMax) {
    //     return `KES ${service.priceMin.toLocaleString()} - ${service.priceMax.toLocaleString()}`;
    //   }
    //   if (service.priceMin) {
    //     return `From KES ${service.priceMin.toLocaleString()}`;
    //   }
    //   return 'Custom quote - Contact for pricing';

    default:
      return 'Price not available';
  }
}


export function getPricingTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    HOURLY: 'Hourly Rate',
    FIXED: 'Fixed Price',
    PER_UNIT: 'Per Unit',
    CUSTOM: 'Custom Quote',
  };
  return labels[type] || type;
}


export async function calculateCommission(
  amount: number,

): Promise<{
  amount: number;
  commission: number;
  providerPayout: number;
}> {
  const platformDetails = await getSettingsByKey('platform')
  const commissionRate = (+platformDetails!.commissionRate) / 100 || 0.10;
  const commission = amount * commissionRate;
  const providerPayout = amount - commission;

  return {
    amount,
    commission,
    providerPayout,
  };
}

export default {
  calculateBookingPrice,
  formatPriceDisplay,
  getPricingTypeLabel,
  calculateCommission,
};