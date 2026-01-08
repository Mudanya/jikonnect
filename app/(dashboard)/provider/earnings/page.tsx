// app/provider/earnings/page.tsx - UPDATED WITH PAYOUT STATUS
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Download,
  CheckCircle,
  Loader,
  AlertCircle,
  Filter,
  Search,
  AlertTriangle,
  Hourglass,
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Booking {
  id: string;
  service: string;
  amount: number;
  providerPayout: number;
  commission: number;
  completedAt: string;
  payoutStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  paidOutAt: string | null;
  client: {
    firstName: string;
    lastName: string;
  };
  payment: {
    status: string;
    mpesaCode: string;
  };
  payout?: {
    mpesaCode: string;
    status: string;
  };
}

export default function ProviderEarningsPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<"all" | "month" | "week">("month");
  const [selectedPayoutStatus, setSelectedPayoutStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadEarnings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, selectedPeriod, selectedPayoutStatus, searchQuery]);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch("/api/provider/earnings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setBookings(result.data.bookings || []);
        setSummary(result.data.summary);
        setMonthlyData(result.data.monthlyData || []);
      } else {
        toast.error("Failed to load earnings");
      }
    } catch (error) {
      console.error("Failed to load earnings:", error);
      toast.error("Error loading earnings");
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Period filter
    if (selectedPeriod !== "all") {
      const now = new Date();
      const cutoff = new Date();

      if (selectedPeriod === "week") {
        cutoff.setDate(now.getDate() - 7);
      } else if (selectedPeriod === "month") {
        cutoff.setMonth(now.getMonth() - 1);
      }

      filtered = filtered.filter(
        (b) => new Date(b.completedAt) >= cutoff
      );
    }

    // Payout status filter
    if (selectedPayoutStatus !== "all") {
      filtered = filtered.filter((b) => b.payoutStatus === selectedPayoutStatus);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.service.toLowerCase().includes(query) ||
          b.client.firstName.toLowerCase().includes(query) ||
          b.client.lastName.toLowerCase().includes(query) ||
          b.id.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
  };

  const getPayoutStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle size={14} />
            <span>Paid Out</span>
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            <Hourglass size={14} className="animate-pulse" />
            <span>Processing</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <AlertTriangle size={14} />
            <span>Failed</span>
          </span>
        );
      default: // PENDING
        return (
          <span className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <Clock size={14} />
            <span>Pending</span>
          </span>
        );
    }
  };

  // Calculate summary including payout status
  const pendingPayouts = bookings
    .filter(b => b.payoutStatus === 'PENDING')
    .reduce((sum, b) => sum + Number(b.providerPayout), 0);

  const completedPayouts = bookings
    .filter(b => b.payoutStatus === 'COMPLETED')
    .reduce((sum, b) => sum + Number(b.providerPayout), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Earnings</h1>
            <p className="text-gray-600 mt-1">Track your income and payouts</p>
          </div>
        </div>

        {/* Summary Cards - Including Payout Status */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SummaryCard
              title="Total Earned"
              value={`KES ${summary.totalEarnings.toLocaleString()}`}
              icon={DollarSign}
              color="green"
              subtitle="All time"
            />
            <SummaryCard
              title="Paid Out"
              value={`KES ${completedPayouts.toLocaleString()}`}
              icon={CheckCircle}
              color="blue"
              subtitle="Received in M-Pesa"
            />
            <SummaryCard
              title="Pending Payout"
              value={`KES ${pendingPayouts.toLocaleString()}`}
              icon={Clock}
              color="orange"
              subtitle="Awaiting processing"
            />
            <SummaryCard
              title="Completed Jobs"
              value={summary.completedJobs.toString()}
              icon={Calendar}
              color="purple"
              subtitle="Total delivered"
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 shadow-md rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Period Filter */}
            <div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="w-full px-4 py-3 shadow-md rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="month">Last Month</option>
                <option value="week">Last Week</option>
              </select>
            </div>

            {/* Payout Status Filter */}
            <div>
              <select
                value={selectedPayoutStatus}
                onChange={(e) => setSelectedPayoutStatus(e.target.value)}
                className="w-full px-4 py-3 shadow-md rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Payouts</option>
                <option value="COMPLETED">Paid Out</option>
                <option value="PROCESSING">Processing</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table with Payout Status */}
        {filteredBookings.length > 0 ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Service</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-700">Your Payout</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Payment Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Payout Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Payout Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50 transition">
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-900">
                          {new Date(booking.completedAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-900">{booking.service}</p>
                        <p className="text-xs text-gray-500">
                          {booking.client.firstName} {booking.client.lastName}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <p className="font-bold text-green-600">
                          KES {Number(booking.providerPayout).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          of KES {Number(booking.amount).toLocaleString()}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {booking.payment.status === "PAID" ? (
                          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            <CheckCircle size={14} className="mr-1" />
                            Client Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            <Clock size={14} className="mr-1" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {getPayoutStatusBadge(booking.payoutStatus)}
                      </td>
                      <td className="py-4 px-6">
                        {booking.paidOutAt ? (
                          <div>
                            <p className="text-sm text-gray-900">
                              {new Date(booking.paidOutAt).toLocaleDateString()}
                            </p>
                            {booking.payout?.mpesaCode && (
                              <p className="text-xs text-gray-500">
                                {booking.payout.mpesaCode}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">-</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <DollarSign className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No earnings yet
            </h3>
            <p className="text-gray-600">Complete bookings to start earning</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                How Payouts Work
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>PENDING</strong>: Job completed, awaiting admin payout processing</li>
                <li>• <strong>PROCESSING</strong>: Payout initiated, money being sent to your M-Pesa</li>
                <li>• <strong>COMPLETED</strong>: Money received in your M-Pesa account</li>
                <li>• <strong>FAILED</strong>: Payout failed, will be retried by admin</li>
                {/* <li>• You earn 90% of booking amount, 10% platform commission</li> */}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: string;
  icon: any;
  color: string;
  subtitle?: string;
}) {
  const colorClasses = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600 font-medium">{title}</p>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            colorClasses[color as keyof typeof colorClasses]
          }`}
        >
          <Icon size={24} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}