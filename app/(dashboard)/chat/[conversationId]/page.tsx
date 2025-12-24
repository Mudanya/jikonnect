"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Phone,
  Video,
  Image as ImageIcon,
  Loader2,
  Menu,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments: string[];
  status: "SENT" | "DELIVERED" | "READ";
  readAt: string | null;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  };
};

type Conversation = {
  id: string;
  clientId: string;
  providerId: string;
  lastMessage: {id: string; content:  string} | null;
  lastMessageAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  provider: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
};

export default function ChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { conversationId } = use(params);
  // Get current user
  useEffect(() => {
    setCurrentUserId(user?.id || null);
  }, []);

  // Get other participant
  const otherParticipant =
    conversation && currentUserId
      ? currentUserId === conversation.clientId
        ? conversation.provider
        : conversation.client
      : null;

  // Fetch conversation details
  useEffect(() => {
    if (!currentUserId) return;
    fetchConversation();
  }, [conversationId, currentUserId]);

  // Fetch messages
  useEffect(() => {
    if (!currentUserId) return;
    fetchMessages();
  }, [conversationId, currentUserId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!currentUserId) return;

    const interval = setInterval(() => {
      fetchMessages(true); // Silent fetch
    }, 3000);

    return () => clearInterval(interval);
  }, [conversationId, currentUserId]);

  const fetchConversation = async () => {
    try {
      // Fetch from conversations list
      const response = await fetch(`/api/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        const conv = (data.data || []).find(
          (c: Conversation) => c.id === conversationId
        );
        if (conv) {
          setConversation(conv);
        } else {
          toast.error("Conversation not found");
          router.push("/chat");
        }
      }
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
      toast.error("Failed to load conversation");
    }
  };

  const fetchMessages = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const response = await fetch(
        `/api/chat/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      if (!silent) toast.error("Failed to load messages");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      setSending(true);

      const response = await fetch(
        `/api/chat/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ content: content.trim() }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessages([...messages, data.data]);
        setContent("");
        scrollToBottom();
      } else {
        toast.error(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to access chat</p>
          <button
            onClick={() => router.push("/auth/login")}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/chat")}
            className="p-2 hover:bg-gray-100 rounded-full transition lg:hidden"
          >
            <ArrowLeft size={20} />
          </button>

          <button
            onClick={() => router.push("/chat")}
            className="hidden lg:flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={20} />
            <span>Back to Messages</span>
          </button>

          {otherParticipant && (
            <>
              <div className="relative">
                {otherParticipant.avatar ? (
                  <img
                    src={otherParticipant.avatar}
                    alt={otherParticipant.firstName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {otherParticipant.firstName.charAt(0)}
                    {otherParticipant.lastName.charAt(0)}
                  </div>
                )}
                {/* Online status indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">
                  {otherParticipant.firstName} {otherParticipant.lastName}
                </h2>
                <p className="text-xs text-gray-500">Active now</p>
              </div>
            </>
          )}
        </div>

        {/* <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition hidden md:block">
            <Phone size={20} className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition hidden md:block">
            <Video size={20} className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <MoreVertical size={20} className="text-gray-600" />
          </button>
        </div> */}
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
      >
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Send size={32} className="text-gray-300" />
            </div>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {formatDate(dateMessages[0].createdAt)}
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4">
                {dateMessages.map((message) => {
                  const isMe = message.senderId === currentUserId;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex gap-2 max-w-xs lg:max-w-md ${
                          isMe ? "flex-row-reverse" : ""
                        }`}
                      >
                        {/* Avatar */}
                        {!isMe && (
                          <div className="flex-shrink-0">
                            {message.sender.avatar ? (
                              <img
                                src={message.sender.avatar}
                                alt={message.sender.firstName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                                {message.sender.firstName.charAt(0)}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Message bubble */}
                        <div>
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isMe
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                : "bg-white border border-gray-200 text-gray-900"
                            }`}
                          >
                            <p className="text-sm break-words whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>

                          {/* Time and status */}
                          <div
                            className={`flex items-center gap-1 mt-1 px-2 ${
                              isMe ? "justify-end" : "justify-start"
                            }`}
                          >
                            <span className="text-xs text-gray-500">
                              {formatTime(message.createdAt)}
                            </span>
                            {isMe && (
                              <span className="text-xs text-gray-500">
                                {message.status === "READ" ? "✓✓" : "✓"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t px-4 py-3 shadow-lg">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          {/* <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-full transition hidden md:block"
            title="Attach file (coming soon)"
          >
            <ImageIcon size={20} className="text-gray-600" />
          </button> */}

          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />

          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            {sending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-2 px-4 text-center">
          💡 All communication stays within JiKonnect for your safety
        </p>
      </div>
    </div>
  );
}
