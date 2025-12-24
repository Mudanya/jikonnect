// app/api/payments/[paymentId]/status/route.ts
import { withAuth } from '@/lib/api-auth';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/prisma/prisma.init';
import { AuthenticatedRequest } from '@/types/auth';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest, { params }: { params: Promise<{ paymentId: string }> }) => {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);

        const user = verifyAccessToken(token);

        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }
        const { paymentId } = await params;
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
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
            return NextResponse.json(
                { success: false, message: 'Payment not found' },
                { status: 404 }
            );
        }

        // Check if user is authorized
        if (payment.userId !== user.userId &&
            payment.booking.providerId !== user.userId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: payment.id,
                status: payment.status,
                amount: payment.amount,
                mpesaReceiptNumber: payment.mpesaCode,
                paidAt: payment.paidAt,
                booking: {
                    id: payment.booking.id,
                    status: payment.booking.status,
                    service: payment.booking.service,
                    bookingNumber: payment.booking.bookingNumber
                }
            }
        });

    } catch (error: any) {
        console.error('Payment status check error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to check payment status' },
            { status: 500 }
        );
    }
};