import { withRole } from "@/lib/api-auth";
import logger from "@/lib/logger";
import { NotificationService } from "@/lib/notifications/notificationService";
import { prisma } from "@/prisma/prisma.init";
import { AuthenticatedRequest } from "@/types/auth";
import { NextResponse } from "next/server";

// TODO: use withRole:Admin
export const POST = withRole("ADMIN", "SUPER_ADMIN")(async (req: AuthenticatedRequest) => {
    try {
        const { startTime, endTime, message } = await req.json();

        // Get all active users
        const users = await prisma.user.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true }
        });

        // Send notification to all users
        await Promise.all(
            users.map(user =>
                NotificationService.create({
                    userId: user.id,
                    type: 'SYSTEM',
                    priority: 'HIGH',
                    title: 'Scheduled Maintenance',
                    message: `JiKonnect will be under maintenance from ${startTime} to ${endTime}. ${message}`,

                })
            )
        );

        return NextResponse.json({ success: true, notified: users.length });
    }
    catch (err) {
        logger.error((err as Error).message)
        return NextResponse.json(
            { success: false, message: 'Failed to send notifications' },
            { status: 500 }
        );
    }
})