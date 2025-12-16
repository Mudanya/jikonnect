"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  MapPin,
  Star,
  DollarSign,
  Award,
  CheckCircle,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { searchService } from "@/services/apis/booking.api";
import Loading from "@/components/shared/Loading";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Services = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<any[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    category: "",
    location: "",
    minRate: "",
    maxRate: "",
    minRating: "",
  });
  const categories = [
    { value: "CLEANING", label: "Cleaning", icon: "\u{1F9F9}" },
    { value: "PLUMBING", label: "Plumbing", icon: "🔧" },
    { value: "ELECTRICAL", label: "Electrical", icon: "⚡" },
    { value: "CARPENTRY", label: "Carpentry", icon: "🔨" },
    { value: "PAINTING", label: "Painting", icon: "🎨" },
    { value: "GARDENING", label: "Gardening", icon: "🌱" },
    { value: "HOME_CARE", label: "Home Care", icon: "🏠" },
    { value: "SECURITY", label: "Security", icon: "🛡️" },
  ];

  const loadProviders = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.location) queryParams.append("location", filters.location);
      if (filters.minRate) queryParams.append("minRate", filters.minRate);
      if (filters.maxRate) queryParams.append("maxRate", filters.maxRate);
      if (filters.minRating) queryParams.append("minRating", filters.minRating);
      const token = localStorage.getItem("accessToken");
      const data = await searchService(queryParams, token!);
      if (data.success) {
        setProviders(data.data);
        setFilteredProviders(data.data);
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  const filterProviders = async () => {
    let filtered = [...providers];

    if (filters.category) {
      filtered = filtered.filter((p) => p.services.includes(filters.category));
    }

    if (filters.location) {
      filtered = filtered.filter((p) =>
        p.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minRating) {
      filtered = filtered.filter(
        (p) => p.averageRating >= parseFloat(filters.minRating)
      );
    }

    if (filters.minRate && filters.maxRate) {
      filtered = filtered.filter(
        (p) =>
          p.hourlyRate >= parseFloat(filters.minRate) &&
          p.hourlyRate <= parseFloat(filters.maxRate)
      );
    }

    setFilteredProviders(filtered);
  };
  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      loadProviders();
    }, 0);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      filterProviders();
    }, 0);
  }, [filters, providers]);

  const handleCategoryClick = (category: string) => {
    setFilters({ ...filters, category });
    loadProviders();
  };
  if (!mounted) return <Loading />;

  return (
    <div className="min-h-screen">
      {/* Hero Search Section */}
      <div className="bg-linear-to-br from-jiko-primary/60 via-jiko-primary/70 to-jiko-secondary/70 rounded-md  text-white py-16">
        <div className=" px-4">
          <h1 className="text-4xl font-bold mb-4">
            Find the Perfect Service Provider
          </h1>
          <p className="text-xl opacity-90 mb-8">
            Verified professionals ready to help with your home needs
          </p>

          <div className="bg-white rounded-2xl p-4 flex items-center space-x-4 shadow-xl max-w-4xl">
            <Search className="text-gray-400" size={24} />
            <Input
              type="text"
              placeholder="Search by location..."
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
              className="flex-1 px-4 py-3 text-jiko-black focus:outline-none focus:outline-jiko-secondary outline-none! border-0 focus:shadow-none"
            />
            <Button
              onClick={loadProviders}
              className="px-8 py-3 bg-jiko-secondary shadow-md text-white rounded-xl font-semibold hover:bg-jiko-secondary/90 cursor-pointer transition"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Popular Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryClick(cat.value)}
              className={`p-4 rounded-xl border-2 transition text-center cursor-pointer ${
                filters.category === cat.value
                  ? "border-jiko-primary bg-jiko-primary/5"
                  : "border-gray-200 bg-white hover:border-jiko-primary"
              }`}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-sm font-medium text-gray-900">
                {cat.label}
              </div>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center">
              <Filter className="mr-2" size={20} />
              Filters
            </h3>
            <Button
              onClick={() =>
                setFilters({
                  category: "",
                  location: "",
                  minRate: "",
                  maxRate: "",
                  minRating: "",
                })
              }
              variant={"link"}
              className="text-sm text-jiko-primary hover:underline cursor-pointer"
            >
              Clear all
            </Button>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Rating
              </label>
              <Select
                value={filters.minRating}
                onValueChange={(value) =>
                  setFilters({ ...filters, minRating: value })
                }
              >
                <SelectTrigger
                  className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jiko-primary`}
                >
                  <SelectValue placeholder="Min Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Min Rating</SelectLabel>

                    <SelectItem value="0">Any</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Rate (KES/hr)
              </label>
              <Input
                type="number"
                value={filters.minRate}
                onChange={(e) =>
                  setFilters({ ...filters, minRate: e.target.value })
                }
                placeholder="500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jiko-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Rate (KES/hr)
              </label>
              <Input
                type="number"
                value={filters.maxRate}
                onChange={(e) =>
                  setFilters({ ...filters, maxRate: e.target.value })
                }
                placeholder="1500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jiko-primary"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={loadProviders}
                className="w-full px-4 py-2 bg-jiko-primary cursor-pointer text-white rounded-lg font-semibold hover:bg-jiko-primary transition"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">
            {filteredProviders.length} Provider
            {filteredProviders.length !== 1 ? "s" : ""} Found
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jiko-primary mx-auto"></div>
          </div>
        ) : filteredProviders.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition cursor-pointer"
                onClick={() =>
                  router.push(`/services/provider/${provider.userId}`)
                }
              >
                {/* Portfolio Images */}
                {provider.portfolios.length > 0 && (
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    <Image
                      src={provider?.portfolios[0]?.images[0]}
                      alt={provider.user.firstName}
                      className="w-full h-full object-cover"
                      width={800}
                      height={600}
                    />
                    {provider?.portfolios?.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                        +{provider?.portfolios?.length - 1} more
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  {/* Provider Info */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {provider.user.firstName[0]}
                      {provider.user.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-lg">
                          {provider.user.firstName} {provider.user.lastName}
                        </h3>
                        {provider.verificationStatus === "VERIFIED" && (
                          <CheckCircle
                            className="text-jiko-primary"
                            size={18}
                          />  
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <MapPin size={14} />
                        <span>{provider?.location?.name || "Location not set"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {provider?.services?.slice(0, 3).map((service: {name:string}) => (
                      <span
                        key={service.name}
                        className="px-3 py-1 bg-blue-50 text-jiko-primary rounded-full text-xs font-medium"
                      >
                        {service.name}
                      </span>
                    ))}
                    {provider?.services?.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        +{provider?.services?.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-yellow-500 mb-1">
                        <Star size={16} className="fill-yellow-500" />
                        <span className="font-bold text-gray-900">
                          {/* {provider.averageRating} */}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="font-bold text-gray-900">
                          {provider.totalJobs}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">Jobs</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-jiko-primary mb-1">
                        <DollarSign size={16} />
                        <span className="font-bold text-gray-900">
                          {provider.hourlyRate}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">KES/hr</div>
                    </div>
                  </div>

                  {/* Bio Preview */}
                  {provider.bio && (
                    <p className="text-sm text-gray-600 mt-4 line-clamp-2">
                      {provider.bio}
                    </p>
                  )}

                  {/* CTA */}
                  <button className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-jiko-primary to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition">
                    View Profile & Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl">
            <Briefcase className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No providers found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search criteria
            </p>
            <button
              onClick={() =>
                setFilters({
                  category: "",
                  location: "",
                  minRate: "",
                  maxRate: "",
                  minRating: "",
                })
              }
              className="px-6 py-2 bg-jiko-primary cursor-pointer text-white rounded-lg font-semibold hover:bg-jiko-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
