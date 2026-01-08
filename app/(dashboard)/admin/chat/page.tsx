"use client";

import { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Send, 
  Loader, 
  Search, 
  User,
  Filter
} from "lucide-react";
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
    createdAt: string;
  } | null;
}

interface Message {
  id: string;
  content: string;
  senderType: "ADMIN" | "CLIENT" | "PROVIDER" | "SUPER_ADMIN";
  sender: {
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  createdAt: string;
  readAt: string | null;
}

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "CLIENT" | "PROVIDER">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    // Poll for new messages every 10 seconds
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, [filter, searchTerm]);

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
      
      const params = new URLSearchParams();
      if (filter !== "ALL") params.append("userType", filter);
      if (searchTerm) params.append("search", searchTerm);
      
      if (params.toString()) url += `?${params.toString()}`;

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

  const selectedConversation = conversations.find(
    (c) => c.user.id === selectedConv
  );

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>

          {/* Search */}
          <div className="relative mb-3">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Filter */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter("ALL")}
              className={`flex-1 py-1.5 text-sm rounded ${
                filter === "ALL"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("CLIENT")}
              className={`flex-1 py-1.5 text-sm rounded ${
                filter === "CLIENT"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Clients
            </button>
            <button
              onClick={() => setFilter("PROVIDER")}
              className={`flex-1 py-1.5 text-sm rounded ${
                filter === "PROVIDER"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Providers
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader className="animate-spin text-gray-400" size={24} />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center p-8 text-gray-500 text-sm">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv.user.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                  selectedConv === conv.user.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <img
                    src={conv.user.avatar || "/avatar-placeholder.png"}
                    alt={conv.user.firstName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {conv.user.firstName} {conv.user.lastName}
                      </h3>
                      {conv.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
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

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <img
                  src={
                    selectedConversation.user.avatar ||
                    "/avatar-placeholder.png"
                  }
                  alt={selectedConversation.user.firstName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedConversation.user.firstName}{" "}
                    {selectedConversation.user.lastName}
                  </h2>
                  <p className="text-xs text-gray-600">
                    {selectedConversation.userType} •{" "}
                    {selectedConversation.user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => {
                const isAdmin = message.senderType === "ADMIN" || message.senderType === "SUPER_ADMIN";
                return (
                  <div
                    key={message.id}
                    className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-xl p-3 ${
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
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !sending && sendMessage()
                  }
                  placeholder="Type your message..."
                  disabled={sending}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
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
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-lg">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}