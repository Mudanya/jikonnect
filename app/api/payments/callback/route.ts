import { prisma } from "@/prisma/prisma.init";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('M-Pesa Callback:', JSON.stringify(body, null, 2));

    const { Body } = body;
    const stkCallback = Body.stkCallback;

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc
    } = stkCallback;

    // Find payment
    const payment = await prisma.payment.findFirst({
      where: {
        checkoutRequestId: CheckoutRequestID
      },
      include: {
        booking: true
      }
    });

    if (!payment) {
      console.error('Payment not found for CheckoutRequestID:', CheckoutRequestID);
      return NextResponse.json({ success: false });
    }

    // Payment successful
    if (ResultCode === 0) {
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
      const mpesaCode = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const amountPaid = callbackMetadata.find((item: any) => item.Name === 'Amount')?.Value;
      const phoneNumber = callbackMetadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;

      // Update payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          mpesaCode,
          paidAt: new Date()
        }
      });

      // Update booking
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: 'CONFIRMED'
        }
      });

      // Create notification for client
      await prisma.notification.create({
        data: {
          userId: payment.userId,
          title: 'Payment Successful',
          message: `Your payment of KES ${amountPaid} for booking ${payment.booking.bookingNumber} was successful.`,
          type: 'PAYMENT',
          data: {
            bookingId: payment.bookingId,
            mpesaCode
          }
        }
      });

      // Create notification for provider
      await prisma.notification.create({
        data: {
          userId: payment.booking.providerId,
          title: 'New Booking Confirmed',
          message: `You have a new confirmed booking for ${payment.booking.service}.`,
          type: 'PAYMENT',
          data: {
            bookingId: payment.bookingId
          }
        }
      });

      // Log transaction
      await prisma.auditLogs.create({
        data: {
          userId: payment.userId,
          action: 'PAYMENT_COMPLETED',
          entity: 'Payment',
          entityId: payment.id,
          details: {
            mpesaCode,
            amount: amountPaid,
            resultDesc: ResultDesc
          }
        }
      });
    } else {
      // Payment failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failureReason: ResultDesc
        }
      });

      // Log failure
      await prisma.auditLogs.create({
        data: {
          userId: payment.userId,
          action: 'PAYMENT_FAILED',
          entity: 'Payment',
          entityId: payment.id,
          details: {
            resultCode: ResultCode,
            resultDesc: ResultDesc
          }
        }
      });
    }

    return NextResponse.json({ 
      ResultCode: 0,
      ResultDesc: 'Success'
    });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return NextResponse.json({ 
      ResultCode: 1,
      ResultDesc: 'Failed'
    });
  }
}