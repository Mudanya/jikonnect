import logger from "@/lib/logger";
import { createReview } from "@/services/queries/client.query";
import { getBookingById, getReviewByid, updateProviderRating } from "@/services/queries/provider.query";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
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

        const body = await req.json();
        const { rating, comment } = body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { success: false, message: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }
        const { id } = await params
        const booking = await getBookingById(id);

        if (!booking) {
            return NextResponse.json(
                { success: false, message: 'Booking not found' },
                { status: 404 }
            );
        }

        // Check if booking is completed
        if (booking.status !== 'COMPLETED') {
            return NextResponse.json(
                { success: false, message: 'Can only review completed bookings' },
                { status: 400 }
            );
        }

        // Check if user is the client
        if (booking.clientId !== user.userId) {
            return NextResponse.json(
                { success: false, message: 'Only the client can review' },
                { status: 403 }
            );
        }

        const existingReview = await getReviewByid(id)
        if (existingReview) {
            return NextResponse.json(
                { success: false, message: 'Booking already reviewed' },
                { status: 400 }
            );
        }

        const review = await createReview({ id, userId: user.userId, providerId: booking.providerId, rating, comment })

        await updateProviderRating(booking.providerId)
        return NextResponse.json({
            success: true,
            message: 'Review submitted successfully',
            data: review
        }, { status: 201 });
    }
    catch (err) {
        logger.error((err as Error).message);
        return NextResponse.json(
            { success: false, message: 'Failed to submit review' },
            { status: 500 }
        );
    }
}