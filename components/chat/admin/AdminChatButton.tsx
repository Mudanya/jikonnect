// components/admin/AdminChatButton.tsx
"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import AdminChatPopup from "./AdminChatPopup";

export default function AdminChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

 

  const loadUnreadCount = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/admin/chat", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Calculate total unread messages
        const total = data.conversations.reduce(
          (sum: number, conv: any) => sum + (conv.unreadCount || 0),
          0
        );
        setUnreadCount(total);
      }
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };
   useEffect(() => {
    // Load initial unread count
    setTimeout(async()=>{
        await loadUnreadCount();
    },0)
   

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
        title="Admin Messages"
      >
        <MessageSquare size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Popup */}
      <AdminChatPopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}