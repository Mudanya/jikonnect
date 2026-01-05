import logger from '@/lib/logger';
import { NotificationService } from '@/lib/notifications/notificationService';
import { prisma } from '@/prisma/prisma.init';
import { NextRequest, NextResponse } from 'next/server';

// POST - Client raises a dispute
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
        const { verifyAccessToken } = await import('@/lib/jwt');
        const user = verifyAccessToken(token);

        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        const { reason } = await req.json();
        const { id: bookingId } = await params;
        const clientId = user.userId;

        // Validate booking belongs to client
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                clientId
            },
            include: {
                provider: true,
                dispute: true
            }
        });

        if (!booking) {
            return NextResponse.json(
                { success: false, message: 'Booking not found' },
                { status: 404 }
            );
        }

        // Check if dispute already exists
        if (booking.dispute) {
            return NextResponse.json(
                { success: false, message: 'Dispute already exists for this booking' },
                { status: 400 }
            );
        }

        // Can only dispute COMPLETED or IN_PROGRESS bookings
        if (!['COMPLETED', 'IN_PROGRESS'].includes(booking.status)) {
            return NextResponse.json(
                { success: false, message: 'Can only dispute completed or in-progress bookings' },
                { status: 400 }
            );
        }
        logger.warn(`Booking details: ${JSON.stringify(booking)}`);

        // Create dispute
        const dispute = await prisma.dispute.create({
            data: {
                bookingId,
                raisedBy: clientId,
                reason,
                status: 'OPEN'
            }
        });

        // Update booking status to DISPUTED
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'DISPUTED' }
        });

        // Notify provider
        await NotificationService.create({
            userId: booking.providerId,
            type: 'WARNING',
            priority: 'HIGH',
            title: 'Dispute Raised ⚠️',
            message: `The client has raised a dispute for booking #${booking.bookingNumber}. Please respond within 24 hours.`,
            actionUrl: `/provider/bookings/${bookingId}`,
            data: { disputeId: dispute.id, bookingId }
        });

        // Notify admin
        const admins = await prisma.user.findMany({
            where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
            select: { id: true }
        });

        for (const admin of admins) {
            await NotificationService.create({
                userId: admin.id,
                type: 'WARNING',
                priority: 'HIGH',
                title: 'New Dispute Requires Review',
                message: `Client raised dispute for booking #${booking.bookingNumber}`,
                actionUrl: `/admin/disputes/${dispute.id}`,
                data: { disputeId: dispute.id }
            });
        }

        // Log action
        await prisma.auditLogs.create({
            data: {
                userId: clientId,
                action: 'DISPUTE_RAISED',
                entity: 'Dispute',
                entityId: dispute.id,
                details: { bookingId, reason },
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
                userAgent: req.headers.get('user-agent')
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Dispute raised successfully',
            data: dispute
        });

    } catch (error: any) {
        console.error('Raise dispute error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};