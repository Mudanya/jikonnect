'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import Link from 'next/link';
import { CheckCheck, Loader2, Bell } from 'lucide-react';

interface NotificationListProps {
  onClose?: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const { notifications, loading, unreadCount, markAllAsRead } = useNotifications({ limit: 10 });

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No notifications</p>
            <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-gray-200 p-3">
          <Link
            href="/notifications"
            onClick={onClose}
            className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}