"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Calendar,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  Award,
  Users,
  Loader,
  AlertCircle,
} from "lucide-react";

interface DashboardData {
  profile: any;
  stats: {
    totalEarnings: number;
    thisMonthEarnings: number;
    totalBookings: number;
    completedBookings: number;
    activeBookings: number;
    averageRating: string;
    totalReviews: number;
    verificationStatus: string;
    completionRate: string;
  };
  upcomingBookings: any[];
  recentReviews: any[];
  earningsChart: Array<{ month: string; earnings: number }>;
}

export default function ProviderDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/provider/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-900">
            Failed to load dashboard
          </h2>
          <button
            onClick={loadDashboard}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, upcomingBookings, recentReviews, earningsChart } = data;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b mx-4 rounded-lg">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
             
              <p className="text-gray-600 mt-1">
                Welcome back! Here's your overview
              </p>
            </div>
            {stats.verificationStatus === "PENDING" && (
              <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">
                <Clock size={16} className="inline mr-1" />
                Verification Pending
              </div>
            )}
            {stats.verificationStatus === "VERIFIED" && (
              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                <CheckCircle size={16} className="inline mr-1" />
                Verified Provider
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Earnings"
            value={`KSH ${stats.totalEarnings.toLocaleString()}`}
            icon={DollarSign}
            color="green"
            subtitle="All time"
          />
          <StatCard
            title="This Month"
            value={`KSH ${stats.thisMonthEarnings.toLocaleString()}`}
            icon={TrendingUp}
            color="blue"
            subtitle="Current month earnings"
          />
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={Calendar}
            color="purple"
            subtitle={`${stats.activeBookings} active`}
          />
          <StatCard
            title="Average Rating"
            value={stats.averageRating}
            icon={Star}
            color="yellow"
            subtitle={`${stats.totalReviews} reviews`}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Completion Rate
              </span>
              <Award className="text-blue-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.completionRate}%
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Completed Jobs
              </span>
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.completedBookings}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {stats.totalBookings - stats.completedBookings} in progress
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Active Bookings
              </span>
              <Users className="text-orange-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.activeBookings}
            </p>
            <p className="text-sm text-gray-600 mt-1">Current active jobs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Earnings Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Earnings Trend
            </h2>
            <div className="space-y-4">
              {earningsChart.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {item.month}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      KSH {item.earnings.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-600 to-emerald-500 h-3 rounded-full"
                      style={{
                        width: `${
                          (item.earnings /
                            Math.max(...earningsChart.map((e) => e.earnings))) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push("/provider/earnings")}
              className="mt-6 w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              View Detailed Earnings
            </button>
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Upcoming Bookings
            </h2>
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-600">No upcoming bookings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer"
                    onClick={() =>
                      router.push(`/provider/bookings/${booking.id}`)
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            booking.client.avatar ||
                            "/images/avatar-placeholder.png"
                          }
                          alt={booking.client.firstName}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.client.firstName} {booking.client.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.service}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(booking.scheduledDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(booking.scheduledDate).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => router.push("/provider/bookings")}
              className="mt-6 w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              View All Bookings
            </button>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Recent Reviews
          </h2>
          {recentReviews.length === 0 ? (
            <div className="text-center py-8">
              <Star className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-600">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          review.reviewer.avatar ||
                          "/images/avatar-placeholder.png"
                        }
                        alt={review.reviewer.firstName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.reviewer.firstName} {review.reviewer.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {review.booking.service}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, subtitle }: any) {
  const colorClasses = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-gray-900">{value}</h3>
          {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <div
          className={`p-3 rounded-lg ${
            colorClasses[color as keyof typeof colorClasses]
          }`}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
