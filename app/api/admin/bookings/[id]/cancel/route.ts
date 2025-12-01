import { verifyAccessToken } from '@/lib/jwt';
import { cancelBooking, findBookingWithClientAndProvider } from '@/services/queries/admin.query';
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
        const { id } = await params
        const token = authHeader.substring(7);

        const user = verifyAccessToken(token);

        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const bookingId = id;

        // Get booking details
        const booking = await findBookingWithClientAndProvider(bookingId)

        if (!booking) {
            return NextResponse.json(
                { success: false, error: 'Booking not found' },
                { status: 404 }
            );
        }

        // Update booking status
        await cancelBooking(bookingId)
        // Create audit log

        await createAuditLog(req, user.userId, 'BOOKING_CANCELLED', 'Booking', { message: `Admin cancelled booking #${bookingId}` }, bookingId)
        // TODO: Process refund if payment was made
        // TODO: Send notification emails to both parties

        return NextResponse.json({
            success: true,
            message: 'Booking cancelled successfully'
        });

    } catch (error) {
        console.error('Failed to cancel booking:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to cancel booking' },
            { status: 500 }
        );
    }
}