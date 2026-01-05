"use client";

import { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  Phone,
  Loader,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface PaymentModalProps {
  booking: {
    id: string;
    service: string;
    amount: number;
    bookingNumber: string;
    provider: {
      firstName: string;
      lastName: string;
    };
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({
  booking,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "pending" | "success" | "failed"
  >("idle");
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(
    null
  );
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Format phone number
  const formatPhoneNumber = (value: string) => {
    // Remove non-digits
    let cleaned = value.replace(/\D/g, "");

    // Handle different formats
    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.substring(1);
    } else if (!cleaned.startsWith("254")) {
      cleaned = "254" + cleaned;
    }

    return cleaned;
  };

  // Initiate payment
  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (formattedPhone.length !== 12) {
      toast.error("Phone number must be 10 digits (e.g., 0712345678)");
      return;
    }

    try {
      setLoading(true);
      setPaymentStatus("pending");

      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          phoneNumber: formattedPhone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCheckoutRequestId(data.data.checkoutRequestId);
        toast.success("Payment request sent! Please check your phone.");

        // Start polling for payment status
        startPolling(data.data.paymentId);
      } else {
        toast.error(data.message || "Failed to initiate payment");
        setPaymentStatus("failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setPaymentStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  // Poll payment status
  const startPolling = (paymentId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // Poll for 2 minutes (60 * 2 seconds)

    const interval = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(`/api/payments/${paymentId}/status`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

      
        const data = await response.json()
      

        if (data.success) {
          const status = data.data.status
          

          if (status === "PAID") {
            setPaymentStatus("success");
            clearInterval(interval);
            toast.success("Payment successful! 🎉");

            // Wait 2 seconds then call onSuccess
            setTimeout(() => {
              onSuccess();
            }, 2000);
          } else if (status === "FAILED") {
            setPaymentStatus("failed");
            clearInterval(interval);
            toast.error("Payment failed. Please try again.");
          }
        }

        // Stop polling after max attempts
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPaymentStatus("failed");
          toast.error(
            "Payment verification timeout. Please check your M-Pesa messages."
          );
        }
      } catch (error) {
        console.error("Status check error:", error);
      }
    }, 2000); // Check every 2 seconds

    setPollingInterval(interval);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={paymentStatus === "pending" ? undefined : onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Make Payment</h2>
            <p className="text-sm text-gray-600">
              Booking #{booking.bookingNumber}
            </p>
          </div>
          {paymentStatus === "idle" && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Success State */}
          {paymentStatus === "success" && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h3>
              <p className="text-gray-600 mb-4">
                Your booking has been confirmed
              </p>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Service:</span>{" "}
                  {booking.service}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Amount:</span> KES{" "}
                  {booking.amount.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Failed State */}
          {paymentStatus === "failed" && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h3>
              <p className="text-gray-600 mb-6">
                Please try again or contact support if the issue persists
              </p>
              <button
                onClick={() => {
                  setPaymentStatus("idle");
                  setPhoneNumber("");
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Pending State */}
          {paymentStatus === "pending" && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Phone className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Check Your Phone
              </h3>
              <p className="text-gray-600 mb-4">
                Enter your M-Pesa PIN to complete payment
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  Amount:{" "}
                  <span className="font-bold">
                    KES {booking.amount.toLocaleString()}
                  </span>
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Loader className="animate-spin text-blue-600" size={20} />
                <span className="text-sm text-gray-600">
                  Waiting for payment...
                </span>
              </div>
            </div>
          )}

          {/* Idle State - Payment Form */}
          {paymentStatus === "idle" && (
            <>
              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Service</span>
                  <span className="font-medium text-gray-900">
                    {booking.service}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Provider</span>
                  <span className="font-medium text-gray-900">
                    {booking.provider.firstName} {booking.provider.lastName}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="font-bold text-blue-600 text-xl">
                    KES {booking.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="flex items-center space-x-3 p-4 border-2 border-green-500 rounded-lg bg-green-50">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">M</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">M-Pesa</p>
                    <p className="text-xs text-gray-600">Lipa na M-Pesa</p>
                  </div>
                </div>
              </div>

              {/* Phone Number Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  M-Pesa Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0712345678"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter your Safaricom number starting with 07 or 01
                </p>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading || !phoneNumber}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    <span>Pay KES {booking.amount.toLocaleString()}</span>
                  </>
                )}
              </button>

              {/* Info */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>How it works:</strong>
                  <br />
                  1. Enter your M-Pesa phone number
                  <br />
                  2. Click "Pay" button
                  <br />
                  3. Check your phone for M-Pesa prompt
                  <br />
                  4. Enter your M-Pesa PIN to complete
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
