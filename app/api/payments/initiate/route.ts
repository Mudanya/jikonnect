import { withAuth } from '@/lib/api-auth';
import { MpesaService } from '@/lib/mpesa';
import { prisma } from '@/prisma/prisma.init';
import { getSettingsByKey } from '@/services/queries/admin.query';
import { AuthenticatedRequest } from '@/types/auth';
import { NextResponse } from 'next/server';


const mpesa = new MpesaService();

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { bookingId, phoneNumber } = body;

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking belongs to user
    if (booking.clientId !== req.user.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if already paid
    if (booking.payment?.status === 'PAID') {
      return NextResponse.json(
        { success: false, message: 'Booking already paid' },
        { status: 400 }
      );
    }

    // Initiate STK Push
    const payments = await getSettingsByKey('payments')
    let checkoutRequestId = null, merchantRequestId = null, customerMessage = ""
    if (payments?.mpesaEnabled) {
      const stkPushResponse = await mpesa.initiateSTKPush({
        phoneNumber,
        amount: Number(booking.amount),
        accountReference: booking.bookingNumber,
        transactionDesc: `Payment for ${booking.service}`
      });
      checkoutRequestId = stkPushResponse.CheckoutRequestID;
      merchantRequestId = stkPushResponse.MerchantRequestID;
      customerMessage = stkPushResponse.CustomerMessage
    }

    // Save payment record
    const payment = await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        checkoutRequestId,
        merchantRequestId,
        phoneNumber,
        status: payments?.mpesaEnabled ? 'PENDING' : 'PAID'
      },
      create: {
        bookingId: booking.id,
        userId: req.user.userId,
        amount: booking.amount,
        phoneNumber,
        checkoutRequestId,
        merchantRequestId,
        status: payments?.mpesaEnabled ? 'PENDING' : 'PAID'
      }
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'IN_PROGRESS',
      },
      include: {
        client: true,
        provider: true
      }
    });

    // Log transaction
    await prisma.auditLogs.create({
      data: {
        userId: req.user.userId,
        action: 'PAYMENT_INITIATED',
        entity: 'Payment',
        entityId: payment.id,
        details: {
          bookingId,
          amount: booking.amount,
          checkoutRequestId
        },
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent')
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Payment initiated. Please check your phone.',
      data: {
        checkoutRequestId,
        customerMessage,
        paymentId: payment.id
      }
    });
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to initiate payment' },
      { status: 500 }
    );
  }
});