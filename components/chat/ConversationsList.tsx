"use client";

import { useChat } from "@/hooks/useChat";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ConversationsList() {
  const router = useRouter();
  const { conversations, loading, fetchConversations } = useChat();

  useEffect(() => {
    console.log("ChatPage mounted, fetching conversations...");
    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg shadow-md">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900   mb-1">
          No conversations yet
        </h3>
        <p className="text-sm text-gray-600">
          Start chatting with providers or clients
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 divide-y divide-gray-100">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => router.push(`/chat/${conversation.id}`)}
          className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              {conversation.otherParticipant.avatar ? (
                <img
                  src={conversation.otherParticipant.avatar}
                  alt={conversation.otherParticipant.firstName || "User"}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-blue-600 font-semibold text-lg">
                  {conversation.otherParticipant.firstName
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {conversation.otherParticipant.firstName || "Unknown User"}
                </h3>
                {conversation.lastMessage && (
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>

              {conversation.lastMessage ? (
                <p className="text-sm text-gray-600 truncate">
                  {conversation.lastMessage.content}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">No messages yet</p>
              )}

              {/* Unread badge */}
              {conversation.unreadCount > 0 && (
                <div className="mt-2">
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded-full">
                    {conversation.unreadCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
