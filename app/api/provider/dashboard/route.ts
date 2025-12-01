import { withAuth, withRole } from "@/lib/api-auth";
import logger from "@/lib/logger";
import { findBookingById, getEarnings, getReviewByid, getReviewsByid, getUserProfileById } from "@/services/queries/provider.query";
import { AuthenticatedRequest } from "@/types/auth";
import { NextResponse } from "next/server";

export const GET = withRole("PROFESSIONAL")(async (req: AuthenticatedRequest) => {
    try {
        const profile = await getUserProfileById(req.user.userId)
        if (!profile) {
            return NextResponse.json(
                { success: false, message: 'Profile not found' },
                { status: 404 }
            );
        }
        const bookings = await findBookingById(req.user.userId);
        const totalBookings = bookings.length;
        const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
        const activeBookings = bookings.filter(b =>
            ['CONFIRMED', 'IN_PROGRESS'].includes(b.status)
        ).length;
        const upcomingBookings = bookings.filter(b =>
            b.status === 'CONFIRMED' && new Date(b.scheduledDate) > new Date()
        );
        const totalEarnings = bookings
            .filter(b => b.status === 'COMPLETED')
            .reduce((sum, b) => sum + Number(b.providerPayout), 0);
        const thisMonthEarnings = bookings
            .filter(b => {
                const bookingDate = new Date(b.completedAt || b.createdAt);
                const now = new Date();
                return b.status === 'COMPLETED' &&
                    bookingDate.getMonth() === now.getMonth() &&
                    bookingDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum, b) => sum + Number(b.providerPayout), 0);
        const reviews = await getReviewsByid(req.user.userId, 10)

        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
        return NextResponse.json({
            success: true,
            data: {
                profile,
                stats: {
                    totalEarnings,
                    thisMonthEarnings,
                    totalBookings,
                    completedBookings,
                    activeBookings,
                    averageRating: averageRating.toFixed(1),
                    totalReviews: reviews.length,
                    verificationStatus: profile.verificationStatus,
                    completionRate: totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(1) : 0
                },
                upcomingBookings: upcomingBookings.slice(0, 5),
                recentReviews: reviews.slice(0, 5),
                earningsChart: await getEarningsChart(req.user.userId)
            }
        });
    }
    catch (err) {
        logger.error((err as Error).message)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
})

const getEarningsChart = async (providerId: string) => {
    const last6Months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const earnings = await getEarnings(providerId, i, now, date)

        last6Months.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            earnings: Number(earnings._sum.providerPayout || 0)
        });
    }

    return last6Months;
}


