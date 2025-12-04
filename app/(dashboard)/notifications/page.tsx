'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { Loader2, CheckCheck, Filter, Bell } from 'lucide-react';

const notificationTypes = [
  { value: '', label: 'All Notifications' },
  { value: 'POLICY_VIOLATION', label: 'Policy Violations' },
  { value: 'STRIKE_WARNING', label: 'Strike Warnings' },
  { value: 'SECURITY_ALERT', label: 'Security Alerts' },
  { value: 'PAYMENT', label: 'Payments' },
  { value: 'JOB_UPDATE', label: 'Job Updates' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'INFO', label: 'Information' },
];

export default function NotificationsPage() {
  const [selectedType, setSelectedType] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const { notifications, loading, unreadCount, markAllAsRead, pagination } = useNotifications({
    type: selectedType || undefined,
    unreadOnly: showUnreadOnly,
    limit: 20,
  });

  return (
    <div className="min-h-screen ">
      <div className=" px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Filter by type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {notificationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Show unread only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No notifications found</h3>
              <p className="text-sm text-gray-600">
                {showUnreadOnly
                  ? "You don't have any unread notifications"
                  : selectedType
                  ? 'No notifications of this type'
                  : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}

          {/* Pagination Info */}
          {pagination.total > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600 text-center">
                Showing {notifications.length} of {pagination.total} notification
                {pagination.total !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Important Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            📌 Stay Protected with JiKonnect
          </h4>
          <p className="text-sm text-blue-700">
            All communication must stay within JiKonnect for your safety and payment protection.
            Sharing contact details or moving off-platform may result in account suspension.
          </p>
        </div>
      </div>
    </div>
  );
}