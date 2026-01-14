import { MpesaService } from "@/lib/mpesa";
import { NotificationService } from "@/lib/notifications/notificationService";
import { prisma } from "@/prisma/prisma.init";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params
        const payment = await prisma.payment.findFirst({
            where: {
                id
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
                const status = await mpesa.querySTKPushStatus(payment.checkoutRequestId!);

                if (status.ResultCode === '0') {
                    // Payment successful - update
                    await prisma.payment.update({
                        where: { id: payment.id },
                        data: { status: 'PAID', paidAt: new Date() }
                    });

                    // update booking
                    await prisma.booking.update({
                        where: { id: payment.bookingId },
                        data: { status: 'IN_PROGRESS' }
                    })
                    await NotificationService.create({
                        userId: payment.booking.clientId,
                        type: 'SUCCESS',
                        priority: 'MEDIUM',
                        title: 'Payment received',
                        message: `Your payment for ${payment.booking.service} has been received.`,
                        actionUrl: `/bookings/${payment.bookingId}`
                    })
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