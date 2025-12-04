import { withRole, AuthenticatedRequest } from '@/lib/api-auth';
import { MpesaService } from '@/lib/mpesa';
import { prisma } from '@/prisma/prisma.init';
import { NextResponse } from 'next/server';

// GET - Get pending payouts
export const GET = withRole('ADMIN')(async (req: AuthenticatedRequest) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'COMPLETED',
        payment: {
          status: 'PAID'
        }
      },
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        payment: true
      },
      orderBy: {
        completedAt: 'desc'
      }
    });

    // Group by provider
    const payoutsByProvider = bookings.reduce((acc: any, booking) => {
      const providerId = booking.providerId;
      if (!acc[providerId]) {
        acc[providerId] = {
          provider: booking.provider,
          bookings: [],
          totalPayout: 0,
          totalCommission: 0
        };
      }
      acc[providerId].bookings.push(booking);
      acc[providerId].totalPayout += Number(booking.providerPayout);
      acc[providerId].totalCommission += Number(booking.commission);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: Object.values(payoutsByProvider)
    });
  } catch (error) {
    console.error('Get payouts error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
});

// POST - Process payout to provider
export const POST_PAYOUT = withRole('ADMIN')(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { providerId, bookingIds, phoneNumber } = body;

    const bookings = await prisma.booking.findMany({
      where: {
        id: { in: bookingIds },
        providerId,
        status: 'COMPLETED'
      }
    });

    if (bookings.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid bookings found' },
        { status: 404 }
      );
    }

    const totalPayout = bookings.reduce((sum, b) => sum + Number(b.providerPayout), 0);

    // Initiate B2C payment
    const mpesa = new MpesaService();
    const payoutResponse = await mpesa.initiateB2C(
      phoneNumber,
      totalPayout,
      `Payout for ${bookings.length} completed job(s)`
    );

    // Log payout
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'PAYOUT_INITIATED',
        entity: 'Payout',
        details: {
          providerId,
          amount: totalPayout,
          bookingIds,
          conversationId: payoutResponse.ConversationID
        },
        ipAddress: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent')
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Payout initiated successfully',
      data: {
        amount: totalPayout,
        conversationId: payoutResponse.ConversationID
      }
    });
  } catch (error: any) {
    console.error('Payout error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to process payout' },
      { status: 500 }
    );
  }
});