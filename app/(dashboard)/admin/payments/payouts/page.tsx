// app/admin/payouts/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Users,
  Send,
  Loader,
  CheckCircle,
  AlertCircle,
  Search,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

interface Provider {
  provider: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  bookings: any[];
  totalPayout: number;
  totalCommission: number;
}

export default function AdminPayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch("/api/admin/payouts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setProviders(result.data || []);
      } else {
        toast.error("Failed to load payouts");
      }
    } catch (error) {
      console.error("Failed to load payouts:", error);
      toast.error("Error loading payouts");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async (provider: Provider) => {
    if (!confirm(
      `Process payout of KES ${provider.totalPayout.toLocaleString()} to ${
        provider.provider.firstName
      } ${provider.provider.lastName}?`
    )) {
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          providerId: provider.provider.id,
          bookingIds: provider.bookings.map((b) => b.id),
          phoneNumber: provider.provider.phone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Payout initiated successfully!");
        loadPayouts(); // Reload data
      } else {
        toast.error(result.message || "Failed to process payout");
      }
    } catch (error: any) {
      console.error("Payout error:", error);
      toast.error(error.message || "Failed to process payout");
    } finally {
      setProcessing(false);
    }
  };

  const filteredProviders = providers.filter(
    (p) =>
      p.provider.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.provider.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.provider.phone.includes(searchQuery)
  );

  const totalPendingPayouts = providers.reduce(
    (sum, p) => sum + p.totalPayout,
    0
  );
  const totalProviders = providers.length;
  const totalBookings = providers.reduce(
    (sum, p) => sum + p.bookings.length,
    0
  );
  const totalCommission = providers.reduce(
    (sum, p) => sum + p.totalCommission,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Provider Payouts
          </h1>
          <p className="text-gray-600 mt-1">
            Manage payouts to service providers
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Pending Payouts"
            value={`KES ${totalPendingPayouts.toLocaleString()}`}
            icon={DollarSign}
            color="orange"
          />
          <StatCard
            title="Providers"
            value={totalProviders.toString()}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Completed Jobs"
            value={totalBookings.toString()}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Total Commission"
            value={`KES ${totalCommission.toLocaleString()}`}
            icon={DollarSign}
            color="purple"
          />
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by provider name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Providers List */}
        {filteredProviders.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredProviders.map((providerData) => (
              <div
                key={providerData.provider.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {providerData.provider.firstName[0]}
                      {providerData.provider.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {providerData.provider.firstName}{" "}
                        {providerData.provider.lastName}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1 text-gray-600">
                        <Phone size={16} />
                        <span>{providerData.provider.phone}</span>
                      </div>
                      <div className="mt-3 flex items-center space-x-6 text-sm">
                        <div>
                          <span className="text-gray-600">Completed Jobs:</span>
                          <span className="ml-2 font-semibold text-gray-900">
                            {providerData.bookings.length}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Commission:</span>
                          <span className="ml-2 font-semibold text-orange-600">
                            KES {providerData.totalCommission.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Total Payout</p>
                    <p className="text-3xl font-bold text-green-600">
                      KES {providerData.totalPayout.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Bookings Preview */}
                <div className="border-t pt-4 mt-4">
                  <button
                    onClick={() =>
                      setSelectedProvider(
                        selectedProvider?.provider.id ===
                          providerData.provider.id
                          ? null
                          : providerData
                      )
                    }
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-3"
                  >
                    {selectedProvider?.provider.id === providerData.provider.id
                      ? "Hide"
                      : "Show"}{" "}
                    Details ({providerData.bookings.length} bookings)
                  </button>

                  {selectedProvider?.provider.id === providerData.provider.id && (
                    <div className="space-y-2 mt-3">
                      {providerData.bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.service}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(
                                booking.completedAt
                              ).toLocaleDateString()}{" "}
                              • {booking.client.firstName}{" "}
                              {booking.client.lastName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              KES{" "}
                              {Number(booking.providerPayout).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              Total: KES {Number(booking.amount).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="border-t pt-4 mt-4">
                  <button
                    onClick={() => handleProcessPayout(providerData)}
                    disabled={processing}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        <span>
                          Process Payout - KES{" "}
                          {providerData.totalPayout.toLocaleString()}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <CheckCircle className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Pending Payouts
            </h3>
            <p className="text-gray-600">
              All provider payouts have been processed
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle
              className="text-blue-600 flex-shrink-0 mt-1"
              size={20}
            />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Payout Information
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Payouts are processed via M-Pesa B2C</li>
                <li>• Providers receive 90% of booking amount</li>
                <li>• Platform retains 10% commission</li>
                <li>• Payouts are sent to registered phone numbers</li>
                <li>• All transactions are logged in audit trail</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    orange: "bg-orange-100 text-orange-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
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
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}