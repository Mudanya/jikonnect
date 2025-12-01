import { withAuth } from "@/lib/api-auth";
import logger from "@/lib/logger";
import { getCompletedBookings } from "@/services/queries/provider.query";
import { AuthenticatedRequest } from "@/types/auth";
import { NextResponse } from "next/server";

export const GET= withAuth(async (req: AuthenticatedRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || 'all'; // all, month, week

        const bookings = await getCompletedBookings(req.user.userId)

        // Filter by period
        const now = new Date();
        const filteredBookings = bookings.filter(b => {
            if (period === 'all') return true;
            const completedDate = new Date(b.completedAt || b.createdAt);

            if (period === 'month') {
                return completedDate.getMonth() === now.getMonth() &&
                    completedDate.getFullYear() === now.getFullYear();
            }

            if (period === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return completedDate >= weekAgo;
            }

            return true;
        });

        const totalEarnings = filteredBookings.reduce((sum, b) => sum + Number(b.providerPayout), 0);
        const totalCommission = filteredBookings.reduce((sum, b) => sum + Number(b.commission), 0);
        const totalAmount = filteredBookings.reduce((sum, b) => sum + Number(b.amount), 0);

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalEarnings,
                    totalCommission,
                    totalAmount,
                    bookingsCount: filteredBookings.length
                },
                bookings: filteredBookings
            }
        });
    } catch (error) {
        logger.error((error as Error).message)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch earnings' },
            { status: 500 }
        );
    }
});