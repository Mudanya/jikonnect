// app/chat/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, ArrowLeft, Loader, MessageSquare } from "lucide-react";

interface Conversation {
  id: string;
  type: 'BOOKING' | 'ADMIN';
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  // Booking type fields
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  provider?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  booking?: {
    id: string;
    status: string;
    service: {
      name: string;
    };
  };
  clientId?: string;
  providerId?: string;
  // Admin type fields
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    role: string;
  };
  admin?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  userType?: string;
  userId?: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/chat/conversations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch conversations");

      const result = await response.json();
      if (result.success) {
        setConversations(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (conv: Conversation) => {
    if (conv.type === 'ADMIN') {
      // For admin conversations
      if (conv.user) {
        // Current user is admin, other user is client/provider
        return {
          id: conv.user.id,
          name: `${conv.user.firstName} ${conv.user.lastName}`,
          avatar: conv.user.avatar,
          role: conv.user.role,
        };
      } else if (conv.admin) {
        // Current user is client/provider, other user is admin
        return {
          id: conv.admin.id,
          name: `${conv.admin.firstName} ${conv.admin.lastName}`,
          avatar: conv.admin.avatar,
          role: 'Admin Support',
        };
      }
    } else {
      // For booking conversations
      const user = localStorage.getItem("userId");
      if (conv.clientId === user && conv.provider) {
        return {
          id: conv.provider.id,
          name: `${conv.provider.firstName} ${conv.provider.lastName}`,
          avatar: conv.provider.avatar,
          role: 'Provider',
        };
      } else if (conv.client) {
        return {
          id: conv.client.id,
          name: `${conv.client.firstName} ${conv.client.lastName}`,
          avatar: conv.client.avatar,
          role: 'Client',
        };
      }
    }
    return null;
  };

  const handleConversationClick = (conv: Conversation) => {
    if (conv.type === 'ADMIN') {
    
      if (conv.user) {
        // Admin viewing user's chat
        router.push(`/admin/chat`);
      } else {
        // User viewing admin chat
        router.push(`/chat/admin`);
      }
    } else {
      // Navigate to booking conversation
      router.push(`/chat/${conv.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="flex items-center space-x-2">
              <MessageCircle size={24} className="text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              No conversations yet
            </h2>
            <p className="text-sm text-gray-600">
              Start chatting with providers or contact admin support
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const otherUser = getOtherUser(conv);
              if (!otherUser) return null;

              return (
                <div
                  key={conv.id}
                  onClick={() => handleConversationClick(conv)}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {otherUser.avatar ? (
                        <img
                          src={otherUser.avatar}
                          alt={otherUser.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <MessageSquare size={24} className="text-blue-600" />
                        </div>
                      )}
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                          {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Name and Badge */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {otherUser.name}
                          </h3>
                          {conv.type === 'ADMIN' && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                              Admin Support
                            </span>
                          )}
                          {conv.type === 'BOOKING' && conv.booking && (
                            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                              {conv.booking.service.name}
                            </span>
                          )}
                        </div>
                        {conv.lastMessageAt && (
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {new Date(conv.lastMessageAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Role */}
                      <p className="text-xs text-gray-500 mb-1">
                        {conv.type === 'ADMIN' ? 'Support Chat' : otherUser.role}
                      </p>

                      {/* Last Message */}
                      {conv.lastMessage && (
                        <p className={`text-sm truncate ${
                          conv.unreadCount > 0 
                            ? 'text-gray-900 font-medium' 
                            : 'text-gray-600'
                        }`}>
                          {conv.lastMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}