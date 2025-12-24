import { verifyAccessToken } from '@/lib/jwt';
import { NotificationService } from '@/lib/notifications/notificationService';
import { prisma } from '@/prisma/prisma.init';
import { NextRequest, NextResponse } from 'next/server';


export const PATCH = async (req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) => {
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
        const { action } = await req.json(); // 'confirm' or 'reject'
        const { bookingId } = await params;

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

        // Check if booking is pending
        if (booking.status !== 'PENDING') {
            return NextResponse.json(
                { success: false, message: 'Booking cannot be modified' },
                { status: 400 }
            );
        }

        // Update booking status
        const newStatus = action === 'confirm' ? 'CONFIRMED' : 'CANCELLED';
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: newStatus,
                
            },
            include: {
                client: true,
                provider: true
            }
        });

        // Send notification to client
        if (action === 'confirm') {
            await NotificationService.create({
                userId: booking.clientId,
                type: 'JOB_UPDATE',
                priority: 'HIGH',
                title: 'Booking Confirmed! ✅',
                message: `${booking.provider.firstName} confirmed your booking for ${booking.service}. Please proceed with payment.`,
                actionUrl: `/bookings/${booking.id}/payment`,
                data: {
                    bookingId: booking.id,
                    status: 'CONFIRMED'
                }
            });
        } else {
            await NotificationService.create({
                userId: booking.clientId,
                type: 'JOB_UPDATE',
                priority: 'HIGH',
                title: 'Booking Declined',
                message: `${booking.provider.firstName} declined your booking request. Please try another time slot.`,
                actionUrl: `/providers/${booking.providerId}`,
                data: {
                    bookingId: booking.id,
                    status: 'CANCELLED'
                }
            });
        }

        // Log action
        await prisma.auditLogs.create({
            data: {
                userId: user.userId,
                action: action === 'confirm' ? 'BOOKING_CONFIRMED' : 'BOOKING_REJECTED',
                entity: 'Booking',
                entityId: booking.id,
                details: {
                    bookingNumber: booking.bookingNumber,
                    clientId: booking.clientId,
                    status: newStatus
                },
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
                userAgent: req.headers.get('user-agent')
            }
        });

        return NextResponse.json({
            success: true,
            message: action === 'confirm'
                ? 'Booking confirmed successfully. Client will be notified to make payment.'
                : 'Booking declined',
            data: updatedBooking
        });

    } catch (error: any) {
        console.error('Booking confirmation error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to update booking' },
            { status: 500 }
        );
    }
};