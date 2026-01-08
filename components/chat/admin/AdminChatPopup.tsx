"use client";

import {
    Loader,
    Maximize2,
    MessageSquare,
    Minimize2,
    Search,
    Send,
    X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Conversation {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;  
    role: string;
  };
  userType: "CLIENT" | "PROVIDER";
  status: string;
  lastMessageAt: string | null;
  unreadCount: number;
  lastMessage: {
    content: string;
    senderType: string;
    createdAt: string;
  } | null;
}

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

interface AdminChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminChatPopup({
  isOpen,
  onClose,
}: AdminChatPopupProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
      // Poll for new messages every 10 seconds when open
      const interval = setInterval(loadConversations, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen, searchTerm]);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv);
    }
  }, [selectedConv]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      let url = "/api/admin/chat";
      if (searchTerm) url += `?search=${searchTerm}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/admin/chat/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.conversation.messages);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/admin/chat/${selectedConv}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      if (response.ok) {
        setNewMessage("");
        await loadMessages(selectedConv);
        await loadConversations();
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

  const handleBack = () => {
    setSelectedConv(null);
    setMessages([]);
  };

  const selectedConversation = conversations.find(
    (c) => c.user.id === selectedConv
  );

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Chat Popup */}
      <div
        ref={popupRef}
        className={`fixed bottom-4 right-4 bg-white rounded-2xl shadow-2xl z-50 flex flex-col transition-all ${
          isMinimized ? "w-80 h-16" : "w-[480px] h-[600px]"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare size={20} />
            <h3 className="font-semibold">
              {selectedConversation
                ? `${selectedConversation.user.firstName} ${selectedConversation.user.lastName}`
                : "Admin Messages"}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-white/20 p-1 rounded"
            >
              {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            <button
              onClick={onClose}
              className="hover:bg-white/20 p-1 rounded"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Conversation List View */}
            {!selectedConv && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search */}
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader className="animate-spin text-gray-400" size={24} />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="text-center p-8 text-gray-500 text-sm">
                      {searchTerm ? "No conversations found" : "No messages yet"}
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConv(conv.user.id)}
                        className="p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition"
                      >
                        <div className="flex items-start space-x-3">
                          <img
                            src={conv.user.avatar || "/avatar-placeholder.png"}
                            alt={conv.user.firstName}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-sm text-gray-900 truncate">
                                {conv.user.firstName} {conv.user.lastName}
                              </h4>
                              {conv.unreadCount > 0 && (
                                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              {conv.userType}
                            </p>
                            {conv.lastMessage && (
                              <p className="text-xs text-gray-500 truncate">
                                {conv.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Chat View */}
            {selectedConv && selectedConversation && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="p-3 border-b bg-gray-50 flex items-center space-x-3">
                  <button
                    onClick={handleBack}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    ←
                  </button>
                  <img
                    src={
                      selectedConversation.user.avatar ||
                      "/avatar-placeholder.png"
                    }
                    alt={selectedConversation.user.firstName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                      {selectedConversation.user.firstName}{" "}
                      {selectedConversation.user.lastName}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {selectedConversation.userType}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
                  {messages.map((message) => {
                    const isAdmin = message.senderType === "ADMIN";
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isAdmin ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-xl px-3 py-2 ${
                            isAdmin
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-gray-200"
                          }`}
                        >
                          {!isAdmin && (
                            <p className="text-xs font-medium text-gray-600 mb-1">
                              {message.sender.firstName}
                            </p>
                          )}
                          <p
                            className={`text-sm ${
                              isAdmin ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isAdmin ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-3 border-t bg-white">
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
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}