// components/chat/UserAdminChatButton.tsx
"use client";

import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import UserAdminChatPopup from "./UserAdminChatPopup";

export default function UserAdminChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/chat/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Count unread messages from admin
        const unread = data.conversation.messages.filter(
          (msg: any) => msg.senderType === "ADMIN" && msg.readAt === null
        ).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };
  useEffect(() => {
    // Load initial unread count
    setTimeout(async () => {
      await loadUnreadCount();
    }, 0);

    // Poll for unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);
  const handleOpen = () => {
    setIsOpen(true);
    // Reset unread count when opening
    setUnreadCount(0);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
        title="Chat with Admin"
      >
        <MessageSquare size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Popup */}
      <UserAdminChatPopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
