import { prisma } from "@/prisma/prisma.init"
import { serviceSearchParams } from "@/types/service.type"
import { ProfileFormData } from "@/validators/profile.validator"
import { Decimal } from "@prisma/client/runtime/client"
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

export const getReviewsByid = async (id: string) => {
    await prisma.review.findMany({
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
        take: 20
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