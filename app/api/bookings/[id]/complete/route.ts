// app/api/bookings/[bookingId]/complete/route.ts
import { NotificationService } from '@/lib/notifications/notificationService';
import { prisma } from '@/prisma/prisma.init';
import { NextRequest, NextResponse } from 'next/server';

// POST - Client marks booking as complete
export const POST = async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {

        const { id:bookingId } = await params;

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

        const clientId = user.userId;

        // Get booking
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                clientId  // Ensure only the client can mark their own booking as complete
            },
            include: {
                provider: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                    
                },
                payment: true,
                dispute:true
            }
        });

        if (!booking) {
            return NextResponse.json(
                { success: false, message: 'Booking not found or you do not have access' },
                { status: 404 }
            );
        }

        // Check if booking can be marked as complete
        if (booking.status !== 'IN_PROGRESS' &&  booking.dispute?.status !=='RESOLVED') {
            return NextResponse.json(
                {
                    success: false,
                    message: `Booking cannot be marked as complete. Current status: ${booking.status}`
                },
                { status: 400 }
            );
        }

        // Check if payment is completed
        if (!booking.payment || booking.payment.status !== 'PAID') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Payment must be completed before marking booking as complete'
                },
                { status: 400 }
            );
        }

        // Update booking status to COMPLETED
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date()
            },
            include: {
                provider: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        // Notify provider
        await NotificationService.create({
            userId: booking.provider.id,
            type: 'SUCCESS',
            priority: 'HIGH',
            title: 'Booking Completed',
            message: `Client has marked booking #${booking.bookingNumber} as complete. Payment will be processed soon.`,
            actionUrl: `/provider/bookings/${booking.id}`,
            data: {
                bookingId: booking.id,
                bookingNumber: booking.bookingNumber
            }
        });

        // Log audit trail
        console.log(`Booking ${booking.bookingNumber} marked as complete by client ${clientId}`);

        return NextResponse.json({
            success: true,
            message: 'Booking marked as complete successfully',
            booking: updatedBooking
        });

    } catch (error) {
        console.error('Mark booking complete error:', error);
        return NextResponse.json(
            { success: false, message: (error as Error).message },
            { status: 500 }
        );
    }
};