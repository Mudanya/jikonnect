"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface DisputeMessage {
  id: string;
  senderType: "CLIENT" | "PROVIDER" | "ADMIN" | "SUPER_ADMIN";
  content: string;
  createdAt: string;
  sender: {
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

interface DisputeChatBoxProps {
  disputeId: string;
  userType: "client" | "provider";
  disputeStatus: "OPEN" | "IN_REVIEW" | "RESOLVED" | "CLOSED";
}

export default function DisputeChatBox({
  disputeId,
  userType,
  disputeStatus,
}: DisputeChatBoxProps) {
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 10 seconds
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [disputeId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/disputes/${disputeId}/message`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/disputes/${disputeId}/message`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      if (response.ok) {
        setNewMessage("");
        await loadMessages();
        toast.success("Message sent");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const getSenderTypeLabel = (senderType: string) => {
    const labels = {
      CLIENT: "Client",
      PROVIDER: "Provider",
      ADMIN: "Admin",
      SUPER_ADMIN: "Super Admin",
    };
    return labels[senderType as keyof typeof labels];
  };

  const getSenderBadgeColor = (senderType: string) => {
    const colors = {
      CLIENT: "bg-blue-100 text-blue-800",
      PROVIDER: "bg-purple-100 text-purple-800",
      ADMIN: "bg-green-100 text-green-800",
      SUPER_ADMIN: "bg-yellow-100 text-yellow-800",
    };
    return colors[senderType as keyof typeof colors];
  };

  const getMessageBgColor = (senderType: string, isOwnMessage: boolean) => {
    if (isOwnMessage) {
      return "bg-blue-600 text-white ml-auto";
    }
    if (senderType === "ADMIN" || senderType === "SUPER_ADMIN") {
      return "bg-green-50 border-green-200";
    }
    return "bg-gray-100 border-gray-200";
  };

  const isOwnMessage = (message: DisputeMessage) => {
    const currentUserType = userType === "client" ? "CLIENT" : "PROVIDER";
    return message.senderType === currentUserType;
  };

  const canSendMessages = disputeStatus === "OPEN" || disputeStatus === "IN_REVIEW";

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-2">
          <MessageSquare className="text-blue-600" size={20} />
          <h3 className="font-semibold text-gray-900">Dispute Chat</h3>
          {disputeStatus === "RESOLVED" && (
            <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Resolved
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Communicate with admin and the other party
        </p>
      </div>

      {/* Messages */}
      <div className="p-4 max-h-96 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm text-gray-600">No messages yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Start the conversation to resolve this dispute
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwn = isOwnMessage(message);
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-3 ${
                      isOwn
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {/* Sender Badge */}
                    {!isOwn && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getSenderBadgeColor(
                            message.senderType
                          )}`}
                        >
                          {getSenderTypeLabel(message.senderType)}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            isOwn ? "text-blue-100" : "text-gray-700"
                          }`}
                        >
                          {message.sender.firstName}
                        </span>
                      </div>
                    )}

                    {/* Message Content */}
                    <p
                      className={`text-sm ${
                        isOwn ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {message.content}
                    </p>

                    {/* Timestamp */}
                    <p
                      className={`text-xs mt-2 ${
                        isOwn ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      {canSendMessages ? (
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !sending && handleSendMessage()
              }
              placeholder="Type your message..."
              disabled={sending}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2"
            >
              {sending ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Messages are visible to you, the other party, and admin
          </p>
        </div>
      ) : (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            This dispute has been {disputeStatus.toLowerCase()}. No more messages
            can be sent.
          </p>
        </div>
      )}
    </div>
  );
}