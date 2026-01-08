import { Prisma } from "@/lib/generated/prisma/client"
import { BookingStatus, PricingType, VerificationStatus } from "@/lib/generated/prisma/enums"
import { calculateBookingPrice, calculateCommission } from "@/lib/pricing/pricingUtils"
import { prisma } from "@/prisma/prisma.init"
import { ServiceSearchParams } from "@/types/service.type"
import { ProfileFormData } from "@/validators/profile.validator"
import { Decimal, InputJsonValue } from "@prisma/client/runtime/client"


export const getUserByUserId = async (userId: string) => {
    return await prisma.user.findUnique({
        where: { id: userId }
    })
}

export const getUserProfileById = async (userId: string) => {
    return await prisma.profile.findUnique({
        where: { userId },
        include: { services: true }
    })
}

export const updateUserProfile = async (userId: string, data: Partial<ProfileFormData>) => {
    return await prisma.user.update({
        where: { id: userId },
        data: {
            profile: {
                update: {
                    bio: data.bio,
                    yearsOfExperience: data.yearsOfExperience,
                    locationId: data.location,
                    languages: data.languages,
                    idNumber: data.idNumber,
                    // services:{}
                }
            }

        },
        include: { profile: { include: { services: true } } }
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


// Helper function to build where clause
const buildWhereClause = ({ location, minRate, maxRate, minRating, category }: Omit<ServiceSearchParams, 'page' | 'limit'>) => {
    return {
        verificationStatus: VerificationStatus.VERIFIED,
        ...(category && {
            services: { 
                some: { 
                    category: { 
                        name: { equals: category, mode: Prisma.QueryMode.insensitive } 
                    } 
                } 
            }
        }),
        ...(location && {
            location: {
                id: location
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
    };
};

// Get count of providers matching filters
export const getProviderCount = async (filters: Omit<ServiceSearchParams, 'page' | 'limit'>) => {
    return await prisma.profile.count({
        where: buildWhereClause(filters)
    });
};

// Get paginated provider profiles
export const getUserProfiles = async ({ 
    location, 
    minRate, 
    maxRate, 
    minRating, 
    category,
    page = 1,
    limit = 12
}: ServiceSearchParams) => {
    const skip = (page - 1) * limit;
    
    return await prisma.profile.findMany({
        where: buildWhereClause({ location, minRate, maxRate, minRating, category }),
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
            portfolios: {
                take: 3,
                orderBy: { createdAt: 'desc' }
            },
            location: { 
                select: { 
                    name: true, 
                    id: true 
                } 
            },
            services: { 
                select: { 
                    name: true,
                    fixedPrice:true,
                    pricingType:true,
                    hourlyRate:true
                } 
            }
        },
        orderBy: [
            { averageRating: 'desc' },
            { totalJobs: 'desc' }
        ],
        skip,
        take: limit
    });
};

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
            portfolios: {
                orderBy: { createdAt: 'desc' }
            },
            services: { select: { name: true, id: true, pricingType: true, hourlyRate: true, estimatedHours: true, fixedPrice: true } }

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
    description,
    unitType,
    quantity,
    pricingType,
    fixedPrice,
    unitPrice
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
    unitType?: string,
    quantity?: number,
    unitPrice?: number,
    pricingType: PricingType,
    fixedPrice?: number,
}) => {
    const bookingNumber = `BK${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`;
    const hours = duration || 1;
    // const amount = Number(hourlyRate) * hours;
    const amount = calculateBookingPrice({ pricingType, hourlyRate: Number(hourlyRate), estimatedHours: hours, fixedPrice }, { pricingType, quantity,unitPrice, unitType, estimatedHours: hours, hourlyRate: Number(hourlyRate) });
    const loc = await prisma.location.findUnique({
        where: { id: location }
    });
    const { commission, providerPayout } = await calculateCommission(amount);
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
            location: loc ? loc.name : 'N/A',
            amount,
            commission,
            providerPayout,
            status: 'PENDING',
            unitType: unitType || null,
            quantity: quantity || null,
            // unitPrice: unitPrice || null,
            pricingType: pricingType,
            // fixedPrice: fixedPrice || null
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

export const updateBookingStatus = async (id: string, status: 'CANCELLED' | 'COMPLETED', CancellationReason: string) => {
    return await prisma.booking.update({
        where: { id },
        data: {
            status,
            ...(status === 'CANCELLED' && {
                cancelledAt: new Date(),
                CancellationReason
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
                    portfolios: true,
                    location: true,
                    services: true
                },

            }
        }
    })
}

export const findProfileWithPortfolio = async (userId: string) => await prisma.profile.findUnique({
    where: {
        userId
    }, include: {
        portfolios: true
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

export const getProviderBookingsById = async (providerId: string, status?: BookingStatus) => {
    return await prisma.booking.findMany({
        where: {
            providerId: providerId,
            ...(status && { status })
        },
        include: {
            provider: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    phone: true
                }
            },
            client: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    phone: true
                }
            },
            payment: true,
            review: true
        },
        orderBy: { createdAt: 'desc' }
    })
}