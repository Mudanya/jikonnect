import { NextRequest, NextResponse } from 'next/server';

import { NotificationService } from '@/lib/notifications/notificationService';
import { verifyAccessToken } from '@/lib/jwt';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const { id: userId } = await params
        const token = authHeader.substring(7);

        const user = verifyAccessToken(token);

        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        const { action, rejectionReason } = await req.json()
        if (action === 'reject')
            NotificationService.create({
                userId: userId!,
                type: "INFO",
                priority: "HIGH",
                title: "Verification Rejected",
                message: `Your verification has been rejected. Reason: ${rejectionReason}`,
                actionUrl: `/profile`,
            });
        if (action === 'approve')
            NotificationService.create({
                userId: userId!,
                type: "SUCCESS",
                priority: "HIGH",
                title: "Verification Approved",
                message:
                    "Congratulations! Your profile has been verified.",
                actionUrl: `/profile`,
            });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark notification as read' },
            { status: 500 }
        );
    }
}