import { hashPassword } from "@/lib/auth"
import { Prisma } from "@/lib/generated/prisma/client"
import { DisputeStatus } from "@/lib/generated/prisma/enums"
import logger from "@/lib/logger"
import { prisma } from "@/prisma/prisma.init"
import { Configs } from "@/types/admni.type"

export const getAllPendingProfiles = async () => {
    return await prisma.profile.findMany({
        where: {
            verificationStatus: 'PENDING',
            idDocument: { not: null },
            idNumber: { not: null }
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    createdAt: true
                }
            }
            ,
            services: { select: { name: true, id: true } }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    })
}

export const verifyProviderProfile = async (id: string, action: string, rejectionReason: string) => {
    const isApprove = action === 'approve'
    return await prisma.profile.update({
        where: { id },
        data: {
            verificationStatus: isApprove ? 'VERIFIED' : 'REJECTED',
            verifiedAt: isApprove ? new Date() : null,
            rejectionReason: !isApprove || !rejectionReason ? null : rejectionReason
        },
        include: { user: true }
    })
}


export const getPendingVerifications = async () => await prisma.user.count({
    where: { role: 'PROFESSIONAL', profile: { verifiedAt: null } }
});

// Get active bookings (confirmed or pending)
export const getActiveBookings = async () => await prisma.booking.count({
    where: {
        status: { in: ['PENDING', 'CONFIRMED'] }
    }
});

// Get open disputes
export const getOpenDisputes = async () => await prisma.dispute.count({
    where: {
        status: { in: ['OPEN', 'IN_REVIEW'] }
    }
});

export const getCurrentMonthRevenue = async (currentMonth: Date) => {
    return await prisma.booking.aggregate({

        where: {
            status: 'COMPLETED',
            createdAt: { gte: currentMonth }
        },
        _sum: { amount: true }
    });
}

export const getLastMonthRevenue = async (currentMonth: Date, lastMonth: Date) => await prisma.booking.aggregate({
    where: {
        status: 'COMPLETED',
        createdAt: { gte: lastMonth, lt: currentMonth }
    },
    _sum: { amount: true }
});

export const getActiveProviders = async () => await prisma.user.count({
    where: { profile: { verifiedAt: { not: null } }, },

});

export const getActiveClients = async () => await prisma.user.count({
    where: { role: 'CLIENT' }
});

// Get completed bookings
export const getCompletedBookings = async () => await prisma.booking.count({
    where: { status: 'COMPLETED' }
});

export const getAllBokings = async () => {
    return await prisma.booking.findMany({
        include: {
            client: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    avatar: true
                }
            },
            provider: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true
                }


            },
            payment: {
                select: {
                    status: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export const findBookingWithClientAndProvider = async (bookingId: string) => {
    return await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            client: true,
            provider: true
        }
    });
}

export const cancelBooking = async (bookingId: string) => {
    await prisma.booking.update({
        where: { id: bookingId },
        data: {
            status: 'CANCELLED'
        }
    });

}

export const getAllDisputes = async (status?: DisputeStatus) => {
    return await prisma.dispute.findMany({
        where: status ? { status } : {},
        include: {
            booking: {
                select: {
                    id: true,
                    bookingNumber: true,
                    service: true,
                    amount: true,
                    status: true,
                    scheduledDate: true,
                    scheduledTime: true,

                    // Get CLIENT info ✅
                    client: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            avatar: true
                        }
                    },


                    // Get PROVIDER info ✅
                    provider: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            avatar: true
                        }
                    }
                }
            },

            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true
                }
            },
            messages: {
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                            role: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}


export const updateDispute = async (disputeId: string) => {
    await prisma.dispute.updateMany({
        where: {
            id: disputeId,
            status: 'OPEN'
        },
        data: {
            status: 'IN_REVIEW'
        }
    });
    return getDisputeById(disputeId);
}

export const getDisputeById = async (disputeId: string) => await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
        booking: { include: { provider: true } },
        user: true,
    }
});

export const updateDisputeResolution = async (disputeId: string, resolution: string, notes: string, userId: string) => {
    await prisma.dispute.update({
        where: { id: disputeId },
        data: {
            status: 'RESOLVED',
            resolution: `${resolution}: ${notes}`,
            resolvedAt: new Date(),
            resolvedBy: userId
        }
    });
}

export const closeDispute = async (disputeId: string, userId: string) => {
    await prisma.dispute.update({
        where: { id: disputeId },
        data: {
            status: 'CLOSED',
            updatedAt: new Date(),
            resolvedBy: userId
        }
    });

}

export const getTotalRevenueData = async (startDate: Date) => await prisma.booking.aggregate({
    where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate }
    },
    _sum: { amount: true },
    _count: true
});

export const getWeekyRevenueData = async (weekStart: Date) => await prisma.booking.aggregate({
    where: {
        status: 'COMPLETED',
        createdAt: { gte: weekStart }
    },
    _sum: { amount: true }
});
export const getTodayRevenueData = async (todayStart: Date) => await prisma.booking.aggregate({
    where: {
        status: 'COMPLETED',
        createdAt: { gte: todayStart }
    },
    _sum: { amount: true }
});

export const getTopProviders = async (startDate: Date) => {
    const tpProviders = await prisma.booking.groupBy({
        by: ['providerId'],
        where: {
            status: 'COMPLETED',
            createdAt: { gte: startDate }
        },

        _sum: { amount: true },
        _count: true,
        orderBy: {
            _sum: { amount: 'desc' }
        },

        take: 10
    });
    return await Promise.all(
        tpProviders.map(async (tp) => {
            const provider = await prisma.user.findUnique({
                where: { id: tp.providerId },

                select: { firstName: true, lastName: true }

            });
            return {
                id: tp.providerId,
                name: provider?.firstName + " " + provider?.lastName || 'Unknown',
                revenue: tp._sum.amount || 0,
                bookings: tp._count
            };
        })
    );
}


// Revenue by category
export const getRevenueByCategory = async (startDate: Date) => {
    const bookings = await prisma.booking.findMany({
        where: {
            status: 'COMPLETED',
            createdAt: {
                gte: startDate
            }
        },
        include: {
            provider: {
                include: {
                    profile: {
                        include: {
                            services: {
                                include: {
                                    category: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // Group by category
    const categoryMap = new Map<string, {
        category: string;
        categorySlug: string;
        categoryIcon: string | null;
        revenue: number;
        providerPayout: number;
        commission: number;
        bookings: number;
        providers: Set<string>;
        totalAmount: number;
    }>();

    bookings.forEach(async (booking) => {
        try {
            const result = await prisma.$queryRaw`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'PENDING')::int as pending,
        COUNT(*) FILTER (WHERE status = 'CONFIRMED')::int as confirmed,
        COUNT(*) FILTER (WHERE status = 'IN_PROGRESS')::int as "inProgress",
        COUNT(*) FILTER (WHERE status = 'COMPLETED')::int as completed,
        COUNT(*) FILTER (WHERE status = 'CANCELLED')::int as cancelled,
        COALESCE(
          ROUND(
            COUNT(*) FILTER (WHERE status = 'COMPLETED')::numeric * 100.0 / 
            NULLIF(COUNT(*) FILTER (WHERE status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED')), 0), 
            2
          ),
          0
        ) as "completionRate"
      FROM "Booking"
      WHERE "createdAt" >= ${startDate}
    ` as Array<{
                pending: number;
                confirmed: number;
                inProgress: number;
                completed: number;
                cancelled: number;
                completionRate: number;
            }>;

            return result?.[0] || {
                pending: 0,
                confirmed: 0,
                inProgress: 0,
                completed: 0,
                cancelled: 0,
                completionRate: 0,
            };
        } catch (error) {
            console.error('Error in getBookingConversionFunnel:', error);
            return {
                pending: 0,
                confirmed: 0,
                inProgress: 0,
                completed: 0,
                cancelled: 0,
                completionRate: 0,
            };
        }
    });

    // Convert to array and calculate averages
    return Array.from(categoryMap.values())
        .map(item => ({
            category: item.category,
            categorySlug: item.categorySlug,
            categoryIcon: item.categoryIcon,
            revenue: item.revenue,
            providerPayout: item.providerPayout,
            commission: item.commission,
            bookings: item.bookings,
            providers: item.providers.size,
            avgBookingValue: item.totalAmount / item.bookings
        }))
        ?.sort((a, b) => b.revenue - a.revenue)
        ?.slice(0, 10);
}

export const getMonthData = async (monthDate: Date, nextMonth: Date) => await prisma.booking.aggregate({
    where: {
        status: 'COMPLETED',
        createdAt: {
            gte: monthDate,
            lt: nextMonth
        }
    },
    _sum: { amount: true },
    _count: true
});

export const getBookingsForExport = async (startDate: Date) => {
    return await prisma.booking.findMany({
        where: {
            status: 'COMPLETED',
            createdAt: { gte: startDate }
        },
        include: {
            client: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true
                }
            },
            provider: {

                select: { firstName: true, lastName: true, },
                include: { profile: { select: { services: true } } }

            }
            ,
            payment: {
                select: {
                    status: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

}

export const getAuditLogs = async () => await prisma.auditLogs.findMany({
    include: {
        user: {
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
            }
        }
    },
    orderBy: { createdAt: 'desc' },
    take: 1000 // Limit to most recent 1000 logs
});


export const getSysConfigs = async () =>
    await prisma.settings.findFirst({
        orderBy: { updatedAt: 'desc' }
    });
export async function updateSetting<K extends SettingKey>(
    key: K,
    value: SettingValue<K>,
    description?: string
): Promise<void> {
    try {
        await prisma.settings.upsert({
            where: { key },
            update: {
                value: value as Prisma.InputJsonValue,
                description,
                updatedAt: new Date()
            },
            create: {
                key,
                value: value as Prisma.InputJsonValue,
                description
            }
        });
    } catch (error) {
        logger.error(`'Failed to update settings', ${(error as Error).message}`);
        throw error;
    }
}



export async function updateSettings(configs: Configs): Promise<void> {
    try {
        const updates: Promise<void>[] = [];

        // Update each setting that is provided
        if (configs.platform) {
            updates.push(updateSetting('platform', configs.platform));
        }

        if (configs.payments) {
            updates.push(updateSetting('payments', configs.payments));
        }

        if (configs.notifications) {
            updates.push(updateSetting('notifications', configs.notifications));
        }

        if (configs.security) {
            updates.push(updateSetting('security', configs.security));
        }

        await Promise.all(updates);
    } catch (error) {
        logger.error(`'Failed to update settings', ${(error as Error).message}`);
        throw error;
    }
}

export async function getSettingsByKey<K extends SettingKey>(key: K): Promise<SettingValue<K> | null> {
    const setting = await prisma.settings.findUnique({
        where: { key },
        select: { value: true }
    });

    if (!setting) {
        return null;
    }

    return setting.value as SettingValue<K>;
}

export async function getAllSettings(): Promise<Configs> {
    const settings = await prisma.settings.findMany({
        select: {
            key: true,
            value: true
        }
    });

    const config: Configs = {};

    for (const setting of settings) {
        const key = setting.key as SettingKey;
        config[key] = setting.value as any;
    }

    return config;
}

export function getDefaultSettings(): Configs {
    return {
        platform: {
            commissionRate: 10,
            minBookingAmount: 500,
            maxBookingAmount: 100000,
            platformName: 'JiKonnect',
            supportEmail: 'support@jikonnect.co.ke',
            supportPhone: '+254792423398'
        },
        payments: {
            mpesaEnabled: true,
            mpesaShortcode: '9512952',
            mpesaEnvironment: 'production',
            autoPayoutEnabled: false,
            payoutThreshold: 5000
        },
        notifications: {
            emailEnabled: true,
            smsEnabled: true,
            pushEnabled: false,
            bookingConfirmation: true,
            paymentReceipts: true,
            reminderHours: 24
        },
        security: {
            sessionTimeout: 60,
            maxLoginAttempts: 5,
            requireEmailVerification: true,
            requirePhoneVerification: false,
            twoFactorEnabled: false
        }
    };
}

/**
 * Initialize default settings (run once during setup)
 */
export async function initializeDefaultSettings(): Promise<void> {
    try {
        const defaults = getDefaultSettings();
        await updateSettings(defaults);
        console.log('Default settings initialized successfully');
    } catch (error) {
        console.error('Failed to initialize default settings', error);
        throw error;
    }
}

export const initializeAdmin = async () => {
    await prisma.user.upsert({
        where: { email: 'support@jikonnect.co.ke' },
        update: {
            firstName: 'Support',
            lastName: 'Admin',
            phone: '254792423398',
            password: await hashPassword('@Jiko72426'),
            role: 'ADMIN',
            status: 'ACTIVE',
            updatedAt: new Date(),
        },
        create: {
            email: 'support@jikonnect.co.ke',
            firstName: 'Support',
            lastName: 'Admin',
            phone: '254792423398',
            password: await hashPassword('@Jiko72426'),
            role: 'ADMIN',
            status: 'ACTIVE',
            createdAt: new Date(),
            emailVerified: true
        }
    })
    await prisma.user.upsert({
        where: { email: 'admin@jikonnect.co.ke' },
        update: {
            firstName: 'Super',
            lastName: 'Admin',
            phone: '254792480522',
            password: await hashPassword('@Konekt26!'),
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
            updatedAt: new Date(),
        },
        create: {
            email: 'admin@jikonnect.co.ke',
            firstName: 'Supper',
            lastName: 'Admin',
            phone: '254792480522',
            password: await hashPassword('@Konekt26!'),
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
            createdAt: new Date(),
            emailVerified: true
        }
    })
}

export type SettingKey = keyof Configs;

// Type-safe value type based on key
export type SettingValue<K extends SettingKey> = Configs[K];
