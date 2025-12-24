'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatMessage {
    id: string;
    content: string;
    senderId: string;
    conversationId: string;
    sender: {
        id: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
        role: string;
    };
    status: 'SENT' | 'DELIVERED' | 'READ';
    createdAt: Date;
    readAt: Date | null;
}

export interface Conversation {
    id: string;
    clientId: string;
    providerId: string;
    otherParticipant: {
        id: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
        role: string;
    };
    lastMessage: {id: string; content: string} | null;
    unreadCount: number;
    lastMessageAt: Date;
}

export function useChat(conversationId?: string) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const mountedRef = useRef(true);

    // Fetch conversations with extensive logging
    const fetchConversations = useCallback(async () => {
        console.log('🎯 [fetchConversations] Called');
        console.log('🎯 [fetchConversations] user:', user);
        console.log('🎯 [fetchConversations] mountedRef:', mountedRef.current);
        
        if (!user || !mountedRef.current) {
            console.log('❌ [fetchConversations] Aborted - no user or not mounted');
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('accessToken');
        console.log('🔑 [fetchConversations] Token exists:', !!token);
        
        try {
            setLoading(true);
            console.log('🌐 [fetchConversations] Making API call...');
            
            const response = await fetch('/api/chat/conversations', {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            console.log('📡 [fetchConversations] Response status:', response.status);
            console.log('📡 [fetchConversations] Response ok:', response.ok);
            
            if (!mountedRef.current) {
                console.log('⚠️ [fetchConversations] Component unmounted, skipping state update');
                return;
            }
            
            if (!response.ok) {
                console.error('❌ [fetchConversations] Response not OK');
                throw new Error('Failed to fetch conversations');
            }

            const data = await response.json();
            console.log('📦 [fetchConversations] Raw API response:', data);
            console.log('📦 [fetchConversations] Response keys:', Object.keys(data));
            console.log('📦 [fetchConversations] Has data.data?', !!data.data);
            console.log('📦 [fetchConversations] Has data.conversations?', !!data.conversations);
            
            // Extract conversations from response
            const conversationsArray = data.data || data.conversations || [];
            console.log('📊 [fetchConversations] Extracted conversations:', conversationsArray);
            console.log('📊 [fetchConversations] Is array?', Array.isArray(conversationsArray));
            console.log('📊 [fetchConversations] Length:', conversationsArray.length);
            
            if (Array.isArray(conversationsArray)) {
                console.log('✅ [fetchConversations] Setting conversations state with', conversationsArray.length, 'items');
                setConversations(conversationsArray);
                console.log('✅ [fetchConversations] State update called');
            } else {
                console.error('❌ [fetchConversations] conversationsArray is not an array!', typeof conversationsArray);
            }
            
        } catch (error) {
            console.error('❌ [fetchConversations] Error:', error);
        } finally {
            if (mountedRef.current) {
                console.log('🏁 [fetchConversations] Setting loading to false');
                setLoading(false);
            }
        }
    }, [user]);

    // Fetch messages for a conversation
    const fetchMessages = useCallback(
        async (convId?: string) => {
            const targetId = convId || conversationId;
            if (!targetId || !user || !mountedRef.current) return;

            try {
                setLoading(true);
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`/api/chat/${targetId}/messages`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!mountedRef.current) return;

                if (!response.ok) throw new Error('Failed to fetch messages');

                const data = await response.json();
                setMessages(data.data || data.messages || []);
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                if (mountedRef.current) {
                    setLoading(false);
                }
            }
        },
        [conversationId, user]
    );

    // Send message with optimistic update
    const sendMessage = useCallback(
        async (content: string, recipientId: string) => {
            if (!content.trim() || !recipientId || !user) return null;

            setSending(true);

            const optimisticMessage: ChatMessage = {
                id: `temp-${Date.now()}`,
                content,
                senderId: user.id,
                conversationId: conversationId || 'temp',
                status: 'SENT',
                createdAt: new Date(),
                readAt: null,
                sender: {
                    id: user.id,
                    firstName: user.firstName || 'You',
                    lastName: user.lastName || '',
                    avatar: user.avatar || null,
                    role: user.role || 'CLIENT',
                },
            };

            setMessages((prev) => [...prev, optimisticMessage]);

            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

            try {
                const response = await fetch('/api/chat/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                    body: JSON.stringify({
                        message: content,
                        recipientId,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setMessages((prev) => 
                        prev.filter((msg) => msg.id !== optimisticMessage.id)
                    );

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

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === optimisticMessage.id ? data.message : msg
                    )
                );

                return { success: true, message: data.message };
            } catch (error) {
                console.error('Error sending message:', error);
                setMessages((prev) =>
                    prev.filter((msg) => msg.id !== optimisticMessage.id)
                );
                return {
                    success: false,
                    error: (error as Error).message,
                };
            } finally {
                setSending(false);
            }
        },
        [user, conversationId]
    );

    // Fetch on mount
    useEffect(() => {
        console.log('🔄 [useEffect] Triggered');
        console.log('🔄 [useEffect] conversationId:', conversationId);
        console.log('🔄 [useEffect] user:', user);
        
        mountedRef.current = true;
        
        if (!conversationId && user) {
            console.log('✅ [useEffect] Calling fetchConversations (no conversationId)');
            fetchConversations();
        } else if (conversationId && user) {
            console.log('✅ [useEffect] Calling fetchMessages (has conversationId)');
            fetchMessages(conversationId);
        }

        return () => {
            console.log('🧹 [useEffect] Cleanup - unmounting');
            mountedRef.current = false;
        };
    }, [conversationId, user, fetchConversations, fetchMessages]);

    // Log state changes
    useEffect(() => {
        console.log('📊 [State Change] conversations:', conversations.length);
        console.log('📊 [State Change] conversations data:', conversations);
    }, [conversations]);

    useEffect(() => {
        console.log('⏳ [State Change] loading:', loading);
    }, [loading]);

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