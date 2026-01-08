"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Loader, Minimize2, Maximize2 } from "lucide-react";
import { toast } from "sonner";

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

interface UserAdminChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserAdminChatPopup({
  isOpen,
  onClose,
}: UserAdminChatPopupProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      // Poll for new messages every 5 seconds when open
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

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
        toast.success("Message sent");
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Chat Popup */}
      <div
        className={`fixed bottom-4 right-4 bg-white rounded-2xl shadow-2xl z-50 flex flex-col transition-all ${
          isMinimized ? "w-80 h-16" : "w-96 h-[500px]"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare size={20} />
            <h3 className="font-semibold">Chat with Admin</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-white/20 p-1 rounded"
            >
              {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            <button onClick={onClose} className="hover:bg-white/20 p-1 rounded">
              <X size={18} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader className="animate-spin text-gray-400" size={24} />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare
                    size={48}
                    className="mx-auto text-gray-300 mb-3"
                  />
                  <p className="text-sm text-gray-600">
                    Start a conversation with our admin team
                  </p>
                </div>
              ) : (
                <>
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
                          className={`max-w-[75%] rounded-xl px-3 py-2 ${
                            isOwnMessage
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-gray-200"
                          }`}
                        >
                          {isAdmin && (
                            <div className="flex items-center space-x-1 mb-1">
                              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                <MessageSquare size={10} className="text-white" />
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
                            className={`text-xs mt-1 ${
                              isOwnMessage ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
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
            <div className="p-3 border-t bg-white rounded-b-2xl">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !sending && sendMessage()
                  }
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {sending ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Our admin team will respond as soon as possible
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}