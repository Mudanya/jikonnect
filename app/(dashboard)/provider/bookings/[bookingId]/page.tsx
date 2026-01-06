// app/provider/bookings/[bookingId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader,
  Star,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import DisputeChatBox from "@/components/disputes/DisputeChatBox";
import DisputeStatusBadge from "@/components/bookings/DisputeStatusBadge";
import DisputeModal from "@/components/bookings/DisputeModal";

interface Booking {
  id: string;
  bookingNumber: string;
  service: string;
  category: string;
  description: string;
  amount: number;
  providerPayout: number;
  commission: number;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  locationDetails?: string;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  clientId: string;
  providerId: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string | null;
  };
  payment?: {
    id: string;
    amount: number;
    status: string;
    mpesaReceiptNumber?: string;
    paidAt?: string;
  };
  review?: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
  };
  dispute?: {
    id: string;
    reason: string;
    resolution: string | null;
    status: string;
    createdAt: string;
    raisedBy: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      role: string;
    };
  };
}

export default function ProviderBookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  useEffect(() => {
    loadBooking();
  }, []);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `/api/provider/bookings/${params.bookingId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);
      } else {
        toast.error("Failed to load booking");
        router.push("/provider/bookings");
      }
    } catch (error) {
      console.error("Failed to load booking:", error);
      toast.error("Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-purple-100 text-purple-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      DISPUTED: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="text-green-600" size={20} />;
      case "CANCELLED":
        return <XCircle className="text-red-600" size={20} />;
      case "DISPUTED":
        return <AlertTriangle className="text-orange-600" size={20} />;
      default:
        return <Clock className="text-blue-600" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Booking Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            This booking doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => router.push("/provider/bookings")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const clientRaisedDispute =
    booking.dispute && booking.dispute.raisedBy === booking.clientId;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/provider/bookings")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Bookings</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Booking Details
              </h1>
              <p className="text-gray-600">#{booking.bookingNumber}</p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(booking.status)}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  booking.status
                )}`}
              >
                {booking.status}
              </span>
            </div>
          </div>
        </div>

        {/* Earnings Summary */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-md p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Your Earnings</p>
              <p className="text-3xl font-bold">
                KES {booking.providerPayout.toLocaleString()}
              </p>
            </div>
            <TrendingUp size={40} className="text-blue-200" />
          </div>
          <div className="mt-4 pt-4 border-t border-blue-500">
            <div className="flex justify-between text-sm">
              <span className="text-blue-100">Total Amount:</span>
              <span className="font-medium">
                KES {booking.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-blue-100">Platform Fee:</span>
              <span className="font-medium">
                KES {booking.commission.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Service Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Service</p>
              <p className="font-medium text-lg">{booking.service}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Category</p>
              <p className="font-medium">{booking.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="font-medium text-lg text-blue-600">
                KES {booking.amount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Booked On</p>
              <p className="font-medium">
                {new Date(booking.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {booking.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-1">Job Description</p>
              <p className="text-gray-900">{booking.description}</p>
            </div>
          )}
        </div>

        {/* Schedule & Location */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Schedule & Location
          </h2>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Calendar className="text-blue-600 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">
                  {new Date(booking.scheduledDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="text-blue-600 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium">{booking.scheduledTime}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="text-blue-600 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{booking.address}</p>
                {booking.locationDetails && (
                  <p className="text-sm text-gray-600 mt-1">
                    {booking.locationDetails}
                  </p>
                )}
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Client's Notes:
              </p>
              <p className="text-sm text-blue-800">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Client Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Client Information
          </h2>

          <div className="flex items-start space-x-4">
            <img
              src={booking.client.avatar || "/avatar-placeholder.png"}
              alt={booking.client.firstName}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">
                {booking.client.firstName} {booking.client.lastName}
              </h3>
              {booking.status === "IN_PROGRESS" && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-gray-600">
                      {booking.client.phone}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-gray-600">
                      {booking.client.email}
                    </span>
                  </div>
                </div>
              )}
              {booking.status === "CONFIRMED" && (
                <button className="mt-4 flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <MessageSquare size={18} />
                  <span>Chat with Client</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Payment Info */}
        {booking.payment && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Payment Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    booking.payment.status === "PAID"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {booking.payment.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Amount Received</p>
                <p className="font-medium text-lg">
                  KES {booking.payment.amount.toLocaleString()}
                </p>
              </div>
              {booking.payment.mpesaReceiptNumber && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">M-Pesa Receipt</p>
                  <p className="font-medium font-mono text-sm">
                    {booking.payment.mpesaReceiptNumber}
                  </p>
                </div>
              )}
              {booking.payment.paidAt && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Paid On</p>
                  <p className="font-medium">
                    {new Date(booking.payment.paidAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Review */}
        {booking.review && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Client Review
            </h2>

            <div className="flex items-center space-x-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className={
                    star <= booking.review!.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {booking.review.rating}/5
              </span>
            </div>

            <p className="text-gray-700">{booking.review.comment}</p>
            <p className="text-xs text-gray-500 mt-2">
              Reviewed on{" "}
              {new Date(booking.review.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* ============================================ */}
        {/* DISPUTE SECTION - WITH CHAT                 */}
        {/* ============================================ */}
        {booking.status === "DISPUTED" && booking.dispute && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-red-900">
                {clientRaisedDispute ? "Client Raised Dispute" : "Your Dispute"}
              </h2>
              <DisputeStatusBadge status={booking.dispute.status as any} />
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-red-900 mb-1">
                {clientRaisedDispute ? "Client's Reason:" : "Your Reason:"}
              </p>
              <p className="text-sm text-red-800">{booking.dispute.reason}</p>
              <p className="text-xs text-gray-600 mt-1">
                Raised on{" "}
                {new Date(booking.dispute.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* ⭐ DISPUTE CHAT BOX */}
            <DisputeChatBox
              disputeId={booking.dispute.id}
              userType="provider"
              disputeStatus={booking.dispute.status as any}
            />

            {/* Resolution Display (if resolved) */}
            {booking.dispute.resolution && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-green-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm font-medium text-green-900 mb-1">
                      Admin Resolution:
                    </p>
                    <p className="text-sm text-green-800">
                      {booking.dispute.resolution}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {booking.status === "COMPLETED" && !booking.dispute && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowDisputeModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <AlertTriangle size={18} />
                <span>Raise Dispute</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dispute Modal */}
      <DisputeModal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        bookingId={booking.id}
        bookingNumber={booking.bookingNumber}
        userType="provider"
        onSuccess={loadBooking}
      />
    </div>
  );
}
