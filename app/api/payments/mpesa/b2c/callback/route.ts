
import { prisma } from '@/prisma/prisma.init';
import { NotificationService } from '@/lib/notifications/notificationService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('B2C Result Callback:', JSON.stringify(body, null, 2));

    const result = body.Result;
    const conversationId = result.ConversationID;
    const originatorConversationId = result.OriginatorConversationID;
    const resultCode = result.ResultCode;
    const resultDesc = result.ResultDesc;

    // Find the payout by conversation ID
    const payout = await prisma.payout.findFirst({
      where: {
        OR: [
          { conversationId },
          { originatorConversationId }
        ]
      },
      include: {
        provider: true,
        bookings: true
      }
    });

    if (!payout) {
      console.error('Payout not found for conversation ID:', conversationId);
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // SUCCESS: ResultCode = 0
    if (resultCode === 0) {
      // Extract M-Pesa receipt number
      const resultParameters = result.ResultParameters?.ResultParameter || [];
      const mpesaCode = resultParameters.find(
        (p: any) => p.Key === 'TransactionReceipt'
      )?.Value;

      // Update payout as COMPLETED
      await prisma.$transaction([
        // 1. Update payout record
        prisma.payout.update({
          where: { id: payout.id },
          data: {
            status: 'COMPLETED',
            mpesaCode,
            resultCode,
            resultDesc,
            completedAt: new Date()
          }
        }),

        // 2. Update all bookings as COMPLETED payout
        prisma.booking.updateMany({
          where: { payoutId: payout.id },
          data: {
            payoutStatus: 'COMPLETED',
            paidOutAt: new Date()
          }
        })
      ]);

      // 3. Send success notification to provider
      await NotificationService.create({
        userId: payout.providerId,
        type: 'PAYMENT',
        priority: 'HIGH',
        title: 'Payout Received! 💰',
        message: `KES ${Number(payout.amount).toLocaleString()} has been sent to your M-Pesa (${mpesaCode}). Check your phone for confirmation.`,
        actionUrl: '/provider/earnings',
        data: {
          amount: Number(payout.amount),
          mpesaCode,
          payoutId: payout.id
        }
      });

      // 4. Log successful payout
      await prisma.auditLogs.create({
        data: {
          action: 'PAYOUT_COMPLETED',
          entity: 'Payout',
          entityId: payout.id,
          details: {
            providerId: payout.providerId,
            amount: Number(payout.amount),
            mpesaCode,
            resultCode,
            resultDesc,
            bookingCount: payout.bookings.length
          }
        }
      });

      console.log(`✅ Payout ${payout.id} completed successfully`);
    } 
    // FAILURE: ResultCode != 0
    else {
      // Update payout as FAILED and revert bookings
      await prisma.$transaction([
        // 1. Update payout record
        prisma.payout.update({
          where: { id: payout.id },
          data: {
            status: 'FAILED',
            resultCode,
            resultDesc,
            failureReason: resultDesc
          }
        }),

        // 2. Revert bookings to PENDING so they can be retried
        prisma.booking.updateMany({
          where: { payoutId: payout.id },
          data: {
            payoutStatus: 'PENDING',
            payoutId: null
          }
        })
      ]);

      // 3. Send failure notification to provider
      await NotificationService.create({
        userId: payout.providerId,
        type: 'ERROR',
        priority: 'HIGH',
        title: 'Payout Failed ⚠️',
        message: `Your payout of KES ${Number(payout.amount).toLocaleString()} could not be processed. Reason: ${resultDesc}. We'll retry shortly.`,
        actionUrl: '/provider/earnings',
        data: {
          amount: Number(payout.amount),
          payoutId: payout.id,
          failureReason: resultDesc
        }
      });

      // 4. Log failed payout
      await prisma.auditLogs.create({
        data: {
          action: 'PAYOUT_FAILED',
          entity: 'Payout',
          entityId: payout.id,
          details: {
            providerId: payout.providerId,
            amount: Number(payout.amount),
            resultCode,
            resultDesc,
            bookingCount: payout.bookings.length
          }
        }
      });

      console.error(`❌ Payout ${payout.id} failed:`, resultDesc);
    }

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Accepted'
    });

  } catch (error: any) {
    console.error('B2C callback error:', error);
    // Still return success to M-Pesa to avoid retries
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Accepted'
    });
  }
}