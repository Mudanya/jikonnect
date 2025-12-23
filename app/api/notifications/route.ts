import { withAuth } from "@/lib/api-auth";
import { NotificationType } from "@/lib/generated/prisma/enums";
import { NotificationService } from "@/lib/notifications/notificationService";
import { AuthenticatedRequest } from "@/types/auth";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const searchParams = req.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';
        const type = searchParams.get('type') as NotificationType | undefined;

        const result = await NotificationService.getUserNotifications(
            req.user.userId,
            {
                page,
                limit,
                unreadOnly,
                type,
            }
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
})