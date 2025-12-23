'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getPusherClient } from '@/lib/pusher';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatMessage {
    id: string;
    content: string;
    senderId: string;
    recipientId: string;
    sender: {
        id: string;
        name: string | null;
        image: string | null;
    };
    status: 'SENT' | 'DELIVERED' | 'READ' | 'BLOCKED';
    createdAt: Date;
    readAt: Date | null;
}

export interface Conversation {
    id: string;
    participant: {
        id: string;
        name: string | null;
        image: string | null;
    };
    lastMessage: ChatMessage | null;
    unreadCount: number;
    lastMessageAt: Date;
}

export function useChat(conversationId?: string) {
    const { user } = useAuth()
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        const token = localStorage.getItem('accessToken')
        try {
            const response = await fetch('/api/chat/conversations', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch conversations');

            const data = await response.json();
            setConversations(data.conversations);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Fetch messages for a conversation
    const fetchMessages = useCallback(
        async (convId?: string) => {
            const targetId = convId || conversationId;
            if (!targetId || !user) return;

            try {
                setLoading(true);
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`/api/chat/${targetId}/messages`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch messages');

                const data = await response.json();
                setMessages(data.messages);
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoading(false);
            }
        },
        [conversationId, user]
    );

    // Send message
    const sendMessage = useCallback(
        async (content: string, recipientId: string) => {
            if (!content.trim() || !recipientId || !user) return null;

            try {
                setSending(true);
                const response = await fetch('/api/chat/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                    body: JSON.stringify({
                        message: content,
                        recipientId,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    // Handle blocked message
                    if (data.blocked) {
                        return {
                            success: false,
                            blocked: true,
                            reason: data.reason,
                            strikeNumber: data.strikeNumber,
                        };
                    }
                    throw new Error(data.error || 'Failed to send message');
                }

                // Add message to local state
                setMessages((prev) => [...prev, data.message]);

                // Scroll to bottom
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);

                return { success: true, message: data.message };
            } catch (error) {
                console.error('Error sending message:', error);
                return {
                    success: false,
                    error: (error as Error).message,
                };
            } finally {
                setSending(false);
            }
        },
        [user]
    );

    // Setup real-time message listener
    useEffect(() => {
        if (!conversationId || !user) return;

        const pusher = getPusherClient();
        if (!pusher) return;

        const channel = pusher.subscribe(`chat-${conversationId}`);

        channel.bind('new-message', (data: any) => {
            // Only add if it's not from current user (to avoid duplicates)
            setMessages((prev) => {
                const exists = prev.some((msg) => msg.id === data.id);
                if (exists) return prev;
                return [...prev, data];
            });

            // Scroll to bottom
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [conversationId, user]);

    // Initial load
    useEffect(() => {
        if (conversationId) {
            fetchMessages(conversationId);
        } else {
            fetchConversations();
        }
    }, [conversationId, fetchMessages, fetchConversations]);

    return {
        messages,
        conversations,
        loading,
        sending,
        sendMessage,
        fetchMessages,
        fetchConversations,
        messagesEndRef,
    };
}