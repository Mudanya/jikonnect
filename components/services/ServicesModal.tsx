import { Check, Plus, X, DollarSign, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ServicePricingForm from "./ServicePricingForm";

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  services: Service[];
}

interface Service {
  id: string;
  name: string;
  slug: string;
  skillLevels: string[];
  categoryId: string;
  category?: {
    name: string;
    icon: string | null;
  };
  // Pricing fields
  pricingType?: "HOURLY" | "FIXED" | "CUSTOM" | "PER_UNIT";
  hourlyRate?: number;
  fixedPrice?: number;
  priceMin?: number;
  priceMax?: number;
  estimatedHours?: number;
}

interface ServiceWithPricing {
  serviceId: string;
  pricingType: "HOURLY" | "FIXED" | "CUSTOM" | "PER_UNIT";
  hourlyRate?: number;
  fixedPrice?: number;
  priceMin?: number;
  priceMax?: number;
  estimatedHours?: number;
}

const ServicesModal = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [myServices, setMyServices] = useState<Service[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Pricing configuration state
  const [showPricingStep, setShowPricingStep] = useState(false);
  const [servicePricing, setServicePricing] = useState<Record<string, any>>({});
  const [currentPricingService, setCurrentPricingService] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const categoriesRes = await fetch("/api/services");
      const categoriesData = await categoriesRes.json();
      if (categoriesData.success) {
        setCategories(categoriesData.data);
      }

      const token = localStorage.getItem("accessToken");
      const myServicesRes = await fetch("/api/provider/services", {
        headers: {
          "Content-Type": "Application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const myServicesData = await myServicesRes.json();
      if (myServicesData.success) {
        setMyServices(myServicesData.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToPricing = () => {
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }

    // Initialize pricing for each selected service with defaults
    const initialPricing: Record<string, any> = {};
    selectedServices.forEach((serviceId) => {
      initialPricing[serviceId] = {
        pricingType: "HOURLY",
        hourlyRate: undefined,
        estimatedHours: undefined,
      };
    });
    setServicePricing(initialPricing);
    setShowPricingStep(true);
  };

  const handleAddServices = async () => {
    // Validate that all services have pricing configured
    for (const serviceId of selectedServices) {
      const pricing = servicePricing[serviceId];
      if (!pricing) {
        toast.error("Please configure pricing for all services");
        return;
      }

      // Validate based on pricing type
      if (pricing.pricingType === "HOURLY" && !pricing.hourlyRate) {
        toast.error("Please set hourly rate for all services");
        return;
      }
      if (
        (pricing.pricingType === "FIXED" || pricing.pricingType === "PER_UNIT") &&
        !pricing.fixedPrice
      ) {
        toast.error("Please set price for all services");
        return;
      }
      if (pricing.pricingType === "CUSTOM" && !pricing.priceMin) {
        toast.error("Please set minimum price for custom services");
        return;
      }
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      
      // Prepare services with pricing
      const servicesWithPricing: ServiceWithPricing[] = selectedServices.map(
        (serviceId) => ({
          serviceId,
          ...servicePricing[serviceId],
        })
      );

      const response = await fetch("/api/provider/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ services: servicesWithPricing }),
      });

      const data = await response.json();
      if (data.success) {
        setMyServices(data.data);
        toast.success("Services added successfully!");
        closeModal();
      } else {
        toast.error(data.message || "Failed to add services");
      }
    } catch (error) {
      console.error("Error adding services:", error);
      toast.error("Failed to add services");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to remove this service?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/provider/services", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ serviceId }),
      });

      const data = await response.json();
      if (data.success) {
        setMyServices(myServices.filter((s) => s.id !== serviceId));
        toast.success("Service removed");
      } else {
        toast.error(data.message || "Failed to remove service");
      }
    } catch (error) {
      console.error("Error removing service:", error);
      toast.error("Failed to remove service");
    }
  };

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowPricingStep(false);
    setSelectedServices([]);
    setSelectedCategoryId("");
    setServicePricing({});
    setCurrentPricingService(null);
  };

  const handleBackToSelection = () => {
    setShowPricingStep(false);
    setCurrentPricingService(null);
  };

  const updateServicePricing = (serviceId: string, pricing: any) => {
    setServicePricing((prev) => ({
      ...prev,
      [serviceId]: pricing,
    }));
  };

  const getAvailableServicesForCategory = () => {
    if (!selectedCategoryId) return [];
    const myServiceIds = myServices.map((s) => s.id);
    const category = categories.find((c) => c.id === selectedCategoryId);
    if (!category) return [];
    return category.services.filter((s) => !myServiceIds.includes(s.id));
  };

  const getAvailableCategories = () => {
    const myServiceIds = myServices.map((s) => s.id);
    return categories.filter((cat) => {
      return cat.services.some((s) => !myServiceIds.includes(s.id));
    });
  };

  const groupedMyServices = categories
    .map((cat) => ({
      ...cat,
      services: myServices.filter((s) => s.category?.name === cat.name),
    }))
    .filter((cat) => cat.services.length > 0);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Format price display
  const formatPriceDisplay = (service: Service) => {
    if (!service.pricingType) return "No pricing set";

    switch (service.pricingType) {
      case "HOURLY":
        return service.hourlyRate
          ? `KES ${service.hourlyRate.toLocaleString()}/hr`
          : "Set rate";
      case "FIXED":
        return service.fixedPrice
          ? `KES ${service.fixedPrice.toLocaleString()}`
          : "Set price";
      case "PER_UNIT":
        return service.fixedPrice
          ? `KES ${service.fixedPrice.toLocaleString()}/unit`
          : "Set price";
      case "CUSTOM":
        if (service.priceMin && service.priceMax) {
          return `KES ${service.priceMin.toLocaleString()}-${service.priceMax.toLocaleString()}`;
        }
        return "Custom quote";
      default:
        return "No pricing";
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center cursor-pointer gap-2 px-6 py-3 bg-jiko-primary text-white rounded-lg hover:bg-jiko-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Services
        </button>
      </div>

      {myServices.length === 0 ? (
        <div className="text-center py-12 bg-jiko-secondary/5 rounded-lg border-2 border-dashed border-jiko-secondary/80">
          <div className="text-6xl mb-4">🔧</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No services added yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add services to let clients know what you offer
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex cursor-pointer items-center gap-2 px-6 py-3 bg-jiko-secondary text-jiko-primary rounded-lg hover:bg-jiko-secondary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Your First Service
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedMyServices.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {category.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {category.services.length} services
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.services.map((service) => (
                  <div
                    key={service.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-jiko-secondary transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {service.name}
                        </h3>
                        {/* Pricing Display */}
                        <div className="flex items-center gap-1 mt-1 text-sm text-blue-600 font-medium">
                          <DollarSign className="w-4 h-4" />
                          {formatPriceDisplay(service)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveService(service.id)}
                        className="text-red-600 cursor-pointer hover:bg-red-50 p-1 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {service.skillLevels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {service.skillLevels.map((level, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                          >
                            {level}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Services Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {showPricingStep ? "Configure Pricing" : "Add Services"}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {showPricingStep
                      ? `Step 2 of 2: Set prices for ${selectedServices.length} service(s)`
                      : "Step 1 of 2: Select services"}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step 1: Service Selection */}
              {!showPricingStep && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Category
                    </label>
                    <Select
                      value={selectedCategoryId}
                      onValueChange={(value) => {
                        setSelectedCategoryId(value);
                        setSelectedServices([]);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a category..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Categories</SelectLabel>
                          {getAvailableCategories().map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.icon} {cat.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCategory && selectedServices.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        {selectedServices.length} service(s) selected from{" "}
                        {selectedCategory.name}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {!showPricingStep ? (
                // Step 1: Service Selection
                <>
                  {!selectedCategoryId ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>Please select a category to view available services</p>
                    </div>
                  ) : getAvailableServicesForCategory().length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>All services from this category have been added</p>
                      <button
                        onClick={() => setSelectedCategoryId("")}
                        className="mt-4 cursor-pointer text-jiko-secondary hover:underline"
                      >
                        Choose another category
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-4">
                        Select services from{" "}
                        <strong>{selectedCategory?.name}</strong>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getAvailableServicesForCategory().map((service) => (
                          <div
                            key={service.id}
                            onClick={() => toggleServiceSelection(service.id)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedServices.includes(service.id)
                                ? "border-jiko-secondary bg-jiko-secondary/5"
                                : "border-gray-200 hover:border-jiko-secondary/50"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-gray-900 flex-1">
                                {service.name}
                              </h3>
                              {selectedServices.includes(service.id) && (
                                <div className="w-6 h-6 bg-jiko-secondary rounded-full flex items-center justify-center flex-shrink-0">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                            {service.skillLevels.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {service.skillLevels
                                  .slice(0, 2)
                                  .map((level, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                                    >
                                      {level}
                                    </span>
                                  ))}
                                {service.skillLevels.length > 2 && (
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                    +{service.skillLevels.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Step 2: Pricing Configuration
                <div className="space-y-6">
                  {selectedServices.map((serviceId, index) => {
                    const service = getAvailableServicesForCategory().find(
                      (s) => s.id === serviceId
                    );
                    if (!service) return null;

                    const isExpanded = currentPricingService === serviceId;

                    return (
                      <div
                        key={serviceId}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div
                          onClick={() =>
                            setCurrentPricingService(
                              isExpanded ? null : serviceId
                            )
                          }
                          className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between"
                        >
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {index + 1}. {service.name}
                            </h3>
                            {servicePricing[serviceId] && (
                              <p className="text-sm text-blue-600 mt-1">
                                {servicePricing[serviceId].pricingType} pricing
                                configured ✓
                              </p>
                            )}
                          </div>
                          <Edit className="w-5 h-5 text-gray-400" />
                        </div>

                        {isExpanded && (
                          <div className="p-6">
                            <ServicePricingForm
                              value={
                                servicePricing[serviceId] || {
                                  pricingType: "HOURLY",
                                }
                              }
                              onChange={(pricing) =>
                                updateServicePricing(serviceId, pricing)
                              }
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between gap-3">
              {showPricingStep && (
                <button
                  onClick={handleBackToSelection}
                  className="px-6 py-2 cursor-pointer border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  ← Back
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 cursor-pointer border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>

                {!showPricingStep ? (
                  <button
                    onClick={handleContinueToPricing}
                    disabled={selectedServices.length === 0}
                    className="px-6 py-2 bg-jiko-secondary cursor-pointer text-jiko-primary rounded-lg hover:bg-jiko-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Continue to Pricing →
                  </button>
                ) : (
                  <button
                    onClick={handleAddServices}
                    disabled={submitting}
                    className="px-6 py-2 bg-jiko-secondary cursor-pointer text-jiko-primary rounded-lg hover:bg-jiko-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Add {selectedServices.length} Service
                        {selectedServices.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesModal;