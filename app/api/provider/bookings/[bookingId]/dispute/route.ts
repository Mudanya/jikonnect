// app/api/provider/bookings/[bookingId]/dispute/route.ts
import { verifyAccessToken } from '@/lib/jwt';
import { NotificationService } from '@/lib/notifications/notificationService';
import { prisma } from '@/prisma/prisma.init';
import { NextRequest, NextResponse } from 'next/server';

// POST - Provider responds to dispute OR raises dispute
export const POST = async (
    req: NextRequest,
    { params }: { params: Promise<{ bookingId: string }> }
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
        if (user.role !== 'PROFESSIONAL') {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }
        const { reason, response } = await req.json();
        const { bookingId } = await params
        const providerId = user.userId;

        // Validate booking belongs to provider
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                providerId
            },
            include: {
                client: true,
                dispute: true
            }
        });

        if (!booking) {
            return NextResponse.json(
                { success: false, message: 'Booking not found' },
                { status: 404 }
            );
        }

        // CASE 1: Provider raising new dispute
        if (reason && !booking.dispute) {
            // Can only dispute COMPLETED or IN_PROGRESS bookings
            if (!['COMPLETED', 'IN_PROGRESS'].includes(booking.status)) {
                return NextResponse.json(
                    { success: false, message: 'Can only dispute completed or in-progress bookings' },
                    { status: 400 }
                );
            }

            const dispute = await prisma.dispute.create({
                data: {
                    bookingId,
                    raisedBy: providerId,
                    reason,
                    status: 'OPEN'
                }
            });

            await prisma.booking.update({
                where: { id: bookingId },
                data: { status: 'DISPUTED' }
            });

            // Notify client
            await NotificationService.create({
                userId: booking.clientId,
                type: 'WARNING',
                priority: 'HIGH',
                title: 'Provider Raised Dispute ⚠️',
                message: `The provider has raised a dispute for booking #${booking.bookingNumber}.`,
                actionUrl: `/bookings/${bookingId}`,
                data: { disputeId: dispute.id, bookingId }
            });

            // Notify admins
            const admins = await prisma.user.findMany({
                where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
                select: { id: true }
            });

            for (const admin of admins) {
                await NotificationService.create({
                    userId: admin.id,
                    type: 'WARNING',
                    priority: 'HIGH',
                    title: 'New Dispute - Provider',
                    message: `Provider raised dispute for booking #${booking.bookingNumber}`,
                    actionUrl: `/admin/disputes/${dispute.id}`,
                    data: { disputeId: dispute.id }
                });
            }

            return NextResponse.json({
                success: true,
                message: 'Dispute raised successfully',
                data: dispute
            });
        }

        // CASE 2: Provider responding to existing dispute
        if (response && booking.dispute) {
            // Can only respond if raised by client
            if (booking.dispute.raisedBy === providerId) {
                return NextResponse.json(
                    { success: false, message: 'You cannot respond to your own dispute' },
                    { status: 400 }
                );
            }

            // Update dispute with provider response
            const updatedDispute = await prisma.dispute.update({
                where: { id: booking.dispute.id },
                data: {
                    resolution: response,
                    status: 'IN_REVIEW'  // Admin needs to review both sides
                }
            });

            // Notify client
            await NotificationService.create({
                userId: booking.clientId,
                type: 'INFO',
                priority: 'MEDIUM',
                title: 'Provider Responded to Dispute',
                message: `The provider has responded to your dispute. Admin will review.`,
                actionUrl: `/bookings/${bookingId}`,
                data: { disputeId: booking.dispute.id }
            });

            // Notify admins
            const admins = await prisma.user.findMany({
                where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
                select: { id: true }
            });

            for (const admin of admins) {
                await NotificationService.create({
                    userId: admin.id,
                    type: 'INFO',
                    priority: 'HIGH',
                    title: 'Dispute Needs Review',
                    message: `Provider responded to dispute for booking #${booking.bookingNumber}`,
                    actionUrl: `/admin/disputes/${booking.dispute.id}`,
                    data: { disputeId: booking.dispute.id }
                });
            }

            return NextResponse.json({
                success: true,
                message: 'Response submitted successfully',
                data: updatedDispute
            });
        }

        return NextResponse.json(
            { success: false, message: 'Invalid request' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Dispute action error:', error);
        return NextResponse.json(
            { success: false, message: (error as Error).message },
            { status: 500 }
        );
    }
};