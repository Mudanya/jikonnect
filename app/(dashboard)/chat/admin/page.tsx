"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader, MessageSquare, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  content: string;
  senderType: "ADMIN" | "CLIENT" | "PROVIDER";
  sender: {
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  createdAt: string;
}

export default function ChatWithAdminPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/chat/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.conversation.messages);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/chat/admin", {
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
        toast.success("Message sent to admin");
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <MessageSquare size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Chat with Admin
                </h1>
                <p className="text-xs text-gray-600">
                  Get help and support from our team
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Start a conversation
            </h2>
            <p className="text-sm text-gray-600">
              Send a message to our support team
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isAdmin = message.senderType === "ADMIN";
              const isOwnMessage = !isAdmin;

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-xl p-4 ${
                      isOwnMessage
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    {isAdmin && (
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <MessageSquare size={12} className="text-white" />
                        </div>
                        <p className="text-xs font-medium text-gray-700">
                          Admin Support
                        </p>
                      </div>
                    )}
                    <p
                      className={`text-sm ${
                        isOwnMessage ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        isOwnMessage ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !sending && sendMessage()}
              placeholder="Type your message..."
              disabled={sending}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2"
            >
              {sending ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <>
                  <Send size={20} />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Our admin team will respond as soon as possible
          </p>
        </div>
      </div>
    </div>
  );
}