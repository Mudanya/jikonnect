// app/api/admin/chat/[userId]/route.ts
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/prisma/prisma.init';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get conversation with a specific user
export const GET = async (
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) => {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);

        const userHed = verifyAccessToken(token);

        if (!userHed) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }
        if (!userHed || userHed.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }
        const { userId } = await params;
        const adminId = userHed.userId;

        // Get user to determine type
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, firstName: true, lastName: true }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        const userType = user.role === 'PROFESSIONAL' ? 'PROVIDER' : 'CLIENT';

        // Get or create conversation
        let conversation = await prisma.adminConversation.findUnique({
            where: {
                adminId_userId_userType: {
                    adminId,
                    userId,
                    userType
                }
            },
            include: {
                messages: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                                role: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                },
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        avatar: true,
                        role: true
                    }
                }
            }
        });

        // Create conversation if doesn't exist
        if (!conversation) {
            conversation = await prisma.adminConversation.create({
                data: {
                    adminId,
                    userId,
                    userType
                },
                include: {
                    messages: {
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    avatar: true,
                                    role: true
                                }
                            }
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            avatar: true,
                            role: true
                        }
                    }
                }
            });
        }

        // Mark messages as read by admin
        await prisma.adminMessage.updateMany({
            where: {
                conversationId: conversation.id,
                senderId: userId,
                readAt: null
            },
            data: {
                readAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            conversation
        });

    } catch (error: any) {
        console.error('Get admin conversation error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};

// POST - Admin sends message to user
export const POST = async (
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) => {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);

        const userHed = verifyAccessToken(token);

        if (!userHed) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }
        if (!userHed || userHed.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }
        const { userId } = await params;
        const adminId = userHed.userId;
        const { message, attachments = [] } = await req.json();

        if (!message?.trim()) {
            return NextResponse.json(
                { success: false, message: 'Message cannot be empty' },
                { status: 400 }
            );
        }

        // Get user to determine type
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                role: true,
                firstName: true,
                lastName: true,
                email: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        const userType = user.role === 'PROFESSIONAL' ? 'PROVIDER' : 'CLIENT';

        // Get or create conversation
        let conversation = await prisma.adminConversation.findUnique({
            where: {
                adminId_userId_userType: {
                    adminId,
                    userId,
                    userType
                }
            }
        });

        if (!conversation) {
            conversation = await prisma.adminConversation.create({
                data: {
                    adminId,
                    userId,
                    userType
                }
            });
        }

        // Create message
        const adminMessage = await prisma.adminMessage.create({
            data: {
                conversationId: conversation.id,
                senderId: adminId,
                senderType: 'ADMIN',
                content: message.trim(),
                attachments
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                }
            }
        });

        // Update conversation lastMessageAt
        await prisma.adminConversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() }
        });

        return NextResponse.json({
            success: true,
            message: adminMessage
        });

    } catch (error: any) {
        console.error('Send admin message error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};