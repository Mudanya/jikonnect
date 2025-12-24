// app/bookings/page.tsx - UPDATED with Payment
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Star,
  X,
  MessageCircle,
  Phone,
  CreditCard,
} from "lucide-react";
import {
  fetchBookings,
  submitReview,
  updateBooking,
} from "@/services/apis/booking.api";
import { toast } from "sonner";
import Loading from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import { startConversation } from "@/services/apis/chat.api";
import { PaymentModal } from "@/components/payments/PaymentModal";

const Bookings = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [messagingProvider, setMessagingProvider] = useState<string | null>(
    null
  );

  const statusFilters = [
    { value: "all", label: "All", color: "gray" },
    { value: "PENDING", label: "Pending", color: "yellow" },
    { value: "CONFIRMED", label: "Confirmed", color: "blue" },
    { value: "IN_PROGRESS", label: "In Progress", color: "purple" },
    { value: "COMPLETED", label: "Completed", color: "green" },
    { value: "CANCELLED", label: "Cancelled", color: "red" },
  ];

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const data = await fetchBookings(token);
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageProvider = async (booking: any) => {
    try {
      setMessagingProvider(booking.id);
      await startConversation(
        booking.provider.id,
        `${booking.provider.firstName} ${booking.provider.lastName}`,
        router,
        localStorage.getItem("accessToken") || undefined
      );
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to open chat. Please try again.");
    } finally {
      setMessagingProvider(null);
    }
  };

  const handlePayNow = (booking: any) => {
    setPaymentBooking(booking);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setPaymentBooking(null);
    loadBookings(); // Reload to show updated status
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const data = await updateBooking({
        token,
        reason: "Cancelled by client",
        status: "CANCELLED",
        bookingId,
      });
      if (data.success) {
        toast.success("Booking cancelled successfully");
        loadBookings();
      }
    } catch (error) {
      toast.error("Failed to cancel booking:" + (error as Error).message);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedBooking) return;

    try {
      const token = localStorage.getItem("accessToken");

      const data = await submitReview(token!, selectedBooking.id, reviewForm);
      if (data.success) {
        toast.success("Review submitted successfully!");
        setShowReviewModal(false);
        setReviewForm({ rating: 5, comment: "" });
        loadBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      if (!isAuthenticated) {
        // router.push("/login");
      } else {
        loadBookings();
      }
    }, 0);
  }, [isAuthenticated]);

  const filteredBookings =
    selectedStatus === "all"
      ? bookings
      : bookings?.filter((b) => b.status === selectedStatus);

  if (!mounted || loading) return <Loading />;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mx-4 border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-end">
            <Button
              onClick={() => router.push("/services")}
              className="px-4 py-2 bg-jiko-primary text-white rounded-lg font-semibold hover:bg-jiko-primary/90"
            >
              + New Booking
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-8">
        {/* Status Filters */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedStatus === filter.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings?.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {booking.provider.firstName[0]}
                      {booking.provider.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-lg">
                          {booking.provider.firstName}{" "}
                          {booking.provider.lastName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "CONFIRMED"
                              ? "bg-blue-100 text-blue-800"
                              : booking.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : booking.status === "IN_PROGRESS"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{booking.service}</p>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar size={16} className="mr-2" />
                          {new Date(booking.scheduledDate).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock size={16} className="mr-2" />
                          {booking.scheduledTime} ({booking.duration}h)
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin size={16} className="mr-2" />
                          {booking.location}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign size={16} className="mr-2" />
                          KES {Number(booking.amount).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      KES {Number(booking.amount).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Booking #{booking.bookingNumber}
                    </div>
                  </div>
                </div>

                {booking.description && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {booking.description}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-3">
                    {booking.provider.phone && booking.status === "IN_PROGRESS" && (
                      <a
                        href={`tel:${booking.provider.phone}`}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                      >
                        <Phone size={16} />
                        <span className="text-sm font-medium">Call</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleMessageProvider(booking)}
                      disabled={messagingProvider === booking.id}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MessageCircle
                        size={16}
                        className={
                          messagingProvider === booking.id
                            ? "animate-pulse"
                            : ""
                        }
                      />
                      <span className="text-sm font-medium">
                        {messagingProvider === booking.id
                          ? "Opening..."
                          : "Message"}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Pay Now Button - Show when CONFIRMED */}
                    {booking.status === "CONFIRMED" && (
                      <button
                        onClick={() => handlePayNow(booking)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:shadow-lg transition"
                      >
                        <CreditCard size={16} />
                        <span className="text-sm font-medium">Pay Now</span>
                      </button>
                    )}

                    {/* Awaiting Confirmation - Show when PENDING */}
                    {booking.status === "PENDING" && (
                      <span className="text-sm text-yellow-600 font-medium">
                        ⏳ Awaiting provider confirmation
                      </span>
                    )}

                    {booking.status === "COMPLETED" && !booking.review && (
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowReviewModal(true);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition"
                      >
                        <Star size={16} />
                        <span className="text-sm font-medium">
                          Write Review
                        </span>
                      </button>
                    )}

                    {booking.status === "COMPLETED" && booking.review && (
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Star size={16} className="fill-yellow-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Reviewed
                        </span>
                      </div>
                    )}

                    {["PENDING", "CONFIRMED"].includes(booking.status) && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
                      >
                        <X size={16} />
                        <span className="text-sm font-medium">Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedStatus === "all"
                ? "No bookings yet"
                : `No ${selectedStatus.toLowerCase()} bookings`}
            </h3>
            <p className="text-gray-600 mb-6">
              Start by booking a service from our verified professionals
            </p>
            <button
              onClick={() => router.push("/services")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Browse Services
            </button>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Write a Review</h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewForm({ rating: 5, comment: "" });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                How was your experience with{" "}
                {selectedBooking.provider.firstName}?
              </p>
              <div className="flex justify-center space-x-2 my-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() =>
                      setReviewForm({ ...reviewForm, rating: star })
                    }
                    className="transition hover:scale-110"
                  >
                    <Star
                      size={40}
                      className={
                        star <= reviewForm.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600">
                {reviewForm.rating === 5 && "Excellent!"}
                {reviewForm.rating === 4 && "Great!"}
                {reviewForm.rating === 3 && "Good"}
                {reviewForm.rating === 2 && "Fair"}
                {reviewForm.rating === 1 && "Poor"}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share your experience (optional)
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, comment: e.target.value })
                }
                rows={4}
                placeholder="Tell us what you liked or what could be improved..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleSubmitReview}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg transition"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && paymentBooking && (
        <PaymentModal
          booking={paymentBooking}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentBooking(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Bookings;