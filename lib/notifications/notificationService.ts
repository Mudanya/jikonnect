import { prisma } from "@/prisma/prisma.init";
import { NotificationPriority, NotificationType } from "../generated/prisma/enums";


export type CreateNotificationInput = {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    priority?: NotificationPriority;
    data?: Record<string, any>;
    actionUrl?: string;
    expiresAt?: Date;
};

export class NotificationService {
    // Create a single notification
    static async create(input: CreateNotificationInput) {
        const notification = await prisma.notification.create({
            data: {
                userId: input.userId,
                title: input.title,
                message: input.message,
                type: input.type || 'INFO',

                data: input.data || {},
                actionUrl: input.actionUrl,
                expiresAt: input.expiresAt,
                priority:input.priority
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

       

        return notification;
    }

    // Anti-Leakage Specific: Contact Sharing Attempt
    static async notifyContactSharingAttempt(
        userId: string,
        detectedContent: string,
        strikeNumber: number
    ) {
        const titles = {
            1: '⚠️ Warning: Contact Sharing Not Allowed',
            2: '🔴 Strike 2: Contact Sharing Violation',
            3: '🚨 Final Warning: Account Suspension',
        };

        const messages = {
            1: 'We detected an attempt to share contact information. Communication must stay within JiKonnect for your safety and protection.',
            2: 'This is your second violation. Sharing contact details is prohibited. Next violation will result in account suspension.',
            3: 'This is your final warning. Your account has been temporarily suspended for 7 days. Further violations will result in permanent ban.',
        };

        return await this.create({
            userId,
            title: titles[strikeNumber as keyof typeof titles] || titles[1],
            message: messages[strikeNumber as keyof typeof messages] || messages[1],
            type: 'POLICY_VIOLATION',

            data: {
                violationType: 'CONTACT_SHARING',
                detectedContent,
                strikeNumber,
                timestamp: new Date(),
            },
            actionUrl: '/notifications',
        });
    }

    // Phone Number Detection Alert
    static async notifyPhoneNumberBlocked(userId: string, attemptedMessage: string) {
        return await this.create({
            userId,
            title: '⛔ Phone Number Blocked',
            message:
                'Your message contained a phone number and was blocked. All communication must happen within JiKonnect to ensure your safety and payment protection.',
            type: 'SECURITY_ALERT',

            data: {
                violationType: 'PHONE_NUMBER',
                blockedAt: new Date(),
            },
            actionUrl: '/notifications',
        });
    }

    // Payment Received Notification
    static async notifyPaymentReceived(
        userId: string,
        amount: number,
        jobId: string
    ) {
        return await this.create({
            userId,
            title: '💰 Payment Received',
            message: `You've received KSh ${amount.toLocaleString()} for your completed job. Funds will be available in 24 hours.`,
            type: 'PAYMENT',

            data: {
                amount,
                jobId,
                currency: 'KES',
            },
            actionUrl: `/provider/bookings`,
        });
    }

    // Job Assigned Notification
    static async notifyJobAssigned(
        userId: string,
        jobTitle: string,
        jobId: string,
        clientName: string
    ) {
        return await this.create({
            userId,
            title: '🎉 New Job Assigned!',
            message: `You've been assigned to "${jobTitle}" by ${clientName}. Check details and accept within 1 hour.`,
            type: 'JOB_UPDATE',

            data: {
                jobId,
                jobTitle,
                clientName,
            },
            actionUrl: `/jobs/${jobId}`,
        });
    }

    // Strike Warning
    static async notifyStrikeWarning(
        userId: string,
        strikeNumber: number,
        reason: string
    ) {
        const suspensionDays = strikeNumber === 2 ? 7 : strikeNumber === 3 ? 0 : 0;

        return await this.create({
            userId,
            title: `🔴 Strike ${strikeNumber}/3 - Policy Violation`,
            message:
                strikeNumber === 3
                    ? `Your account has been permanently banned due to repeated violations. All earnings have been forfeited. Reason: ${reason}`
                    : `You've received Strike ${strikeNumber}/3. ${suspensionDays > 0
                        ? `Account suspended for ${suspensionDays} days.`
                        : 'Next violation will result in suspension.'
                    } Reason: ${reason}`,
            type: 'STRIKE_WARNING',

            data: {
                strikeNumber,
                reason,
                suspensionDays,
                isPermanentBan: strikeNumber === 3,
            },
            actionUrl: '/help/appeal',
        });
    }

    // Priority Job Opportunity (Incentive Notification)
    static async notifyPriorityJob(
        userId: string,
        jobTitle: string,
        jobId: string,
        bonusAmount: number
    ) {
        return await this.create({
            userId,
            title: '⭐ Priority Job Available!',
            message: `High-paying job "${jobTitle}" is now available. Includes KSh ${bonusAmount} bonus! Accept within 30 minutes.`,
            type: 'JOB_UPDATE',

            data: {
                jobId,
                jobTitle,
                bonusAmount,
                isPriority: true,
            },
            actionUrl: `/jobs/${jobId}`,
        });
    }

    // Bonus Earned Notification
    static async notifyBonusEarned(
        userId: string,
        bonusAmount: number,
        reason: string
    ) {
        return await this.create({
            userId,
            title: '🎁 Bonus Earned!',
            message: `Congratulations! You've earned a KSh ${bonusAmount} bonus for ${reason}. Keep up the great work!`,
            type: 'SUCCESS',

            data: {
                bonusAmount,
                reason,
            },
            actionUrl: '/earnings',
        });
    }

    // Contact Details Now Available (After Payment)
    static async notifyContactDetailsAvailable(
        userId: string,
        jobId: string,
        contactPerson: string
    ) {
        return await this.create({
            userId,
            title: '📞 Contact Details Now Available',
            message: `Payment confirmed! You can now contact ${contactPerson} for job coordination. Contact details visible in job details.`,
            type: 'INFO',

            data: {
                jobId,
                contactPerson,
            },
            actionUrl: `/jobs/${jobId}`,
        });
    }

    // Get user notifications with pagination
    static async getUserNotifications(
        userId: string,
        options: {
            page?: number;
            limit?: number;
            unreadOnly?: boolean;
            type?: NotificationType;
        } = {}
    ) {
        const { page = 1, limit = 20, unreadOnly = false, type } = options;
        const skip = (page - 1) * limit;

        const where: any = { userId };
        if (unreadOnly) where.read = false;
        if (type) where.type = type;

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({
                where: { userId, read: false },
            }),
        ]);

        return {
            notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            unreadCount,
        };
    }

    // Mark notification as read
    static async markAsRead(notificationId: string, userId: string) {
        return await prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: {
                read: true,
                readAt: new Date(),
            },
        });
    }

    // Mark all as read
    static async markAllAsRead(userId: string) {
        return await prisma.notification.updateMany({
            where: { userId, read: false },
            data: {
                read: true,
                readAt: new Date(),
            },
        });
    }

    // Delete notification
    static async delete(notificationId: string, userId: string) {
        return await prisma.notification.deleteMany({
            where: { id: notificationId, userId },
        });
    }

    // Get unread count
    static async getUnreadCount(userId: string) {
        return await prisma.notification.count({
            where: { userId, read: false },
        });
    }

    // Send real-time notification via Pusher
   

    // Clean up expired notifications
    static async cleanupExpired() {
        return await prisma.notification.deleteMany({
            where: {
                expiresAt: {
                    lte: new Date(),
                },
            },
        });
    }
}