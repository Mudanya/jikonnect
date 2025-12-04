// app/api/notifications/unread-count/route.ts
import { NextResponse } from 'next/server';

import { withAuth } from '@/lib/api-auth';
import { NotificationService } from '@/lib/notifications/notificationService';
import { AuthenticatedRequest } from '@/types/auth';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
    try {


        const count = await NotificationService.getUnreadCount(req.user.userId);

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return NextResponse.json(
            { error: 'Failed to fetch unread count' },
            { status: 500 }
        );
    }
})