"use client";
import { LocationDropdown } from "@/components/locations/LocationDropdown";
import Loading from "@/components/shared/Loading";
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
import { searchService } from "@/services/apis/booking.api";
import {
  Briefcase,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Filter,
  MapPin,
  Search,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Services = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<any[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12); // 12 items per page for 3x4 grid
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pageSize);

  const [filters, setFilters] = useState({
    category: "",
    location: "",
    minRate: "",
    maxRate: "",
    minRating: "",
  });

  const loadProviders = async (page = currentPage) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      // Add filters
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.location) queryParams.append("location", filters.location);
      if (filters.minRate) queryParams.append("minRate", filters.minRate);
      if (filters.maxRate) queryParams.append("maxRate", filters.maxRate);
      if (filters.minRating) queryParams.append("minRating", filters.minRating);

      // Add pagination
      queryParams.append("page", page.toString());
      queryParams.append("limit", pageSize.toString());

      const token = localStorage.getItem("accessToken");
      const data = await searchService(queryParams, token!);

      console.log("data", data.data);

      if (data.success) {
        setFilteredProviders(data.data.providers || data.data);
        setTotalCount(data.data.total || data.data.length);

        // Scroll to top of results
        window.scrollTo({ top: 0, behavior: "smooth" });
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
      filtered = filtered.filter((p) => p.location.id === filters.location);
    }

    if (filters.minRating) {
      filtered = filtered.filter(
        (p) => p.averageRating >= parseFloat(filters.minRating)
      );
    }

    if (filters.minRate && filters.maxRate) {
      filtered = filtered.filter(
        (p) =>
          p.service.fixedPrice >= parseFloat(filters.minRate) &&
          p.service.fixedPrice <= parseFloat(filters.maxRate)
      );
    }

    setFilteredProviders(filtered);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadProviders(page);
  };

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      loadProviders(1);
    }, 0);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      loadProviders(1);
    }, 0);
  }, [filters]);

  useEffect(() => {
    setTimeout(async () => {
      const res = await fetch("/api/services/top");
      const data = await res.json();
      if (data.success) {
        setServiceCategories(data.data);
      }
    }, 0);
  }, []);

  const handleCategoryClick = (category: string) => {
    handleFilterChange({ ...filters, category });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (!mounted) return <Loading />;

  return (
    <div className="min-h-screen">
      {/* Hero Search Section */}
      <div className="bg-linear-to-br from-jiko-primary/60 via-jiko-primary/70 to-jiko-secondary/70 rounded-md text-white py-16">
        <div className="px-4">
          <h1 className="text-4xl font-bold mb-4">
            Find the Perfect Service Provider
          </h1>
          <p className="text-xl opacity-90 mb-8">
            Verified professionals ready to help with your home needs
          </p>
          <div className="bg-white rounded-2xl p-4 flex items-center space-x-4 shadow-xl max-w-4xl">
            <Search className="text-gray-400" size={24} />
            <LocationDropdown
              value={filters.location}
              onChange={(locId) => {
                setFilters({ ...filters, location: locId });
              }}
              className="w-full"
            />
            <Button
              onClick={() => loadProviders(1)}
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
          {serviceCategories.map((cat) => (
            <button
              key={cat.category.name}
              onClick={() => handleCategoryClick(cat.category.name)}
              className={`p-4 rounded-xl border-2 transition text-center cursor-pointer ${
                filters.category === cat.category.name
                  ? "border-jiko-primary bg-jiko-primary/5"
                  : "border-gray-200 bg-white hover:border-jiko-primary"
              }`}
            >
              <div className="text-3xl mb-2">{cat.category.icon}</div>
              <div className="text-sm font-medium text-gray-900">
                {cat.category.name}
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
                handleFilterChange({
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
                  handleFilterChange({ ...filters, minRating: value })
                }
              >
                <SelectTrigger className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jiko-primary">
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
                  handleFilterChange({ ...filters, minRate: e.target.value })
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
                  handleFilterChange({ ...filters, maxRate: e.target.value })
                }
                placeholder="1500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jiko-primary"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => loadProviders(1)}
                className="w-full px-4 py-2 bg-jiko-primary cursor-pointer text-white rounded-lg font-semibold hover:bg-jiko-primary transition"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">
            {totalCount} Provider{totalCount !== 1 ? "s" : ""} Found
            {totalCount > 0 && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                (Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, totalCount)})
              </span>
            )}
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jiko-primary mx-auto"></div>
          </div>
        ) : filteredProviders.length > 0 ? (
          <>
            {/* Providers Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                      <img
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
                          <span>
                            {provider?.location?.name || "Location not set"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Services */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {provider?.services
                        ?.slice(0, 3)
                        .map((service: { name: string,hourlyRate?:number, fixedPrice?:number,pricingType:string }) => (
                          <span
                            key={service.name}
                            className="px-3 py-1 bg-blue-50 text-jiko-primary rounded-full text-sm font-medium"
                          >
                            {service.name}
                            <span className="font-bold text-gray-900 text-xs flex  items-center">
                               <DollarSign size={12} className=""/>
                              {service?.hourlyRate?.toLocaleString() || service?.fixedPrice?.toLocaleString()} KES/
                              {service?.pricingType === "HOURLY"
                                ? "hr"
                                : service.pricingType === "FIXED"
                                ? "{fixed)"
                                : "unit"}
                            </span>
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
                            {provider.averageRating || "N/A"}
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                {/* Previous Button */}
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        typeof page === "number" && handlePageChange(page)
                      }
                      disabled={page === "..."}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        page === currentPage
                          ? "bg-jiko-primary text-white"
                          : page === "..."
                          ? "cursor-default text-gray-400"
                          : "bg-white border hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={20} />
                </Button>
              </div>
            )}
          </>
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
                handleFilterChange({
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
