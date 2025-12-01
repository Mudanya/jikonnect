"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Calendar,
  CheckCircle,
  Star,
  TrendingUp,
  Clock,
  MapPin,
  User,
  AlertCircle,
  Award,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function ProviderDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    if (user?.role !== "PROFESSIONAL") {
      // router.push("/dashboard");
    } else {
      loadDashboard();
    }
  }, [user]);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/provider/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const verificationStatus = stats.verificationStatus || "PENDING";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Ji</span>
                </div>
                <span className="text-xl font-bold">JiKonnect Pro</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                🔔
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center cursor-pointer">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </div>
                <div className="hidden md:block">
                  <div className="font-semibold text-sm">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">Professional</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b">
          <div className="px-4 py-2 space-y-1">
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 font-semibold text-blue-600">
              Dashboard
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50">
              Bookings
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50">
              Earnings
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50">
              Portfolio
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50">
              Reviews
            </button>
            <button
              onClick={() => router.push("/profile/edit")}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50"
            >
              Settings
            </button>
            <button
              onClick={logout}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-12 gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden md:block md:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border p-4 sticky top-24">
              <nav className="space-y-1">
                <button className="w-full text-left px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-semibold flex items-center space-x-2">
                  <TrendingUp size={18} />
                  <span>Dashboard</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                  <Calendar size={18} />
                  <span>Bookings</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                  <DollarSign size={18} />
                  <span>Earnings</span>
                </button>
                <button
                  onClick={() => router.push("/provider/portfolio")}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Briefcase size={18} />
                  <span>Portfolio</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                  <Star size={18} />
                  <span>Reviews</span>
                </button>
                <button
                  onClick={() => router.push("/profile/edit")}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 flex items-center space-x-2 mt-4"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-9 space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="opacity-90">
                {dashboardData?.upcomingBookings?.length || 0} upcoming bookings
                this week
              </p>
            </div>

            {/* Verification Alert */}
            {verificationStatus !== "VERIFIED" && (
              <div
                className={`rounded-2xl p-6 border-2 ${
                  verificationStatus === "PENDING"
                    ? "bg-yellow-50 border-yellow-200"
                    : verificationStatus === "REJECTED"
                    ? "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-start space-x-4">
                  <AlertCircle
                    className={
                      verificationStatus === "PENDING"
                        ? "text-yellow-600"
                        : verificationStatus === "REJECTED"
                        ? "text-red-600"
                        : "text-blue-600"
                    }
                    size={24}
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">
                      {verificationStatus === "PENDING" &&
                        "Verification Pending"}
                      {verificationStatus === "REJECTED" &&
                        "Verification Rejected"}
                      {verificationStatus === "" && "Complete Verification"}
                    </h3>
                    <p className="text-sm mb-3">
                      {verificationStatus === "PENDING" &&
                        "Your documents are being reviewed. This usually takes 24-48 hours."}
                      {verificationStatus === "REJECTED" &&
                        "Your verification was rejected. Please update your documents."}
                      {verificationStatus === "" &&
                        "Verify your account to unlock all features and gain client trust."}
                    </p>
                    {verificationStatus !== "PENDING" && (
                      <button
                        onClick={() =>
                          router.push("/profile/edit#verification")
                        }
                        className="px-4 py-2 bg-white rounded-lg font-semibold hover:shadow transition"
                      >
                        {verificationStatus === "REJECTED"
                          ? "Update Documents"
                          : "Start Verification"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="text-green-600" size={24} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  KES {stats.totalEarnings?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-gray-500">Total Earnings</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="text-blue-600" size={24} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.activeBookings || 0}
                </div>
                <div className="text-sm text-gray-500">Active Bookings</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="text-purple-600" size={24} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.completedBookings || 0}
                </div>
                <div className="text-sm text-gray-500">Completed Jobs</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Star className="text-yellow-600" size={24} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.averageRating || 0}
                </div>
                <div className="text-sm text-gray-500">Average Rating</div>
              </div>
            </div>

            {/* Upcoming Bookings */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Upcoming Bookings</h2>
                <button className="text-sm text-blue-600 hover:underline font-semibold">
                  View All
                </button>
              </div>

              {dashboardData?.upcomingBookings?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.upcomingBookings.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="flex items-start space-x-4 p-4 border rounded-xl hover:bg-gray-50 transition"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                        {booking.client.firstName[0]}
                        {booking.client.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h4 className="font-semibold">
                              {booking.client.firstName}{" "}
                              {booking.client.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {booking.service}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                          <span className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {new Date(
                              booking.scheduledDate
                            ).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {booking.scheduledTime}
                          </span>
                          <span className="flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {booking.location}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          KES {Number(booking.providerPayout).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.duration}h
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-600">No upcoming bookings</p>
                  <p className="text-sm text-gray-500 mt-1">
                    New bookings will appear here
                  </p>
                </div>
              )}
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Reviews</h2>
                <button className="text-sm text-blue-600 hover:underline font-semibold">
                  View All ({stats.totalReviews || 0})
                </button>
              </div>

              {dashboardData?.recentReviews?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentReviews.map((review: any) => (
                    <div key={review.id} className="p-4 border rounded-xl">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-linear-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
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
                                  size={16}
                                  className={
                                    i < review.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">
                            {review.comment}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{review.booking.service}</span>
                            <span>•</span>
                            <span>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-600">No reviews yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Complete jobs to receive reviews
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
