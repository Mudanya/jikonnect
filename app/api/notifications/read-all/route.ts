import { withAuth } from "@/lib/api-auth";
import { NotificationService } from "@/lib/notifications/notificationService";
import { AuthenticatedRequest } from "@/types/auth";
import { NextResponse } from "next/server";

export const PATCH = withAuth(async (req: AuthenticatedRequest) => {
    try {


        await NotificationService.markAllAsRead(req.user.userId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark notifications as read' },
            { status: 500 }
        );
    }
})