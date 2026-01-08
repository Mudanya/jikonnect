import { withRole } from '@/lib/api-auth';
import logger from '@/lib/logger';
import { getCurrentMonthRevenue, getLastMonthRevenue, getMonthData, getRevenueByCategory, getSettingsByKey, getTodayRevenueData, getTopProviders, getTotalRevenueData, getWeekyRevenueData } from '@/services/queries/admin.query';
import { AuthenticatedRequest } from '@/types/auth';
import { NextResponse } from 'next/server';


export const GET = withRole("ADMIN", "SUPER_ADMIN")(async (req: AuthenticatedRequest) => {
    try {


        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // Total revenue
        const totalRevenueData = await getTotalRevenueData(startDate)

        const totalRevenue = totalRevenueData._sum.amount || 0;
        const completedBookings = totalRevenueData._count;

        // Monthly revenue
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthlyRevenueData = await getCurrentMonthRevenue(monthStart)

        const monthlyRevenue = monthlyRevenueData._sum.amount || 0;

        // Weekly revenue
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        weekStart.setHours(0, 0, 0, 0);

        const weeklyRevenueData = await getWeekyRevenueData(weekStart)
        const weeklyRevenue = weeklyRevenueData._sum.amount || 0;

        // Today's revenue
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayRevenueData = await getTodayRevenueData(todayStart)

        const todayRevenue = todayRevenueData._sum.amount || 0;

        // Calculate commission (assume 10% platform fee)
        const platformDetails = await getSettingsByKey('platform')
        const commissionRate = (+platformDetails!.commissionRate) / 100 || 0.10;
        const totalCommission = +totalRevenue * commissionRate;

        // Calculate average booking value
        const averageBookingValue = completedBookings > 0
            ? +totalRevenue / completedBookings
            : 0;

        // Calculate monthly growth
        const lastMonthStart = new Date(monthStart);
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

        const lastMonthRevenueData = await getLastMonthRevenue(monthStart, lastMonthStart);

        const lastMonthRevenue = lastMonthRevenueData._sum.amount || 0;
        const monthlyGrowth = +lastMonthRevenue > 0
            ? ((+monthlyRevenue - +lastMonthRevenue) / +lastMonthRevenue) * 100
            : 0;

        // Top providers
        const topProviders = await getTopProviders(startDate)

        // Revenue by category
        const revenueByCategory = await getRevenueByCategory(startDate)

        const formattedRevenueByCategory = revenueByCategory.map(cat => ({
            category: cat.category || 'Other',
            revenue: cat.revenue,
            bookings: cat.bookings
        }));

        // Monthly data for chart
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date();
            monthDate.setMonth(monthDate.getMonth() - i);
            monthDate.setDate(1);
            monthDate.setHours(0, 0, 0, 0);

            const nextMonth = new Date(monthDate);
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            const monthData = await getMonthData(monthDate, nextMonth)
            monthlyData.push({
                month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                revenue: monthData._sum.amount || 0,
                bookings: monthData._count
            });
        }

        const stats = {
            totalRevenue,
            monthlyRevenue,
            weeklyRevenue,
            todayRevenue,
            totalCommission,
            monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
            completedBookings,
            averageBookingValue: Math.round(averageBookingValue),
            topProviders,
            revenueByCategory: formattedRevenueByCategory,
            monthlyData
        };

        return NextResponse.json({
            success: true,
            stats
        });

    } catch (error) {
        logger.error((error as Error).message)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch revenue stats' },
            { status: 500 }
        );
    }
})