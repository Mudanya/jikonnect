// app/api/admin/payouts/route.ts - FINAL FIXED VERSION
import { withRole } from '@/lib/api-auth';
import { MpesaService } from '@/lib/mpesa';
import { NotificationService } from '@/lib/notifications/notificationService';
import { prisma } from '@/prisma/prisma.init';
import { getSettingsByKey } from '@/services/queries/admin.query';
import { AuthenticatedRequest } from '@/types/auth';
import { NextResponse } from 'next/server';

// GET - Get pending payouts (ONLY bookings not yet paid out)
export const GET = withRole('ADMIN', 'SUPER_ADMIN')(async (req: AuthenticatedRequest) => {
  try {
    // ONLY get bookings that are COMPLETED, PAID, and NOT YET PAID OUT
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'COMPLETED',
        payment: {
          status: 'PAID'
        },
        payoutStatus: 'PENDING'  // NEW: Only unpaid bookings
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

// POST - Process payout to provider (WITH DOUBLE-PAYMENT PREVENTION)
export const POST = withRole('ADMIN', 'SUPER_ADMIN')(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { providerId, bookingIds, phoneNumber } = body;

    // VALIDATION 1: Check all bookings exist and are valid
    const bookings = await prisma.booking.findMany({
      where: {
        id: { in: bookingIds },
        providerId,
        status: 'COMPLETED',
        payoutStatus: 'PENDING'  // NEW: Must be PENDING (not already paid)
      }
    });

    if (bookings.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid unpaid bookings found' },
        { status: 404 }
      );
    }

    // VALIDATION 2: Check if bookings count matches request
    if (bookings.length !== bookingIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${bookings.length} of ${bookingIds.length} bookings are valid for payout. Some may have already been paid.`
        },
        { status: 400 }
      );
    }

    const totalPayout = bookings.reduce((sum, b) => sum + Number(b.providerPayout), 0);
    const totalCommission = bookings.reduce((sum, b) => sum + Number(b.commission), 0);

    // START TRANSACTION: Create payout record and update bookings atomically
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Payout record
      const payout = await tx.payout.create({
        data: {
          providerId,
          amount: totalPayout,
          commission: totalCommission,
          phoneNumber,
          status: 'PROCESSING',
          processedBy: req.user.userId,
          processedAt: new Date()
        }
      });

      // 2. Mark all bookings as PROCESSING (prevents double-processing)
      await tx.booking.updateMany({
        where: {
          id: { in: bookingIds }
        },
        data: {
          payoutStatus: 'PROCESSING',
          payoutId: payout.id
        }
      });

      return payout;
    });

    // 3. Check if M-Pesa is enabled
    const mpesaSettings = await getSettingsByKey('payments');
    const isMpesaEnabled = !mpesaSettings || mpesaSettings.mpesaEnabled;

    // 4. Process payout based on M-Pesa status
    let payoutResponse;
    
    try {
      if (isMpesaEnabled) {
        // ====== M-PESA ENABLED: Real B2C Payment ======
        const mpesa = new MpesaService();
        payoutResponse = await mpesa.initiateB2C(
          phoneNumber,
          totalPayout,
          `Payout for ${bookings.length} completed job(s)`,
          // result.id  // Pass payout ID for callback tracking
        );

        // Update payout with M-Pesa conversation IDs
        await prisma.payout.update({
          where: { id: result.id },
          data: {
            conversationId: payoutResponse.ConversationID,
            originatorConversationId: payoutResponse.OriginatorConversationID
          }
        });

        // Notify provider (processing)
        await NotificationService.create({
          userId: providerId,
          type: 'PAYMENT',
          priority: 'HIGH',
          title: 'Payout Processing 💸',
          message: `Your payout of KES ${totalPayout.toFixed(2)} is being processed and will arrive shortly.`,
          actionUrl: '/provider/earnings',
          data: {
            amount: totalPayout,
            payoutId: result.id
          }
        }).catch(err => console.error('Notification error:', err));

      } else {
        // ====== M-PESA DISABLED: Test Mode ======
        // Generate UNIQUE test IDs (prevents unique constraint violation)
        const testConversationId = `TEST_${result.id}_${Date.now()}`;
        const testOriginatorId = `TEST_ORIG_${result.id}_${Date.now()}`;
        
        // Update payout and complete it immediately in test mode
        await prisma.$transaction([
          // Update with test IDs
          prisma.payout.update({
            where: { id: result.id },
            data: {
              conversationId: testConversationId,
              originatorConversationId: testOriginatorId,
              status: 'COMPLETED',
              mpesaCode: `TEST_${result.id.slice(0, 8)}`,
              resultCode: 0,
              resultDesc: 'Test mode - auto completed',
              completedAt: new Date()
            }
          }),
          // Mark bookings as completed
          prisma.booking.updateMany({
            where: { id: { in: bookingIds } },
            data: {
              payoutStatus: 'COMPLETED',
              paidOutAt: new Date()
            }
          })
        ]);

        // Notify provider (test mode completed)
        await NotificationService.create({
          userId: providerId,
          type: 'PAYMENT',
          priority: 'HIGH',
          title: 'Payout Completed (Test Mode) 💸',
          message: `KES ${totalPayout.toFixed(2)} payout completed in test mode. No real money transferred.`,
          actionUrl: '/provider/earnings',
          data: {
            amount: totalPayout,
            payoutId: result.id,
            testMode: true
          }
        }).catch(err => console.error('Notification error:', err));

        console.log(`✅ Test mode payout ${result.id} auto-completed`);
      }

    } catch (mpesaError: any) {
      // If M-Pesa/processing fails, revert to PENDING
      await prisma.$transaction([
        prisma.payout.update({
          where: { id: result.id },
          data: {
            status: 'FAILED',
            failureReason: mpesaError.message
          }
        }),
        prisma.booking.updateMany({
          where: { id: { in: bookingIds } },
          data: {
            payoutStatus: 'PENDING',
            payoutId: null
          }
        })
      ]);

      return NextResponse.json(
        { success: false, message: `Payout error: ${mpesaError.message}` },
        { status: 500 }
      );
    }

    // 5. Log payout in audit trail
    await prisma.auditLogs.create({
      data: {
        userId: req.user.userId,
        action: 'PAYOUT_INITIATED',
        entity: 'Payout',
        entityId: result.id,
        details: {
          providerId,
          amount: totalPayout,
          commission: totalCommission,
          bookingIds,
          conversationId: payoutResponse?.ConversationID || `TEST_${result.id}`,
          testMode: !isMpesaEnabled
        },
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent')
      }
    });

    return NextResponse.json({
      success: true,
      message: isMpesaEnabled 
        ? 'Payout initiated successfully' 
        : 'Payout completed in test mode',
      data: {
        payoutId: result.id,
        amount: totalPayout,
        conversationId: payoutResponse?.ConversationID || `TEST_${result.id}`,
        status: isMpesaEnabled ? 'PROCESSING' : 'COMPLETED',
        testMode: !isMpesaEnabled
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

// GET /api/admin/payouts/history - Get payout history
export const GET_HISTORY = withRole('ADMIN', 'SUPER_ADMIN')(async (req: AuthenticatedRequest) => {
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