// app/api/provider/bookings/[bookingId]/complete/route.ts
import { verifyAccessToken } from '@/lib/jwt';
import { NotificationService } from '@/lib/notifications/notificationService';
import { prisma } from '@/prisma/prisma.init';
import { NextRequest, NextResponse } from 'next/server';

export const PATCH = async (
    req: NextRequest,
    { params }: { params: Promise<{ bookingId: string }> }
) => {
    try {
        const { bookingId } = await params
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
        // Get booking
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                client: true,
                provider: true
            }
        });

        if (!booking) {
            return NextResponse.json(
                { success: false, message: 'Booking not found' },
                { status: 404 }
            );
        }

        // Check if booking belongs to this provider
        if (booking.providerId !== user.userId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Check if booking is in progress
        if (booking.status !== 'IN_PROGRESS') {
            return NextResponse.json(
                { success: false, message: 'Booking is not in progress' },
                { status: 400 }
            );
        }

        // Update booking to completed
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date()
            },
            include: {
                client: true,
                provider: true
            }
        });

        // Send notification to client
        await NotificationService.create({
            userId: booking.clientId,
            type: 'JOB_UPDATE',
            priority: 'HIGH',
            title: 'Service Completed! ✅',
            message: `${booking.provider.firstName} marked your booking as completed. How was your experience?`,
            actionUrl: `/bookings/${booking.id}/review`,
            data: {
                bookingId: booking.id,
                booking,
                status: 'COMPLETED'
            }
        });

        // Log action
        await prisma.auditLogs.create({
            data: {
                userId: user.userId,
                action: 'BOOKING_COMPLETED',
                entity: 'Booking',
                entityId: booking.id,
                details: {
                    bookingNumber: booking.bookingNumber,
                    clientId: booking.clientId,
                    status: 'COMPLETED'
                },
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
                userAgent: req.headers.get('user-agent')
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Booking marked as completed successfully!',
            data: updatedBooking
        });

    } catch (error: any) {
        console.error('Booking completion error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to complete booking' },
            { status: 500 }
        );
    }
};