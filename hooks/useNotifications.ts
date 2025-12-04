'use client';

import { useEffect, useState, useCallback } from 'react';

import { getPusherClient } from '@/lib/pusher';
import { User } from '@/types/auth';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    priority: string;
    read: boolean;
    readAt: Date | null;
    data: any;
    actionUrl: string | null;
    createdAt: Date;
}

export interface NotificationResponse {
    notifications: Notification[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    unreadCount: number;
}

export function useNotifications(options?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
}) {
    const data = localStorage.getItem('user')
    const user = JSON.parse(data!) as User
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: String(options?.page || 1),
                limit: String(options?.limit || 20),
                ...(options?.unreadOnly && { unreadOnly: 'true' }),
                ...(options?.type && { type: options.type }),
            });

            const response = await fetch(`/api/notifications?${params}`);
            if (!response.ok) throw new Error('Failed to fetch notifications');

            const data: NotificationResponse = await response.json();
            setNotifications(data.notifications);
            setPagination(data.pagination);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [user, options?.page, options?.limit, options?.unreadOnly, options?.type]);

    // Mark as read
    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
            });

            if (!response.ok) throw new Error('Failed to mark as read');

            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications/read-all', {
                method: 'PATCH',
            });

            if (!response.ok) throw new Error('Failed to mark all as read');

            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true, readAt: new Date() }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, []);

    // Setup real-time notifications with Pusher
    useEffect(() => {
        if (!user?.email) return;

        const pusher = getPusherClient();
        if (!pusher) return;

        // Use email as channel identifier since we don't have user ID in session
        const channelName = `user-${user.email.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const channel = pusher.subscribe(channelName);

        channel.bind('new-notification', (data: any) => {
            setNotifications((prev) => [data, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Show browser notification if permission granted
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(data.title, {
                    body: data.message,
                    icon: '/icon.png',
                    tag: data.id,
                });
            }
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [user]);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Request notification permission
    const requestNotificationPermission = useCallback(async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    }, []);

    return {
        notifications,
        unreadCount,
        loading,
        pagination,
        markAsRead,
        markAllAsRead,
        refetch: fetchNotifications,
        requestNotificationPermission,
    };
}
