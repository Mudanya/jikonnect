import { withRole } from "@/lib/api-auth";
import { prisma } from "@/prisma/prisma.init";
import { AuthenticatedRequest } from "@/types/auth";
import { NextResponse } from "next/server";

export const GET = withRole('ADMIN')(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const whereClause: any = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            client: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            provider: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const summary = {
      totalPayments: payments.length,
      paidPayments: payments.filter(p => p.status === 'PAID').length,
      pendingPayments: payments.filter(p => p.status === 'PENDING').length,
      failedPayments: payments.filter(p => p.status === 'FAILED').length,
      totalRevenue: payments
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0),
      totalCommission: payments
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + Number(p.booking.commission), 0),
      totalProviderPayouts: payments
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + Number(p.booking.providerPayout), 0)
    };

    return NextResponse.json({
      success: true,
      data: {
        summary,
        payments
      }
    });
  } catch (error) {
    console.error('Reconciliation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reconciliation data' },
      { status: 500 }
    );
  }
});