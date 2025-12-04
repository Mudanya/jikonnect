'use client';

import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  DollarSign,
  Briefcase,
  Shield,
  Bell,
} from 'lucide-react';
import { Notification } from '@/hooks/useNotifications';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
}

const notificationIcons = {
  INFO: Info,
  WARNING: AlertTriangle,
  ERROR: AlertCircle,
  SUCCESS: CheckCircle,
  SECURITY_ALERT: Shield,
  POLICY_VIOLATION: AlertTriangle,
  STRIKE_WARNING: AlertCircle,
  PAYMENT: DollarSign,
  JOB_UPDATE: Briefcase,
  SYSTEM: Bell,
};

const notificationColors = {
  INFO: 'bg-blue-100 text-blue-600',
  WARNING: 'bg-yellow-100 text-yellow-600',
  ERROR: 'bg-red-100 text-red-600',
  SUCCESS: 'bg-green-100 text-green-600',
  SECURITY_ALERT: 'bg-purple-100 text-purple-600',
  POLICY_VIOLATION: 'bg-orange-100 text-orange-600',
  STRIKE_WARNING: 'bg-red-100 text-red-600',
  PAYMENT: 'bg-emerald-100 text-emerald-600',
  JOB_UPDATE: 'bg-blue-100 text-blue-600',
  SYSTEM: 'bg-gray-100 text-gray-600',
};

const priorityBorders = {
  LOW: '',
  MEDIUM: '',
  HIGH: 'border-l-4 border-l-orange-500',
  URGENT: 'border-l-4 border-l-red-500',
};

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const router = useRouter();
  const { markAsRead } = useNotifications();

  const Icon =
    notificationIcons[notification.type as keyof typeof notificationIcons] || Bell;
  const colorClass =
    notificationColors[notification.type as keyof typeof notificationColors] ||
    notificationColors.INFO;
  const borderClass =
    priorityBorders[notification.priority as keyof typeof priorityBorders] || '';

  const handleClick = async () => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }

    onClose?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
        !notification.read ? 'bg-blue-50' : ''
      } ${borderClass}`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={`text-sm font-semibold text-gray-900 ${
                !notification.read ? 'font-bold' : ''
              }`}
            >
              {notification.title}
            </h4>
            {!notification.read && (
              <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5"></span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{notification.message}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </span>
            {notification.priority === 'URGENT' && (
              <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                Urgent
              </span>
            )}
            {notification.priority === 'HIGH' && (
              <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                High
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}