// app/api/chat/[conversationId]/messages/route.ts
import { MessageFilter } from '@/lib/chat/messageFilter';
import { verifyAccessToken } from '@/lib/jwt';
import { NotificationService } from '@/lib/notifications/notificationService';
import { prisma } from '@/prisma/prisma.init';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {

        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const { conversationId } = await params
        const token = authHeader.substring(7);

        const veruser = verifyAccessToken(token);

        if (!veruser) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }


        const user = await prisma.user.findUnique({
            where: { email: veruser.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }


        // Verify user is part of this conversation
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            select: {
                id: true,
                clientId: true,
                providerId: true,
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        // Check if user is participant (either client or provider)
        if (
            conversation.clientId !== user.id &&
            conversation.providerId !== user.id
        ) {
            return NextResponse.json(
                { error: 'Forbidden. You are not part of this conversation' },
                { status: 403 }
            );
        }

        // Get messages with pagination
        const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
        const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            prisma.message.findMany({
                where: { conversationId },
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.message.count({
                where: { conversationId },
            }),
        ]);

        // Mark unread messages as read (messages not sent by current user)
        const unreadMessageIds = messages
            .filter(msg => msg.senderId !== user.id && msg.status !== 'READ')
            .map(msg => msg.id);

        if (unreadMessageIds.length > 0) {
            await prisma.message.updateMany({
                where: {
                    id: { in: unreadMessageIds },
                },
                data: {
                    status: 'READ',
                    readAt: new Date(),
                },
            });
        }

        return NextResponse.json({
            success: true,
            data: messages.reverse(), // Oldest first
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

// POST - Send a new message
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const { conversationId } = await params
        const token = authHeader.substring(7);

        const veruser = verifyAccessToken(token);

        if (!veruser) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }


        const user = await prisma.user.findUnique({
            where: { email: veruser.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await req.json();

        const { content } = body;

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: 'Message content is required' },
                { status: 400 }
            );
        }

        // Verify user is part of this conversation
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            select: {
                id: true,
                clientId: true,
                providerId: true,
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        if (
            conversation.clientId !== user.id &&
            conversation.providerId !== user.id
        ) {
            return NextResponse.json(
                { error: 'Forbidden. You are not part of this conversation' },
                { status: 403 }
            );
        }
        // Check if user is suspended
        const isSuspended = await MessageFilter.isUserSuspended(user.id);
        if (isSuspended) {
            return NextResponse.json(
                {
                    error: 'Your account is suspended',
                    blocked: true,
                    reason: 'Account suspended due to policy violations',
                },
                { status: 403 }
            );
        }

        // 🛡️ FILTER MESSAGE FOR PROHIBITED CONTENT
        const filterResult = await MessageFilter.filterMessage(content, user.id);
        if (!filterResult.allowed) {

            await NotificationService.create(
                {
                    userId: user.id,
                    type: 'POLICY_VIOLATION',
                    priority: 'HIGH',
                    title: 'Policy Violation',
                    message: `${filterResult.reason}`,

                }
            );
            return NextResponse.json(
                {
                    error: 'Your message was blocked due contact sharing violations',
                    blocked: true,
                    reason: 'Account suspended due to policy violations',
                },
                { status: 403 }
            );
        }
        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId: user.id,
                content: content.trim(),
                status: 'SENT',
                recipientId:
                    conversation.clientId === user.id
                        ? conversation.providerId
                        : conversation.clientId,

            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        role: true,
                    },
                },
            },
        });

        // Update conversation's last message
        await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessage: content.trim(),
                lastMessageAt: new Date(),
            },
        });
        return NextResponse.json({
            success: true,
            data: message,
            message: 'Message sent successfully',
        });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}

