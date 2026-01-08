"use client";
import { LocationDropdown } from "@/components/locations/LocationDropdown";
import Loading from "@/components/shared/Loading";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { getProviderProfile } from "@/services/apis/profile.api";
import {
  ArrowLeft,
  Award,
  CheckCircle,
  MapPin,
  Send,
  Star,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  pricingType: "HOURLY" | "FIXED" | "PER_UNIT" | "CUSTOM";
  hourlyRate?: number;
  fixedPrice?: number;
  priceMin?: number;
  priceMax?: number;
  estimatedHours?: number;
}

const SvcProvider = () => {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const providerId = params.id as string;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [providerData, setProviderData] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [bookingForm, setBookingForm] = useState({
    serviceId: "",
    serviceName: "",
    description: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: "1",
    quantity: "1",
    unitType: "room",
    location: "",
  });

  const [calculatedAmount, setCalculatedAmount] = useState(0);

  const loadProviderProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await getProviderProfile(providerId, token!);
      if (data.success) {
        setProviderData(data.data);
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      loadProviderProfile();
    }, 0);
  }, [providerId]);

  // Calculate amount when service or inputs change
  useEffect(() => {
    if (!selectedService) {
      setCalculatedAmount(0);
      return;
    }

    let amount = 0;
    switch (selectedService.pricingType) {
      case "HOURLY":
        amount =
          (selectedService.hourlyRate || 0) *
          parseFloat(bookingForm.duration || "1");
        break;
      case "FIXED":
        amount = selectedService.fixedPrice || 0;
        break;
      case "PER_UNIT":
        amount =
          (selectedService.fixedPrice || 0) *
          parseInt(bookingForm.quantity || "1");
        break;
      case "CUSTOM":
        amount = selectedService.priceMin || 0;
        break;
    }
    setCalculatedAmount(amount);
  }, [selectedService, bookingForm.duration, bookingForm.quantity]);

  const handleServiceSelect = (serviceName: string) => {
    // Find service by name from the services array
    const service = providerData.profile.services.find(
      (s: Service) => s.name === serviceName
    );

    console.log("Selected service:", service); // DEBUG
    console.log("Pricing type:", service?.pricingType); // DEBUG

    setSelectedService(service || null);
    setBookingForm({
      ...bookingForm,
      serviceId: service?.id || "",
      serviceName: service?.name || "",
      duration: "1",
      quantity: "1",
      unitType: "room",
    });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push("/login?redirect=/services/provider/" + providerId);
      return;
    }

    if (!selectedService) {
      toast.error("Please select a service");
      return;
    }

    // For CUSTOM pricing, redirect to quote request
    if (selectedService.pricingType === "CUSTOM") {
      router.push(
        `/quotes/request?providerId=${providerId}&serviceId=${selectedService.id}`
      );
      return;
    }

    setBookingLoading(true);
    try {
      const token = localStorage.getItem("accessToken");

      const bookingData: any = {
        providerId,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        scheduledDate: bookingForm.scheduledDate,
        scheduledTime: bookingForm.scheduledTime,
        location: bookingForm.location,
        description: bookingForm.description,
        pricingType: selectedService.pricingType,
      };

      // Add pricing-specific fields
      switch (selectedService.pricingType) {
        case "HOURLY":
          bookingData.hourlyRate = selectedService.hourlyRate;
          bookingData.duration = parseFloat(bookingForm.duration);
          break;
        case "FIXED":
          bookingData.fixedPrice = selectedService.fixedPrice;
          bookingData.estimatedHours = selectedService.estimatedHours;
          break;
        case "PER_UNIT":
          bookingData.unitPrice = selectedService.fixedPrice;
          bookingData.quantity = parseInt(bookingForm.quantity);
          bookingData.unitType = bookingForm.unitType;
          break;
      }

      console.log("Submitting booking data:", bookingData); // DEBUG

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Booking request sent successfully!");
        router.push("/bookings");
      } else {
        toast.error(data.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Failed to create booking:", error);
      toast.error("Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  };

  if (!mounted || loading) return <Loading />;

  if (!providerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-jiko-black mb-2">
            Provider not found
          </h2>
          <button
            onClick={() => router.push("/services")}
            className="text-jiko-primary hover:underline"
          >
            Back to search
          </button>
        </div>
      </div>
    );
  }

  const { profile, reviews, completedJobs } = providerData;

  // Format price display
  const formatServicePrice = (service: Service) => {
    switch (service.pricingType) {
      case "HOURLY":
        return `KES ${service.hourlyRate?.toLocaleString() || 0}/hour`;
      case "FIXED":
        return `KES ${service.fixedPrice?.toLocaleString() || 0} (Fixed)`;
      case "PER_UNIT":
        return `KES ${service.fixedPrice?.toLocaleString() || 0}/unit`;
      case "CUSTOM":
        if (service.priceMin && service.priceMax) {
          return `KES ${service.priceMin.toLocaleString()}-${service.priceMax.toLocaleString()}`;
        }
        return "Custom Quote";
      default:
        return "Price not set";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className=" px-4 py-4">
          <button
            onClick={() => router.push("/services")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back to search</span>
          </button>
        </div>
      </div>
      <div className=" px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Provider Info */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            {/* Provider Header */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-start space-x-2 md:space-x-6">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-linear-to-br from-jiko-primary to-jiko-secondary rounded-full flex items-center justify-center text-white text-xl md:text-3xl font-bold shrink-0">
                  {profile.user.firstName[0]}
                  {profile.user.lastName[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                      {profile.user.firstName} {profile.user.lastName}
                    </h1>
                    {profile.verificationStatus === "VERIFIED" && (
                      <CheckCircle className="text-blue-600" size={28} />
                    )}
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center space-x-4 text-gray-600 mb-4">
                    <span className="flex items-center">
                      <MapPin size={18} className="mr-1" />
                      {profile.location || "Location not set"}
                    </span>
                    <span className="flex items-center">
                      <Award size={18} className="mr-1" />
                      {profile.yearsOfExperience || 0} years experience
                    </span>
                  </div>
                  <div className="flex flex-col md:items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={
                            i < Math.floor(+profile.averageRating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                      <span className="ml-2 font-bold text-gray-900">
                        {(+profile.averageRating).toFixed(1)}
                      </span>
                      <span className="text-gray-500">
                        ({reviews.length} reviews)
                      </span>
                    </div>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">
                      {completedJobs} jobs completed
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* About */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {profile.bio || "No bio provided"}
              </p>
            </div>
            {/* Services */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-4">Services Offered</h2>
              <div className="space-y-3">
                {profile.services.map((service: Service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-xl"
                  >
                    <div>
                      <span className="font-medium text-blue-900">
                        {service.name}
                      </span>
                      <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {service.pricingType}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-blue-700">
                      {formatServicePrice(service)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Portfolio */}
            {profile.portfolios.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4">Portfolio</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {profile?.portfolios?.map((item: any) => (
                    <div
                      key={item.id}
                      className="rounded-xl overflow-hidden border"
                    >
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                        width={800}
                        height={600}
                      />
                      <div className="p-3">
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <p className="text-xs text-gray-600">{item.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Reviews */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-6">
                Reviews ({reviews.length})
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review: any) => (
                    <div
                      key={review.id}
                      className="pb-4 border-b last:border-b-0"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-linear-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {review.reviewer.firstName[0]}
                          {review.reviewer.lastName[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">
                              {review.reviewer.firstName}{" "}
                              {review.reviewer.lastName}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={
                                    i < review.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            {review.comment}
                          </p>
                          <div className="text-xs text-gray-500">
                            {review.booking.service} •{" "}
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No reviews yet</p>
              )}
            </div>
          </div>
          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border p-6 sticky top-28">
              {!showBookingForm ? (
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      router.push(
                        "/login?redirect=/services/provider/" + providerId
                      );
                      return;
                    }
                    setShowBookingForm(true);
                  }}
                  className="w-full py-3 bg-jiko-primary cursor-pointer hover:bg-jiko-primary/90 text-jiko-secondary rounded-xl font-bold hover:shadow-lg transition"
                >
                  Book Now
                </button>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  {/* Service Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Service *
                    </label>
                    <select
                      required
                      value={bookingForm.serviceName}
                      onChange={(e) => handleServiceSelect(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a service</option>
                      {profile.services.map((service: Service) => (
                        <option key={service.id} value={service.name}>
                          {service.name} - {formatServicePrice(service)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date *
                    </label>
                    <Input
                      type="date"
                      required
                      value={bookingForm.scheduledDate}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          scheduledDate: e.target.value,
                        })
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Time *
                    </label>
                    <Input
                      type="time"
                      required
                      value={bookingForm.scheduledTime}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          scheduledTime: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* HOURLY - Duration Input */}
                  {selectedService &&
                    selectedService.pricingType === "HOURLY" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Duration (hours) *
                        </label>
                        <Input
                          type="number"
                          required
                          min="0.5"
                          step="0.5"
                          value={bookingForm.duration}
                          onChange={(e) =>
                            setBookingForm({
                              ...bookingForm,
                              duration: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Rate: KES{" "}
                          {selectedService.hourlyRate?.toLocaleString()}/hour
                        </p>
                      </div>
                    )}

                  {/* PER_UNIT - Unit Type and Quantity */}
                  {selectedService &&
                    selectedService.pricingType === "PER_UNIT" && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Unit Type *
                          </label>
                          <select
                            value={bookingForm.unitType}
                            onChange={(e) =>
                              setBookingForm({
                                ...bookingForm,
                                unitType: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="room">Room</option>
                            <option value="item">Item</option>
                            <option value="square meter">Square Meter</option>
                            <option value="hour">Hour</option>
                            <option value="unit">Unit</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Quantity *
                          </label>
                          <Input
                            type="number"
                            required
                            min="1"
                            value={bookingForm.quantity}
                            onChange={(e) =>
                              setBookingForm({
                                ...bookingForm,
                                quantity: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Price per {bookingForm.unitType}: KES{" "}
                            {selectedService.fixedPrice?.toLocaleString()}
                          </p>
                        </div>
                      </>
                    )}

                  {/* FIXED - Show info */}
                  {selectedService &&
                    selectedService.pricingType === "FIXED" && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-900 font-medium">
                          ✓ Fixed price: KES{" "}
                          {selectedService.fixedPrice?.toLocaleString()}
                        </p>
                        {selectedService.estimatedHours && (
                          <p className="text-xs text-green-700 mt-1">
                            Estimated: {selectedService.estimatedHours} hours
                          </p>
                        )}
                      </div>
                    )}

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location *
                    </label>
                    <LocationDropdown
                      value={bookingForm.location}
                      onChange={(locId) => {
                        setBookingForm({
                          ...bookingForm,
                          location: locId,
                        });
                      }}
                      className="w-full"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Additional Details (Optional)
                    </label>
                    <textarea
                      value={bookingForm.description}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Any specific requirements..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Price Summary */}
                  {selectedService &&
                    selectedService.pricingType !== "CUSTOM" && (
                      <div className="pt-4 border-t">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>
                            {selectedService.pricingType === "HOURLY" &&
                              `${selectedService.hourlyRate} × ${bookingForm.duration}hr`}
                            {selectedService.pricingType === "FIXED" &&
                              "Fixed Price"}
                            {selectedService.pricingType === "PER_UNIT" &&
                              `${selectedService.fixedPrice} × ${bookingForm.quantity} ${bookingForm.unitType}(s)`}
                          </span>
                          <span>KES {calculatedAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span>KES {calculatedAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={bookingLoading || !selectedService}
                    className="w-full py-3 bg-jiko-primary hover:bg-jiko-primary/90 cursor-pointer text-jiko-secondary rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <Send size={20} />
                    <span>
                      {bookingLoading
                        ? "Sending..."
                        : selectedService?.pricingType === "CUSTOM"
                        ? "Request Quote"
                        : "Confirm Booking"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingForm(false);
                      setSelectedService(null);
                    }}
                    className="w-full cursor-pointer py-2 text-red-400 hover:text-red-600"
                  >
                    Cancel
                  </button>
                </form>
              )}
              <div className="mt-6 pt-6 border-t text-center text-sm text-gray-600">
                <p>✓ Verified professional</p>
                <p>✓ Secure payment</p>
                <p>✓ 24/7 support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SvcProvider;
