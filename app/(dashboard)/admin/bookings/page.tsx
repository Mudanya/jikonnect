"use client";

import {
  AlertTriangle,
  Ban,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  MoreVertical,
  Search,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Booking {
  id: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
  };
  provider: {
    name: string;
    title: string;
    avatarUrl: string;
  };
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "FAILED";
  scheduledFor: string;
  price: number;
  createdAt: string;
  mpesaReceipt?: string;
}

export default function BookingsOversightPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchQuery, statusFilter, bookings]);

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
        setFilteredBookings(data.bookings);
      }
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.client.firstName.toLowerCase().includes(query) ||
          b.provider.name.toLowerCase().includes(query) ||
          b.id.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        await loadBookings();
        setShowActionMenu(null);
        alert("Booking cancelled successfully");
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("Failed to cancel booking");
    }
  };

  const handleReschedule = (bookingId: string) => {
    // Implement reschedule modal
    alert("Reschedule feature coming soon");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-gray-100 text-gray-700";
      case "FAILED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle size={16} />;
      case "COMPLETED":
        return <CheckCircle size={16} />;
      case "CANCELLED":
        return <XCircle size={16} />;
      case "FAILED":
        return <AlertTriangle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "PENDING").length,
    confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
    cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white border-b rounded-lg px-4 py-8 mx-4" >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bookings Oversight
            </h1>
            <p className="text-gray-600 mt-1">
              {filteredBookings.length} bookings found
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bookings..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.pending}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-600">Confirmed</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.confirmed}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.completed}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-600">Cancelled</p>
            <p className="text-2xl font-bold text-gray-600">
              {stats.cancelled}
            </p>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-md  overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Booking ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Provider
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Scheduled
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-600">
                        {booking.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={
                            booking.client.avatar ||
                            "/images/avatar-placeholder.png"
                          }
                          alt={booking.client.firstName}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.client.firstName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.client.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            booking.provider.avatarUrl ||
                            "/images/avatar-placeholder.png"
                          }
                          alt={booking.provider.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.provider.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.provider.title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {new Date(booking.scheduledFor).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.scheduledFor).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        KSH {booking.price.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusIcon(booking.status)}
                        <span>{booking.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionMenu(
                              showActionMenu === booking.id ? null : booking.id
                            );
                          }}
                          className="p-2 hover:bg-gray-200 rounded-lg transition"
                        >
                          <MoreVertical size={18} className="text-gray-600" />
                        </button>
                        {showActionMenu === booking.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReschedule(booking.id);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                            >
                              <Edit size={16} />
                              <span>Reschedule</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelBooking(booking.id);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-red-600"
                            >
                              <Ban size={16} />
                              <span>Cancel Booking</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="p-12 text-center">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Booking Details
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Client Information
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-600">Name:</span>{" "}
                      {selectedBooking.client.firstName}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Email:</span>{" "}
                      {selectedBooking.client.email}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Phone:</span>{" "}
                      {selectedBooking.client.phone}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Provider Information
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-600">Name:</span>{" "}
                      {selectedBooking.provider.name}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Service:</span>{" "}
                      {selectedBooking.provider.title}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Booking Information
                </h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-600">Booking ID:</span>{" "}
                    {selectedBooking.id}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Scheduled:</span>{" "}
                    {new Date(selectedBooking.scheduledFor).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Created:</span>{" "}
                    {new Date(selectedBooking.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Price:</span> KSH{" "}
                    {selectedBooking.price.toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`ml-2 inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedBooking.status
                      )}`}
                    >
                      {getStatusIcon(selectedBooking.status)}
                      <span>{selectedBooking.status}</span>
                    </span>
                  </p>
                  {selectedBooking.mpesaReceipt && (
                    <p className="text-sm">
                      <span className="text-gray-600">M-Pesa Receipt:</span>{" "}
                      {selectedBooking.mpesaReceipt}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
