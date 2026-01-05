"use client";

import { useState } from "react";
import { X, MessageSquare, Send, Loader } from "lucide-react";
import { toast } from "sonner";

interface DisputeResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  bookingNumber: string;
  disputeReason: string;
  onSuccess?: () => void;
}

export default function DisputeResponseModal({
  isOpen,
  onClose,
  bookingId,
  bookingNumber,
  disputeReason,
  onSuccess,
}: DisputeResponseModalProps) {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!response.trim()) {
      toast.error("Please provide your response");
      return;
    }

    if (response.length < 20) {
      toast.error("Please provide at least 20 characters");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const res = await fetch(
        `/api/provider/bookings/${bookingId}/dispute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ response }),
        }
      );

      const result = await res.json();

      if (result.success) {
        toast.success("Response submitted successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message || "Failed to submit response");
      }
    } catch (error) {
      console.error("Response error:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="flex items-start space-x-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageSquare className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Respond to Dispute
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Booking #{bookingNumber}
            </p>
          </div>
        </div>

        {/* Client's Dispute Reason */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-red-900 mb-2">
            Client's Dispute Reason:
          </p>
          <p className="text-sm text-red-800">{disputeReason}</p>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Your Response:</strong> Explain your side of the story. Our
            admin team will review both sides and make a fair decision.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Response <span className="text-red-500">*</span>
            </label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Provide your side of the story (minimum 20 characters)..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                {response.length}/500 characters
              </p>
              {response.length < 20 && response.length > 0 && (
                <p className="text-xs text-red-500">
                  At least {20 - response.length} more characters needed
                </p>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-700 mb-2">Tips:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Be honest and professional</li>
              <li>• Provide specific details and evidence</li>
              <li>• Mention any communication or agreements made</li>
              <li>• Describe what actually happened</li>
              <li>• Suggest a fair resolution if possible</li>
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
              disabled={loading || response.length < 20}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>Submit Response</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}