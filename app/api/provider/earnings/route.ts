import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/prisma/prisma.init';
import { AuthenticatedRequest } from '@/types/auth';
import { NextResponse } from 'next/server';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const providerId = req.user.userId;

    // Get all completed bookings with payments AND payout info
    const bookings = await prisma.booking.findMany({
      where: {
        providerId,
        status: 'COMPLETED',
        payment: {
          status: 'PAID'
        }
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        payment: {
          select: {
            status: true,
            mpesaCode: true
          }
        },
        payout: {
          select: {
            mpesaCode: true,
            status: true,
            completedAt: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    });

    // Calculate summary
    const totalEarnings = bookings.reduce((sum, b) => sum + Number(b.providerPayout), 0);
    const completedJobs = bookings.length;
    const averageJobValue = completedJobs > 0 ? totalEarnings / completedJobs : 0;

    // Payout status breakdown
    const pendingPayouts = bookings
      .filter(b => b.payoutStatus === 'PENDING')
      .reduce((sum, b) => sum + Number(b.providerPayout), 0);
    
    const completedPayouts = bookings
      .filter(b => b.payoutStatus === 'COMPLETED')
      .reduce((sum, b) => sum + Number(b.providerPayout), 0);

    const processingPayouts = bookings
      .filter(b => b.payoutStatus === 'PROCESSING')
      .reduce((sum, b) => sum + Number(b.providerPayout), 0);

    // This month earnings
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthBookings = bookings.filter(
      b => b.completedAt && new Date(b.completedAt) >= startOfMonth
    );
    const thisMonthEarnings = thisMonthBookings.reduce(
      (sum, b) => sum + Number(b.providerPayout), 
      0
    );

    // Last month earnings
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthBookings = bookings.filter(
      b => b.completedAt && 
           new Date(b.completedAt) >= startOfLastMonth && 
           new Date(b.completedAt) <= endOfLastMonth
    );
    const lastMonthEarnings = lastMonthBookings.reduce(
      (sum, b) => sum + Number(b.providerPayout), 
      0
    );

    // Monthly data for chart (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthBookings = bookings.filter(
        b => b.completedAt && 
             new Date(b.completedAt) >= monthStart && 
             new Date(b.completedAt) <= monthEnd
      );

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        earnings: monthBookings.reduce((sum, b) => sum + Number(b.providerPayout), 0),
        jobs: monthBookings.length
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        summary: {
          totalEarnings,
          completedJobs,
          averageJobValue,
          thisMonthEarnings,
          lastMonthEarnings,
          // NEW: Payout status breakdown
          pendingPayouts,
          completedPayouts,
          processingPayouts,
          payoutBreakdown: {
            pending: bookings.filter(b => b.payoutStatus === 'PENDING').length,
            processing: bookings.filter(b => b.payoutStatus === 'PROCESSING').length,
            completed: bookings.filter(b => b.payoutStatus === 'COMPLETED').length,
            failed: bookings.filter(b => b.payoutStatus === 'FAILED').length
          }
        },
        monthlyData
      }
    });

  } catch (error: any) {
    console.error('Get earnings error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
});