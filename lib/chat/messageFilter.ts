import { NotificationService } from '@/lib/notifications/notificationService';
import { prisma } from '@/prisma/prisma.init';


type FilterResult = {
    allowed: boolean;
    reason?: string;
    detectedPatterns?: string[];
    strikeNumber?: number;
};

export class MessageFilter {
    // Phone number patterns for Kenya
    private static phonePatterns = [
        /\b0[71]\d{8}\b/g, // 07X, 01X formats
        /\b\+?254\s?[71]\d{8}\b/g, // +254 format
        /\b254\s?[71]\d{8}\b/g, // 254 format
        /\b0\d{9}\b/g, // General 10-digit starting with 0
        /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g, // Formatted numbers
    ];

    // Contact sharing patterns
    private static contactPatterns = [
        /whatsapp/gi,
        /wa\.me/gi,
        /call\s+me/gi,
        /text\s+me/gi,
        /dm\s+me/gi,
        /inbox\s+me/gi,
        /my\s+number/gi,
        /phone\s+number/gi,
        /mobile\s+number/gi,
        /reach\s+me\s+on/gi,
        /contact\s+me\s+on/gi,
        /telegram/gi,
        /signal/gi,
    ];

    // Email patterns
    private static emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

    // Social media patterns
    private static socialMediaPatterns = [
        /facebook\.com/gi,
        /fb\.com/gi,
        /instagram\.com/gi,
        /twitter\.com/gi,
        /x\.com/gi,
        /linkedin\.com/gi,
        /tiktok\.com/gi,
    ];

    /**
     * Check if a message contains prohibited content
     */
    static async filterMessage(
        message: string,
        userId: string
    ): Promise<FilterResult> {
        const detectedPatterns: string[] = [];

        // Check for phone numbers
        for (const pattern of this.phonePatterns) {
            if (pattern.test(message)) {
                detectedPatterns.push('phone_number');
                break;
            }
        }

        // Check for contact sharing keywords
        for (const pattern of this.contactPatterns) {
            if (pattern.test(message)) {
                detectedPatterns.push('contact_sharing');
                break;
            }
        }

        // Check for emails
        if (this.emailPattern.test(message)) {
            detectedPatterns.push('email');
        }

        // Check for social media links
        for (const pattern of this.socialMediaPatterns) {
            if (pattern.test(message)) {
                detectedPatterns.push('social_media');
                break;
            }
        }

        // If violations detected, handle them
        if (detectedPatterns.length > 0) {
            const strikeNumber = await this.handleViolation(userId, detectedPatterns);

            return {
                allowed: false,
                reason: this.getBlockedMessageReason(detectedPatterns),
                detectedPatterns,
                strikeNumber,
            };
        }

        return { allowed: true };
    }

    /**
     * Handle a violation - create notification and track strikes
     */
    private static async handleViolation(
        userId: string,
        detectedPatterns: string[]
    ): Promise<number> {
        // Count existing violations in the last 30 days
        const recentViolations = await prisma.policyViolation.count({
            where: {
                userId,
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
            },
        });

        const strikeNumber = Math.min(recentViolations + 1, 3);

        // Create policy violation record
        await prisma.policyViolation.create({
            data: {
                userId,
                violationType: detectedPatterns[0].toUpperCase(),
                severity: `STRIKE_${strikeNumber}`,
                description: `Attempted to share ${detectedPatterns.join(', ')} in chat`,
                evidence: { detectedPatterns },
            },
        });

        // Send appropriate notification based on strike number
        if (strikeNumber === 1) {
            await NotificationService.notifyPhoneNumberBlocked(userId, '');
        } else {
            await NotificationService.notifyContactSharingAttempt(
                userId,
                detectedPatterns.join(', '),
                strikeNumber
            );
        }

        // For strike 2 and 3, also send strike warning
        if (strikeNumber >= 2) {
            await NotificationService.notifyStrikeWarning(
                userId,
                strikeNumber,
                `Contact sharing attempt: ${detectedPatterns.join(', ')}`
            );

            // For strike 3, suspend the account
            if (strikeNumber === 3) {
                await this.suspendAccount(userId);
            }
        }

        return strikeNumber;
    }

    /**
     * Get user-friendly blocked message reason
     */
    private static getBlockedMessageReason(patterns: string[]): string {
        if (patterns.includes('phone_number')) {
            return '⛔ Phone numbers are not allowed. All communication must stay within JiKonnect for your safety and payment protection.';
        }
        if (patterns.includes('email')) {
            return '⛔ Email addresses are not allowed. Please communicate only through JiKonnect chat.';
        }
        if (patterns.includes('contact_sharing')) {
            return '⛔ Contact sharing is prohibited. Stay on JiKonnect to maintain your guarantee and protection.';
        }
        if (patterns.includes('social_media')) {
            return '⛔ Social media links are not allowed. Keep all communication within JiKonnect.';
        }
        return '⛔ This message contains prohibited content. Please review our community guidelines.';
    }

    /**
     * Suspend account after strike 3
     */
    private static async suspendAccount(userId: string) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                status: 'SUSPENDED',
                updatedAt: new Date(),

            },
        });
    }

    /**
     * Get strike count for a user
     */
    static async getUserStrikeCount(userId: string): Promise<number> {
        return await prisma.policyViolation.count({
            where: {
                userId,
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
            },
        });
    }

    /**
     * Check if user is suspended
     */
    static async isUserSuspended(userId: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { id: userId, status: { equals: 'SUSPENDED' } },
            select: { status: true },
        });
        return user?.status === 'SUSPENDED' || false;
    }

    /**
     * Sanitize message by removing detected patterns
     */
    static sanitizeMessage(message: string): string {
        let sanitized = message;

        // Remove phone numbers
        for (const pattern of this.phonePatterns) {
            sanitized = sanitized.replace(pattern, '[REDACTED]');
        }

        // Remove emails
        sanitized = sanitized.replace(this.emailPattern, '[REDACTED]');

        return sanitized;
    }
}