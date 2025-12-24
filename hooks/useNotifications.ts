'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
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
    pollingInterval?: number; // Allow custom polling interval
}) {
    const data = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    const user = data ? (JSON.parse(data) as User) : null;

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    // Refs for polling optimization
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const mountedRef = useRef(true);
    const lastFetchRef = useRef<number>(0);
    const isActiveRef = useRef(true);
    const previousUnreadCountRef = useRef<number>(0);

    // Fetch notifications with debouncing
    const fetchNotifications = useCallback(async () => {
        if (!user || !mountedRef.current) {
            setLoading(false);
            return;
        }

        // Debounce - don't fetch more than once per 5 seconds
        const now = Date.now();
        if (now - lastFetchRef.current < 5000) {
            return;
        }
        lastFetchRef.current = now;

        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: String(options?.page || 1),
                limit: String(options?.limit || 20),
                ...(options?.unreadOnly && { unreadOnly: 'true' }),
                ...(options?.type && { type: options.type }),
            });

            const response = await fetch(`/api/notifications?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!mountedRef.current) return;

            if (!response.ok) throw new Error('Failed to fetch notifications');

            const data: NotificationResponse = await response.json();
            
            setNotifications(data.notifications);
            setPagination(data.pagination);
            
            // Check if there are new notifications
            const hasNewNotifications = data.unreadCount > previousUnreadCountRef.current;
            
            if (hasNewNotifications && previousUnreadCountRef.current > 0) {
                // Find the new notifications
                const newNotifications = data.notifications.filter(
                    notif => !notif.read && 
                    !notifications.find(existing => existing.id === notif.id)
                );

                // Show browser notification for new items
                if ('Notification' in window && Notification.permission === 'granted') {
                    newNotifications.forEach(notif => {
                        new Notification(notif.title, {
                            body: notif.message,
                            icon: '/icon.png',
                            tag: notif.id,
                        });
                    });
                }
            }
            
            previousUnreadCountRef.current = data.unreadCount;
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, [user, token, options?.page, options?.limit, options?.unreadOnly, options?.type, notifications]);

    // Mark as read
    const markAsRead = useCallback(
        async (notificationId: string) => {
            try {
                const response = await fetch(`/api/notifications/${notificationId}/read`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error('Failed to mark as read');

                // Optimistic update
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n
                    )
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
                previousUnreadCountRef.current = Math.max(0, previousUnreadCountRef.current - 1);
            } catch (error) {
                console.error('Error marking notification as read:', error);
                // Revert optimistic update on error
                fetchNotifications();
            }
        },
        [token, fetchNotifications]
    );

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications/read-all', {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to mark all as read');

            // Optimistic update
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true, readAt: new Date() }))
            );
            setUnreadCount(0);
            previousUnreadCountRef.current = 0;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            // Revert optimistic update on error
            fetchNotifications();
        }
    }, [token, fetchNotifications]);

    // Request notification permission
    const requestNotificationPermission = useCallback(async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    }, []);

    // Smart polling setup
    useEffect(() => {
        if (!user) return;

        mountedRef.current = true;

        // Fetch immediately
        fetchNotifications();

        // Setup visibility change handler
        const handleVisibilityChange = () => {
            isActiveRef.current = !document.hidden;

            if (document.hidden) {
                // Tab hidden - stop polling
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            } else {
                // Tab visible - fetch and resume polling
                fetchNotifications();
                startPolling();
            }
        };

        // Setup focus handler - fetch when window gains focus
        const handleFocus = () => {
            if (isActiveRef.current) {
                fetchNotifications();
            }
        };

        const startPolling = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            // Poll every 30 seconds (or custom interval) when tab is active
            const interval = options?.pollingInterval || 30000; // Default 30 seconds
            
            intervalRef.current = setInterval(() => {
                if (isActiveRef.current && mountedRef.current) {
                    fetchNotifications();
                }
            }, interval);
        };

        startPolling();
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            mountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [user, fetchNotifications, options?.pollingInterval]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
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