import { AuthenticatedRequest, withAuth } from '@/lib/api-auth';
import { MpesaService } from '@/lib/mpesa';
import { prisma } from '@/prisma/prisma.init';
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
    const stkPushResponse = await mpesa.initiateSTKPush({
      phoneNumber,
      amount: Number(booking.amount),
      accountReference: booking.bookingNumber,
      transactionDesc: `Payment for ${booking.service}`
    });

    // Save payment record
    const payment = await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        checkoutRequestId: stkPushResponse.CheckoutRequestID,
        merchantRequestId: stkPushResponse.MerchantRequestID,
        phoneNumber,
        status: 'PENDING'
      },
      create: {
        bookingId: booking.id,
        userId: req.user.userId,
        amount: booking.amount,
        phoneNumber,
        checkoutRequestId: stkPushResponse.CheckoutRequestID,
        merchantRequestId: stkPushResponse.MerchantRequestID,
        status: 'PENDING'
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
          checkoutRequestId: stkPushResponse.CheckoutRequestID
        },
        ipAddress: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent')
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Payment initiated. Please check your phone.',
      data: {
        checkoutRequestId: stkPushResponse.CheckoutRequestID,
        customerMessage: stkPushResponse.CustomerMessage
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