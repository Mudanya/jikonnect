import { withRole } from "@/lib/api-auth";
import logger from "@/lib/logger";
import { getActiveBookings, getActiveClients, getActiveProviders, getCompletedBookings, getCurrentMonthRevenue, getLastMonthRevenue, getOpenDisputes, getPendingVerifications } from "@/services/queries/admin.query";
import { AuthenticatedRequest } from "@/types/auth";
import { NextResponse } from "next/server";

export const GET = withRole('ADMIN' , 'SUPER_ADMIN')(async (req: AuthenticatedRequest) => {
    try {

        // Get pending verifications`
        const pendingVerifications = await getPendingVerifications()

        // Get active bookings (confirmed or pending)
        const activeBookings = await getActiveBookings()


        // Get open disputes
        const openDisputes = await getOpenDisputes()

        // Get revenue data
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        const lastMonth = new Date(currentMonth);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const currentMonthRevenue = await getCurrentMonthRevenue(currentMonth)

        const lastMonthRevenue = await getLastMonthRevenue(currentMonth, lastMonth)

        const totalRevenue = currentMonthRevenue._sum.amount || 0;
        const previousRevenue = lastMonthRevenue._sum.amount || 0;
        const monthlyGrowth = +previousRevenue > 0
            ? ((+totalRevenue - +previousRevenue) / +previousRevenue) * 100
            : 0;

        // Get user counts
        const activeProviders = await getActiveProviders()
        const activeClients = await getActiveClients()

        // Get completed bookings
        const completedBookings = await getCompletedBookings()

        const stats = {
            pendingVerifications,
            activeBookings,
            openDisputes,
            totalRevenue,
            monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
            activeProviders,
            activeClients,
            completedBookings
        };
        

        return NextResponse.json({
            success: true,
            stats
        });

    } catch (error) {
        logger.error((error as Error).message)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        );
    }
})