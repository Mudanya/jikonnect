import { verifyAccessToken } from '@/lib/jwt';
import logger from '@/lib/logger';
import { NotificationService } from '@/lib/notifications/notificationService';
import { prisma } from '@/prisma/prisma.init';
import { updateDispute } from '@/services/queries/admin.query';
import { createAuditLog } from '@/services/queries/auth.query';
import { NextRequest, NextResponse } from 'next/server';


export const POST = async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const { id } = await params
        const user = verifyAccessToken(token);

        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }
        if (!user || user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { message } = await req.json();

        if (!message || !message.trim()) {
            return NextResponse.json(
                { success: false, error: 'Message is required' },
                { status: 400 }
            );
        }

        const disputeId = id;



        // Update dispute status to IN_REVIEW if it was OPEN
        const dis = await updateDispute(disputeId)

        await NotificationService.create({
            userId: dis!.booking.clientId,
            type: 'INFO',
            priority: 'HIGH',
            title: 'Admin Message on Dispute',
            message: `Admin has sent a message regarding your dispute on booking #${dis!.booking.bookingNumber}`,
            actionUrl: `/bookings/${dis!.bookingId}`,
            data: { disputeId }
        });

        // Notify provider
        await NotificationService.create({
            userId: dis!.booking.providerId,
            type: 'INFO',
            priority: 'HIGH',
            title: 'Admin Message on Dispute',
            message: `Admin has sent a message regarding the dispute on booking #${dis!.booking.bookingNumber}`,
            actionUrl: `/provider/bookings/${dis!.bookingId}`,
            data: { disputeId }
        });

        // Create audit log
        await createAuditLog(req, user.userId, 'DISPUTE_MESSAGE_SENT', 'Dispute', {}, disputeId)
        // TODO: Send notification to both parties


        return NextResponse.json({
            success: true,
            message: 'Message sent successfully'
        });

    } catch (error) {
        logger.error((error as Error).message)
        return NextResponse.json(
            { success: false, error: 'Failed to send message' },
            { status: 500 }
        );
    }
}

export const GET = async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const user = verifyAccessToken(token);

        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }
        if (!user || user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;

        const messages = await prisma.disputeMessage.findMany({
            where: { id },
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

        return NextResponse.json({
            success: true,
            data: messages
        });
    } catch (error) {
        logger.error((error as Error).message)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}