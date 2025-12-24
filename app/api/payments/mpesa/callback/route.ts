// app/api/payments/mpesa/callback/route.ts
import { NotificationService } from '@/lib/notifications/notificationService';
import { prisma } from '@/prisma/prisma.init';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('M-Pesa Callback received:', JSON.stringify(body, null, 2));

    const { Body } = body;
    const { stkCallback } = Body;

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = stkCallback;

    // Find payment by checkout request ID
    const payment = await prisma.payment.findFirst({
      where: { checkoutRequestId: CheckoutRequestID },
      include: {
        booking: {
          include: {
            client: true,
            provider: true
          }
        }
      }
    });

    if (!payment) {
      console.error('Payment not found for checkout request:', CheckoutRequestID);
      return NextResponse.json({ 
        ResultCode: 1, 
        ResultDesc: 'Payment record not found' 
      });
    }

    // Payment successful
    if (ResultCode === 0) {
      // Extract transaction details
      const metadata = CallbackMetadata?.Item || [];
      const mpesaReceiptNumber = metadata.find(
        (item: any) => item.Name === 'MpesaReceiptNumber'
      )?.Value;
      const transactionDate = metadata.find(
        (item: any) => item.Name === 'TransactionDate'
      )?.Value;
      const phoneNumber = metadata.find(
        (item: any) => item.Name === 'PhoneNumber'
      )?.Value;

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
        //   mpesaCode,
        //   createdAt: transactionDate ? new Date(String(transactionDate)) : null,
          phoneNumber: phoneNumber || payment.phoneNumber,
        //   resultCode: ResultCode,
        //   resultDesc: ResultDesc,
          paidAt: new Date()
        }
      });

      // Update booking status to IN_PROGRESS
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: 'IN_PROGRESS',
        //   paymentStatus: 'PAID'
        }
      });

      // Calculate commission and provider payout
      const commission = Number(payment.amount) * 0.10; // 10% commission
      const providerPayout = Number(payment.amount) - commission;

      // Update booking with payment breakdown
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          commission,
          providerPayout
        }
      });

      // Notify client
      await NotificationService.create({
        userId: payment.booking.clientId,
        type: 'PAYMENT',
        priority: 'HIGH',
        title: 'Payment Successful ✅',
        message: `Your payment of KES ${Number(payment.amount).toLocaleString()} was successful. Receipt: ${mpesaReceiptNumber}`,
        actionUrl: `/bookings/${payment.bookingId}`,
        data: {
          amount: payment.amount,
          mpesaReceiptNumber,
          bookingId: payment.bookingId
        }
      });

      // Notify provider
      await NotificationService.create({
        userId: payment.booking.providerId,
        type: 'PAYMENT',
        priority: 'HIGH',
        title: 'Payment Received 💰',
        message: `Payment of KES ${Number(payment.amount).toLocaleString()} received for ${payment.booking.service}. Your payout: KES ${providerPayout.toFixed(2)}`,
        actionUrl: `/provider/bookings/${payment.bookingId}`,
        data: {
          amount: payment.amount,
          providerPayout,
          commission,
          bookingId: payment.bookingId
        }
      });

      console.log('Payment processed successfully:', mpesaReceiptNumber);

    } else {
      // Payment failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
        //   resultCode: ResultCode,
         failureReason: ResultDesc,
        //   failedAt: new Date()
        }
      });

      // Notify client about failed payment
      await NotificationService.create({
        userId: payment.booking.clientId,
        type: 'PAYMENT',
        priority: 'HIGH',
        title: 'Payment Failed ❌',
        message: `Your payment failed: ${ResultDesc}. Please try again.`,
        actionUrl: `/bookings/${payment.bookingId}/payment`,
        data: {
          bookingId: payment.bookingId,
          reason: ResultDesc
        }
      });

      console.log('Payment failed:', ResultDesc);
    }

    // Log transaction
    await prisma.auditLogs.create({
      data: {
        userId: payment.userId,
        action: ResultCode === 0 ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED',
        entity: 'Payment',
        entityId: payment.id,
        details: {
          checkoutRequestId: CheckoutRequestID,
        //   resultCode: ResultCode,
        //   resultDesc: ResultDesc,
          amount: payment.amount
        },
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent')
      }
    });

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully'
    });

  } catch (error: any) {
    console.error('M-Pesa callback error:', error);
    return NextResponse.json({
      ResultCode: 1,
      ResultDesc: error.message || 'Callback processing failed'
    });
  }
}