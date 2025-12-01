import { BookingStatus } from "@/lib/generated/prisma/enums"
import { prisma } from "@/prisma/prisma.init"
import { serviceSearchParams } from "@/types/service.type"
import { ProfileFormData } from "@/validators/profile.validator"
import { Decimal, InputJsonValue } from "@prisma/client/runtime/client"
import { use } from "react"

export const getUserByUserId = async (userId: string) => {
    return await prisma.user.findUnique({
        where: { id: userId }
    })
}

export const getUserProfileById = async (userId: string) => {
    return await prisma.profile.findUnique({
        where: { userId },
    })
}

export const updateUserProfile = async (userId: string, data: Partial<ProfileFormData>) => {
    return await prisma.profile.update({
        where: { userId },
        data: {
            bio: data.bio,
            services: data.services,
            hourlyRate: data.hourlyRate,
            yearsOfExperience: data.yearsOfExperience,
            location: data.location,
            languages: data.languages,
            idNumber: data.idNumber,

        }
    })
}

export const updateDocument = async (userId: string, documentUrl: string, documentType: 'certificate' | 'idDocument' | 'avatar', certificates?: string[]) => {
    if (documentType === 'avatar') {
        await prisma.user.update({
            where: { id: userId },
            data: {
                ...(documentType === 'avatar' && {
                    avatar: documentUrl
                })
            }
        })
    }
    return await prisma.profile.update({
        where: { userId },
        data: {
            ...(documentType === 'certificate' && {
                certificates: certificates && [...certificates, documentUrl]
            }),
            ...(documentType === 'idDocument' && {
                idDocument: documentUrl
            })
        }
    })
}

export const updateIdNumber = async (userId: string, idNumber: string) => {
    return await prisma.profile.update({
        where: { userId },
        data: {
            idNumber,
            verificationStatus: 'PENDING'
        }
    })
}

export const getUserProfiles = async ({ location, minRate, maxRate, minRating, category }: serviceSearchParams) => {
    return await prisma.profile.findMany({
        where: {
            verificationStatus: 'VERIFIED',
            ...(category && {
                services: { has: category }
            }),
            ...(location && {
                location: {
                    contains: location, mode: 'insensitive'
                }
            }),
            ...(minRate && maxRate && {
                hourlyRate: {
                    gte: parseFloat(minRate),
                    lte: parseFloat(maxRate)
                }
            }),
            ...(minRating && {
                averageRating: { gte: parseFloat(minRating) }
            })
        },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    email: true,
                    phone: true
                }
            },
            portfolio: {
                take: 3,
                orderBy: { createdAt: 'desc' }
            }
        },
        orderBy: {
            averageRating: 'desc'
        }
    })
}

export const getProviderbyId = async (id: string) => {
    return await prisma.profile.findFirst({
        where: {
            userId: id,
            verificationStatus: 'VERIFIED'
        },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    createdAt: true
                }
            },
            portfolio: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

}

export const getReviewsByid = async (id: string, take = 20) => {
    return await prisma.review.findMany({
        where: { revieweeId: id },
        include: {
            reviewer: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatar: true
                }
            },
            booking: {
                select: {
                    service: true,
                    createdAt: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take
    });
}

export const getProviderCompletedJobs = async (id: string) => {
    return await prisma.booking.count({
        where: {
            providerId: id,
            status: 'COMPLETED'
        }
    });
}

export const createBooking = async ({
    userId,
    providerId,
    service,
    scheduledTime,
    duration,
    hourlyRate,
    location,
    scheduledDate,
    description
}: {
    userId: string,
    providerId: string,
    service: string,
    scheduledTime: string,
    duration: number,
    hourlyRate: Decimal,
    location: string,
    scheduledDate: string,
    description: string,
}) => {
    const bookingNumber = `BK${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`;
    const hours = duration || 1;
    const amount = Number(hourlyRate) * hours;
    const commission = amount * 0.10; //TODO add to settings
    const providerPayout = amount - commission;
    return await prisma.booking.create({
        data: {
            bookingNumber,
            clientId: userId,
            providerId,
            service,
            description: description || '',
            scheduledDate: new Date(scheduledDate),
            scheduledTime,
            duration: hours,
            location,
            amount,
            commission,
            providerPayout,
            status: 'PENDING'
        },
        include: {
            provider: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    phone: true
                }
            }
        }
    });
}

export const getBookingById = async (id: string) => await prisma.booking.findUnique({
    where: { id }
});

export const updateBookingStatus = async (id: string, status: 'CANCELLED' | 'COMPLETED', cancellationReason: string) => {
    return await prisma.booking.update({
        where: { id },
        data: {
            status,
            ...(status === 'CANCELLED' && {
                cancelledAt: new Date(),
                cancellationReason
            }),
            ...(status === 'COMPLETED' && {
                completedAt: new Date()
            })
        },
        include: {
            client: {
                select: {
                    firstName: true,
                    lastName: true
                }
            },
            provider: {
                select: {
                    firstName: true,
                    lastName: true
                }
            }
        }
    });
}

export const updateProfileStats = async (providerId: string, providerPayout: string, status: string) => {
    if (status === 'COMPLETED') {
        await prisma.profile.update({
            where: { userId: providerId },
            data: {
                totalJobs: { increment: 1 },
                totalEarnings: { increment: Number(providerPayout) }
            }
        });
    }

}

export const getReviewByid = async (id: string) => await prisma.review.findUnique({
    where: { bookingId: id }
});

export const updateProviderRating = async (providerId: string) => {
    const allReviews = await prisma.review.findMany({
        where: { revieweeId: providerId }
    });

    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.profile.update({
        where: { userId: providerId },
        data: { averageRating }
    });
}

export const findUserWithPortfolio = async (id: string) => {
    return await prisma.user.findUnique({
        where: { id },
        include: {
            profile: {
                include: {
                    portfolio: true
                }
            }
        }
    })
}

export const findProfileWithPortfolio = async (userId: string) => await prisma.profile.findUnique({
    where: {
        userId
    }, include: {
        portfolio: true
    }
});

export const createPortfolio = async (profileId: string, title: string, description: string, category: string, imageUrls: string[]) => {
    return await prisma.portfolio.create({
        data: {
            profileId,
            title,
            description: description || null,
            category,
            images: imageUrls
        }
    });
}

export const deletePortfolio = async (id: string) => {
    await prisma.portfolio.delete({
        where: { id }
    });

}

export const updateProfileAvailability = async (userId: string, availability: InputJsonValue) => {
    return await prisma.profile.update({
        where: { userId },
        data: { availability }
    });
}

export const findBookingById = async (providerId: string) => await prisma.booking.findMany({
    where: { providerId },
    include: {
        client: {
            select: {
                firstName: true,
                lastName: true,
                avatar: true
            }
        },
        review: true
    },
    orderBy: { createdAt: 'desc' }
});

export const getEarnings = async (providerId: string, i: number, now: Date, date: Date) => {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    return await prisma.booking.aggregate({
        where: {
            providerId,
            status: 'COMPLETED',
            completedAt: {
                gte: date,
                lt: nextMonth
            }
        },
        _sum: {
            providerPayout: true
        }
    });
}

export const getCompletedBookings = async (providerId: string) => {
    return await prisma.booking.findMany({
        where: {
            providerId,
            status: 'COMPLETED'
        },
        include: {
            client: {
                select: {
                    firstName: true,
                    lastName: true
                }
            }
        },
        orderBy: { completedAt: 'desc' }
    });
}