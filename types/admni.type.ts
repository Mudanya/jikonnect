export type Configs = {
    platform?: {
        commissionRate: number,
        minBookingAmount: number,
        maxBookingAmount: number,
        platformName: string,
        supportEmail: string,
        supportPhone: string
        maxFileUploadSizeMB: number
    },
    payments?: {
        mpesaEnabled: boolean,
        mpesaShortcode: string,
        mpesaEnvironment: string,
        autoPayoutEnabled: boolean,
        payoutThreshold: number
    },
    notifications?: {
        emailEnabled: true,
        smsEnabled: boolean,
        pushEnabled: boolean,
        bookingConfirmation: boolean,
        paymentReceipts: boolean,
        reminderHours: number
    },
    security?: {
        sessionTimeout: number,
        maxLoginAttempts: number,
        requireEmailVerification: boolean,
        requirePhoneVerification: boolean,
        twoFactorEnabled: boolean
    }
}