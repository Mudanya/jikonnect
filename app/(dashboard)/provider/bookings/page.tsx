"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Loader,
  Star,
  Search,
  ThumbsUp,
  ThumbsDown,
  Check,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import DisputeStatusBadge from "@/components/bookings/DisputeStatusBadge";
import Link from "next/link";

interface Booking {
  id: string;
  service: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "FAILED";
  scheduledDate: string;
  amount: number;
  providerPayout: number;
  commission: number;
  createdAt: string;
  completedAt: string | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string | null;
  };
  location: string;
  review: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
  } | null;
}

export default function ProviderBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [confirmingBooking, setConfirmingBooking] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter, searchQuery]);

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/provider/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setBookings(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.client.firstName.toLowerCase().includes(query) ||
          b.client.lastName.toLowerCase().includes(query) ||
          b.service.toLowerCase().includes(query) ||
          b.id.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleConfirmBooking = async (
    bookingId: string,
    action: "confirm" | "reject"
  ) => {
    const confirmMessage =
      action === "confirm"
        ? "Are you sure you want to confirm this booking?"
        : "Are you sure you want to reject this booking?";

    if (!confirm(confirmMessage)) return;

    try {
      setConfirmingBooking(bookingId);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `/api/provider/bookings/${bookingId}/confirm`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        loadBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Booking action error:", error);
      toast.error("Failed to update booking");
    } finally {
      setConfirmingBooking(null);
    }
  };

  // NEW: Handle completing booking
  const handleCompleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to mark this booking as completed?"))
      return;

    try {
      setConfirmingBooking(bookingId);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `/api/provider/bookings/${bookingId}/complete`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        loadBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Booking completion error:", error);
      toast.error("Failed to complete booking");
    } finally {
      setConfirmingBooking(null);
    }
  };

  const getStats = () => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
      confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
      inProgress: bookings.filter((b) => b.status === "IN_PROGRESS").length,
      completed: bookings.filter((b) => b.status === "COMPLETED").length,
      cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen">
      <div className="px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">
            Manage your bookings and track progress
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard label="Total" value={stats.total} color="blue" />
          <StatCard label="Pending" value={stats.pending} color="yellow" />
          <StatCard label="Confirmed" value={stats.confirmed} color="blue" />
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            color="purple"
          />
          <StatCard label="Completed" value={stats.completed} color="green" />
          <StatCard label="Cancelled" value={stats.cancelled} color="gray" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by client name, service, or booking ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="md:w-64">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery || statusFilter !== "all"
                ? "No bookings found"
                : "No bookings yet"}
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Your upcoming jobs will appear here"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onClick={() => setSelectedBooking(booking)}
                onConfirm={handleConfirmBooking}
                onComplete={handleCompleteBooking} // NEW
                isConfirming={confirmingBooking === booking.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdate={loadBookings}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    purple: "bg-purple-100 text-purple-700",
    green: "bg-green-100 text-green-700",
    gray: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p
        className={`text-2xl font-bold ${
          colorClasses[color as keyof typeof colorClasses]
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function BookingCard({
  booking,
  onClick,
  onConfirm,
  onComplete, // NEW
  isConfirming,
}: {
  booking: Booking;
  onClick: () => void;
  onConfirm: (bookingId: string, action: "confirm" | "reject") => void;
  onComplete: (bookingId: string) => void; // NEW
  isConfirming: boolean;
}) {
  const statusConfig = {
    PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
    DISPUTED: { label: "Disputed", color: "bg-red-100 text-red-700" },
    CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-700" },
    IN_PROGRESS: {
      label: "In Progress",
      color: "bg-purple-100 text-purple-700",
    },
    COMPLETED: { label: "Completed", color: "bg-green-100 text-green-700" },
    CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-700" },
    FAILED: { label: "Failed", color: "bg-red-100 text-red-700" },
  };

  const config = statusConfig[booking.status];
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  return (
    <Link href={`/provider/bookings/${booking.id}`} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4 flex-1">
          <img
            src={booking.client.avatar || "/images/avatar-placeholder.png"}
            alt={booking.client.firstName}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h3 className="font-bold text-gray-900">
              {booking.client.firstName} {booking.client.lastName}
            </h3>
            <p className="text-sm text-gray-600">{booking.service}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
        >
          {config.label}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar size={16} />
          <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Clock size={16} />
          <span>
            {new Date(booking.scheduledDate).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <MapPin size={16} />
          <span>{booking.location}</span>
        </div>
        <div className="flex items-center space-x-2 text-green-600 font-medium">
          <DollarSign size={16} />
          <span>KSH {booking.providerPayout.toLocaleString()}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <button
          onClick={onClick}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          View Details
        </button>

        {/* PENDING - Accept/Decline */}
        {booking.status === "PENDING" && (
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfirm(booking.id, "reject");
              }}
              disabled={isConfirming}
              className="flex items-center space-x-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
            >
              {isConfirming ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <ThumbsDown size={16} />
              )}
              <span className="text-sm font-medium">Decline</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfirm(booking.id, "confirm");
              }}
              disabled={isConfirming}
              className="flex items-center space-x-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
            >
              {isConfirming ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <ThumbsUp size={16} />
              )}
              <span className="text-sm font-medium">Accept</span>
            </button>
          </div>
        )}

        {/* CONFIRMED - Awaiting payment */}
        {booking.status === "CONFIRMED" && (
          <span className="text-sm text-blue-600 font-medium">
            ⏳ Awaiting client payment
          </span>
        )}

        {/* IN_PROGRESS - Mark as Complete */}
        {booking.status === "IN_PROGRESS" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete(booking.id);
            }}
            disabled={isConfirming}
            className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
          >
            {isConfirming ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            <span className="text-sm font-medium">Mark as Complete</span>
          </button>
        )}
      </div>

      {booking.review && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < booking.review!.rating
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              Client reviewed this job
            </span>
          </div>
        </div>
      )}

      {/* {booking.status === "COMPLETED" && !booking.dispute && (
        <button
          onClick={() => {
            setSelectedBooking(booking);
            setShowDisputeModal(true);
          }}
          className="flex items-center space-x-2 text-red-600 hover:text-red-700"
        >
          <AlertTriangle size={16} />
          <span>Raise Dispute</span>
        </button>
      )} */}

     
    </Link>
  );
}

function BookingDetailsModal({
  booking,
  onClose,
  onUpdate,
}: {
  booking: Booking;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const statusConfig = {
    PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
    CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-700" },
    DISPUTED: { label: "Disputed", color: "bg-red-100 text-red-700" },
    IN_PROGRESS: {
      label: "In Progress",
      color: "bg-purple-100 text-purple-700",
    },
    COMPLETED: { label: "Completed", color: "bg-green-100 text-green-700" },
    CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-700" },
    FAILED: { label: "Failed", color: "bg-red-100 text-red-700" },
  };

  const config = statusConfig[booking.status];

  return (
    <div
      className="fixed inset-0 bg-black/15 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Booking Details
            </h2>
            <p className="text-sm text-gray-600">ID: {booking.id}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${config.color}`}
          >
            {config.label}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Client Info */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Client Information</h3>
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={booking.client.avatar || "/images/avatar-placeholder.png"}
                alt={booking.client.firstName}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900">
                  {booking.client.firstName} {booking.client.lastName}
                </p>
                {booking.status === "IN_PROGRESS" && (
                  <>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                      <Mail size={14} />
                      <span>{booking.client.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                      <Phone size={14} />
                      <span>{booking.client.phone}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Service Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Service</p>
                <p className="font-medium text-gray-900">{booking.service}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-medium text-gray-900">
                  {new Date(booking.scheduledDate).toLocaleDateString()} at{" "}
                  {new Date(booking.scheduledDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Location</h3>
            <div className="flex items-start space-x-2 text-gray-700">
              <MapPin
                size={20}
                className="text-gray-400 flex-shrink-0 mt-0.5"
              />
              <div>
                <p>{booking.location}</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Payment Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-medium text-gray-900">
                  KSH {booking.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Commission (10%)</span>
                <span className="font-medium text-orange-600">
                  -KSH {booking.commission.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-bold text-gray-900">Your Payout</span>
                <span className="font-bold text-green-600">
                  KSH {booking.providerPayout.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Review */}
          {booking.review && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Client Review</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < booking.review!.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }
                    />
                  ))}
                  <span className="text-sm text-gray-600">
                    {new Date(booking.review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {booking.review.comment && (
                  <p className="text-gray-700">{booking.review.comment}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
