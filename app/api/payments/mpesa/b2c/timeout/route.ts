
import { prisma } from '@/prisma/prisma.init';
import { NotificationService } from '@/lib/notifications/notificationService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('B2C Result timeout:', JSON.stringify(body, null, 2));

        return NextResponse.json({
            ResultCode: 0,
            ResultDesc: 'Accepted'
        });

    } catch (error: any) {
        console.error('B2C timeout error:', error);
        // Still return success to M-Pesa to avoid retries
        return NextResponse.json({
            ResultCode: 0,
            ResultDesc: 'Accepted'
        });
    }
}