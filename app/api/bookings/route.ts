import { withAuth } from "@/lib/api-auth";
import { BookingStatus } from "@/lib/generated/prisma/enums";
import logger from "@/lib/logger";
import { createAuditLog } from "@/services/queries/auth.query";
import { getBookingsById } from "@/services/queries/client.query";
import { createBooking, getUserProfileById } from "@/services/queries/provider.query";
import { AuthenticatedRequest } from "@/types/auth";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const bookings = getBookingsById(req.user.userId, status as BookingStatus)
        return NextResponse.json({
            success: true,
            data: bookings
        });
    }
    catch (err) {
        logger.error((err as Error).message)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch bookings' },
            { status: 500 }
        );
    }
}
)

export const POST = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const body = await req.json();
        const {
            providerId,
            service,
            description,
            scheduledDate,
            scheduledTime,
            duration,
            location
        } = body;

        if (!providerId || !service || !scheduledDate || !scheduledTime || !location) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }
        const profile = await getUserProfileById(providerId)
        if (!profile || !profile.hourlyRate) {
            return NextResponse.json(
                { success: false, message: 'Provider not found or rates not set' },
                { status: 404 }
            );
        }
        const booking = await createBooking({
            providerId,
            service,
            description,
            scheduledDate,
            scheduledTime,
            duration,
            location, userId: req.user.userId,
            hourlyRate: profile.hourlyRate
        })

        // log 
        await createAuditLog(req, req.user.userId, 'BOOKING_CREATED', 'Booking', { bookingNumber: booking.bookingNumber, providerId, service }, booking.id)
        return NextResponse.json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        }, { status: 201 });

    }
    catch (err) {
        logger.error((err as Error).message)
        return NextResponse.json(
            { success: false, message: 'Failed to create booking' },
            { status: 500 }
        );

    }
})