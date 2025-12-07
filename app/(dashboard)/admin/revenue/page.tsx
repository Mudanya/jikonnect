"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Download,
  Calendar,
  Users,
  Briefcase,
  CreditCard,
} from "lucide-react";

interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  todayRevenue: number;
  totalCommission: number;
  monthlyGrowth: number;
  completedBookings: number;
  averageBookingValue: number;
  topProviders: Array<{
    id: string;
    name: string;
    revenue: number;
    bookings: number;
  }>;
  revenueByCategory: Array<{
    category: string;
    revenue: number;
    bookings: number;
  }>;
  monthlyData: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
}

export default function RevenueAnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30"); // days
  const [viewMode, setViewMode] = useState<"revenue" | "bookings">("revenue");

  useEffect(() => {
    loadRevenueStats();
  }, [dateRange]);

  const loadRevenueStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/admin/revenue?days=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to load revenue stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `/api/admin/revenue/export?days=${dateRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `revenue-report-${new Date().toISOString()}.csv`;
        a.click();
      }
    } catch (error) {
      console.error("Failed to export report:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className=" px-4 py-4">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Revenue & Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor platform financial performance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Download size={18} />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className=" px-4 py-8">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Total Revenue
              </span>
              <DollarSign className="text-green-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              KSH {stats.totalRevenue.toLocaleString()}
            </p>
            <div
              className={`flex items-center mt-2 text-sm ${
                stats.monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.monthlyGrowth >= 0 ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              <span className="ml-1">
                {Math.abs(stats.monthlyGrowth)}% vs last period
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Monthly Revenue
              </span>
              <Calendar className="text-blue-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              KSH {stats.monthlyRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">This month</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Commission Earned
              </span>
              <CreditCard className="text-purple-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              KSH {stats.totalCommission.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">Platform earnings</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Avg Booking Value
              </span>
              <Briefcase className="text-orange-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              KSH {stats.averageBookingValue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {stats.completedBookings} completed bookings
            </p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Revenue Trends</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode("revenue")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  viewMode === "revenue"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setViewMode("bookings")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  viewMode === "bookings"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Bookings
              </button>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-4">
            {stats.monthlyData.map((data, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {data.month}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {viewMode === "revenue"
                      ? `KSH ${data.revenue.toLocaleString()}`
                      : `${data.bookings} bookings`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        viewMode === "revenue"
                          ? (data.revenue /
                              Math.max(
                                ...stats.monthlyData.map((d) => d.revenue)
                              )) *
                            100
                          : (data.bookings /
                              Math.max(
                                ...stats.monthlyData.map((d) => d.bookings)
                              )) *
                            100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Providers */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Top Performing Providers
            </h2>
            <div className="space-y-4">
              {stats.topProviders.map((provider, index) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : index === 2
                          ? "bg-orange-500"
                          : "bg-blue-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {provider.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {provider.bookings} bookings
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      KSH {provider.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Category */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Revenue by Service Category
            </h2>
            <div className="space-y-4">
              {stats.revenueByCategory.map((category) => (
                <div key={category.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {category.category}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        KSH {category.revenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">
                        {category.bookings} bookings
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-600 to-emerald-500 h-full rounded-full"
                      style={{
                        width: `${
                          (category.revenue /
                            Math.max(
                              ...stats.revenueByCategory.map((c) => c.revenue)
                            )) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Weekly Revenue</h3>
            <p className="text-3xl font-bold">
              KSH {stats.weeklyRevenue.toLocaleString()}
            </p>
            <p className="text-sm opacity-90 mt-2">Last 7 days</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Today&apos;s Revenue</h3>
            <p className="text-3xl font-bold">
              KSH {stats.todayRevenue.toLocaleString()}
            </p>
            <p className="text-sm opacity-90 mt-2">Real-time tracking</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Commission Rate</h3>
            <p className="text-3xl font-bold">
              {((stats.totalCommission / stats.totalRevenue) * 100).toFixed(1)}%
            </p>
            <p className="text-sm opacity-90 mt-2">Average platform fee</p>
          </div>
        </div>
      </div>
    </div>
  );
}
