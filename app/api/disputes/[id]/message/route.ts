// app/api/disputes/[disputeId]/message/route.ts
import { verifyAccessToken } from '@/lib/jwt';
import logger from '@/lib/logger';
import { NotificationService } from '@/lib/notifications/notificationService';
import { prisma } from '@/prisma/prisma.init';
import { NextRequest, NextResponse } from 'next/server';


export const POST = async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const { message } = await req.json();
        const { id:disputeId } = await params;

        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const user = verifyAccessToken(token);

        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }
        if (user.role !== 'CLIENT' && user.role !== 'PROFESSIONAL' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }
        const userId = user.userId;

        // Validate message
        if (!message || message.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: 'Message cannot be empty' },
                { status: 400 }
            );
        }

        // Get dispute with booking info
        const dispute = await prisma.dispute.findUnique({
            where: { id: disputeId },
            include: {
                booking: {
                    select: {
                        clientId: true,
                        providerId: true,
                        bookingNumber: true
                    }
                },
                user: {
                    select: {
                        role: true
                    }
                }
            }
        });

        if (!dispute) {
            return NextResponse.json(
                { success: false, message: 'Dispute not found' },
                { status: 404 }
            );
        }

        // Check if user is part of this dispute
        const isClient = dispute.booking.clientId === userId;
        const isProvider = dispute.booking.providerId === userId;
        const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

        if (!isClient && !isProvider && !isAdmin) {
            return NextResponse.json(
                { success: false, message: 'You are not authorized to access this dispute' },
                { status: 403 }
            );
        }

        // Determine sender type
        const senderType = isClient ? 'CLIENT' : isAdmin ? 'ADMIN' : 'PROVIDER';

        // Create message
        const disputeMessage = await prisma.disputeMessage.create({
            data: {
                disputeId,
                senderId: userId,
                senderType,
                content: message.trim()
            },
            include: {
                sender: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                }
            }
        });

        // Update dispute status to IN_REVIEW if it's OPEN
        if (dispute.status === 'OPEN') {
            await prisma.dispute.update({
                where: { id: disputeId },
                data: { status: 'IN_REVIEW' }
            });
        }

        // Notify the other party
        const recipientId = isClient ? dispute.booking.providerId : dispute.booking.clientId;
        await NotificationService.create({
            userId: recipientId,
            type: 'INFO',
            priority: 'HIGH',
            title: 'New Message in Dispute',
            message: `${senderType} has sent a message in the dispute for booking #${dispute.booking.bookingNumber}`,
            actionUrl: isClient ? `/provider/bookings/${dispute.bookingId}` : `/bookings/${dispute.bookingId}`,
            data: { disputeId }
        });

        // Notify admin
        const admins = await prisma.user.findMany({
            where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
            select: { id: true }
        });

        for (const admin of admins) {
            await NotificationService.create({
                userId: admin.id,
                type: 'INFO',
                priority: 'MEDIUM',
                title: 'New Dispute Message',
                message: `${senderType} sent a message in dispute for booking #${dispute.booking.bookingNumber}`,
                actionUrl: `/admin/disputes/${dispute.id}`,
                data: { disputeId }
            });
        }

        return NextResponse.json({
            success: true,
            data: disputeMessage
        });

    } catch (error: any) {
        console.error('Send dispute message error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};

// GET - Get all messages for a dispute (user must be part of dispute)
export const GET = async (req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {

        const { id} = await params;
        logger.warn(`Fetching messages for dispute ID: ${id}`);
        const disputeId = id;
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const user = verifyAccessToken(token);

        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }
        if (user.role !== 'CLIENT' && user.role !== 'PROFESSIONAL' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }
        const userId = user.userId;
        // Get dispute and verify user access
        const dispute = await prisma.dispute.findUnique({
            where: { id:disputeId },
            include: {
                booking: {
                    select: {
                        clientId: true,
                        providerId: true
                    }
                }
            }
        });

        if (!dispute) {
            return NextResponse.json(
                { success: false, message: 'Dispute not found' },
                { status: 404 }
            );
        }

        // Check if user is part of this dispute
        const isClient = dispute.booking.clientId === userId;
        const isProvider = dispute.booking.providerId === userId;
        const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

        if (!isClient && !isProvider && !isAdmin) {
            return NextResponse.json(
                { success: false, message: 'You are not authorized to access this dispute' },
                { status: 403 }
            );
        }

        const messages = await prisma.disputeMessage.findMany({
            where: { disputeId },
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
        });

        // Mark messages as read by this user
        await prisma.disputeMessage.updateMany({
            where: {
                disputeId,
                senderId: { not: userId },
                readAt: null
            },
            data: {
                readAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            data: messages
        });

    } catch (error: any) {
        console.error('Get dispute messages error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};