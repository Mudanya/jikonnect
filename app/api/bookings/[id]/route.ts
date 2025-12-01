import logger from "@/lib/logger";
import { getBookingById, updateBookingStatus, updateProfileStats } from "@/services/queries/provider.query";
import { NextRequest, NextResponse } from "next/server";
const { verifyAccessToken } = await import('@/lib/jwt');

export const PUT = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
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
        const { id } = await params
        const body = await req.json();
        const { status, cancellationReason } = body;

        const existingBooking = await getBookingById(id)

        if (!existingBooking) {
            return NextResponse.json(
                { success: false, message: 'Booking not found' },
                { status: 404 }
            );
        }

        if (existingBooking.clientId !== user.userId && existingBooking.providerId !== user.userId) {
            return NextResponse.json(
                { success: false, message: 'Not authorized to update this booking' },
                { status: 403 }
            );
        }

        const booking = await updateBookingStatus(id, status, cancellationReason);
        await updateProfileStats(existingBooking.providerId, `${existingBooking.providerPayout}`, status)
        return NextResponse.json({
            success: true,
            message: 'Booking updated successfully',
            data: booking
        });
    }
    catch (err) {
        logger.error((err as Error).message)
        return NextResponse.json(
            { success: false, message: 'Failed to update booking' },
            { status: 500 }
        );
    }
}