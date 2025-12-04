import { MpesaService } from "@/lib/mpesa";
import { prisma } from "@/prisma/prisma.init";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { checkoutRequestId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        checkoutRequestId: params.checkoutRequestId
      },
      include: {
        booking: true
      }
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    // If still pending, query M-Pesa
    if (payment.status === 'PENDING') {
      try {
        const mpesa = new MpesaService();
        const status = await mpesa.querySTKPushStatus(params.checkoutRequestId);
        
        if (status.ResultCode === '0') {
          // Payment successful - update
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'PAID', paidAt: new Date() }
          });
        }
      } catch (error) {
        console.error('Status query error:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        status: payment.status,
        amount: payment.amount,
        mpesaCode: payment.mpesaCode,
        paidAt: payment.paidAt,
        failureReason: payment.failureReason
      }
    });
  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}