"use client";

import { useState } from "react";
import { X, AlertTriangle, Send, Loader } from "lucide-react";
import { toast } from "sonner";

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  bookingNumber: string;
  userType: "client" | "provider";
  onSuccess?: () => void;
}

export default function DisputeModal({
  isOpen,
  onClose,
  bookingId,
  bookingNumber,
  userType,
  onSuccess,
}: DisputeModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for the dispute");
      return;
    }

    if (reason.length < 20) {
      toast.error("Please provide at least 20 characters");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const endpoint = userType === "client"
        ? `/api/bookings/${bookingId}/dispute`
        : `/api/provider/bookings/${bookingId}/dispute`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Dispute raised successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message || "Failed to raise dispute");
      }
    } catch (error) {
      console.error("Dispute error:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="flex items-start space-x-3 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Raise Dispute</h2>
            <p className="text-sm text-gray-600 mt-1">
              Booking #{bookingNumber}
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> Disputes should only be raised for serious
            issues like service not delivered, quality issues, or payment problems.
            Our team will review and mediate.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Dispute <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe the issue in detail (minimum 20 characters)..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                {reason.length}/500 characters
              </p>
              {reason.length < 20 && reason.length > 0 && (
                <p className="text-xs text-red-500">
                  At least {20 - reason.length} more characters needed
                </p>
              )}
            </div>
          </div>

          {/* Examples */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Valid reasons include:
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Service was not delivered as agreed</li>
              <li>• Quality of work was substandard</li>
              <li>• Provider didn't show up</li>
              <li>• Incorrect charges or billing issues</li>
              <li>• Safety concerns or unprofessional behavior</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || reason.length < 20}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>Raise Dispute</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}