import { withRole } from "@/lib/api-auth";
import { prisma } from "@/prisma/prisma.init";
import { AuthenticatedRequest } from "@/types/auth";
import { NextResponse } from "next/server";

export const GET = withRole('ADMIN', 'SUPER_ADMIN')(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const where: any = {};
    if (status) where.status = status;

    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({
        where,
        include: {
          provider: {
            select: {
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          processedByUser: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          bookings: {
            select: {
              id: true,
              service: true,
              amount: true
            }
          }
        },
        orderBy: { processedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.payout.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: payouts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Get payout history error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
});