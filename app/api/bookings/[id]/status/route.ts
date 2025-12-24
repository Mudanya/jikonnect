import logger from "@/lib/logger";
import { NotificationService } from "@/lib/notifications/notificationService";
import { prisma } from "@/prisma/prisma.init";
import { createReview } from "@/services/queries/client.query";
import { getBookingById, getReviewByid, updateProviderRating } from "@/services/queries/provider.query";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
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
        const { id } = await params
        const { status } = await req.json();
        const booking = await prisma.booking.update({
            where: { id },
            data: { status },
            include: {
                client: true,
                provider: true,
            }
        });

        // Send different notifications based on status
        switch (status) {
            case 'CONFIRMED':
                await NotificationService.create({
                    userId: booking.clientId,
                    type: 'SUCCESS',
                    priority: 'HIGH',
                    title: 'Booking Confirmed! ✅',
                    message: `${booking.provider.firstName} confirmed your booking for ${booking.service} on ${booking.scheduledDate}.`,
                    actionUrl: `/bookings/${booking.id}`
                });
                break;

            case 'REJECTED':
                await NotificationService.create({
                    userId: booking.clientId,
                    type: 'JOB_UPDATE',
                    priority: 'HIGH',
                    title: 'Booking Declined',
                    message: `${booking.provider.firstName} is unavailable for your requested time. Please try another time slot.`,
                    actionUrl: `/providers/${booking.providerId}`
                });
                break;

            case 'COMPLETED':
                // Notify client to leave review
                await NotificationService.create({
                    userId: booking.clientId,
                    type: 'SUCCESS',
                    priority: 'MEDIUM',
                    title: 'How was your service?',
                    message: `Please rate your experience with ${booking.provider.firstName}.`,
                    actionUrl: `/bookings/${booking.id}/review`
                });

                // Notify provider about completion
                await NotificationService.create({
                    userId: booking.providerId,
                    type: 'SUCCESS',
                    priority: 'MEDIUM',
                    title: 'Booking Completed',
                    message: `Your booking with ${booking.client.firstName} is marked as completed.`,
                    actionUrl: `/bookings/${booking.id}`
                });
                break;

            case 'CANCELLED':
                await NotificationService.create({
                    userId: booking.providerId,
                    type: 'JOB_UPDATE',
                    priority: 'MEDIUM',
                    title: 'Booking Cancelled',
                    message: `${booking.client.firstName} cancelled the booking for ${booking.service}.`,

                });
                break;
        }

        return NextResponse.json({ booking });
    }
    catch (err) {
        logger.error((err as Error).message);
        return NextResponse.json(
            { success: false, message: 'Failed to submit review' },
            { status: 500 }
        );
    }
}