import { prisma } from "@/prisma/prisma.init";
import { BookingStatus } from "@/types/service.type";
import { ClientFormData } from "@/validators/profile.validator";

export const updateUserProfile = async (userId: string, data: Partial<ClientFormData>) => {
    const { firstName, lastName, phone, avatar } = data;
    return await prisma.user.update({
        where: { id: userId },
        data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(phone && { phone }),
            ...(avatar && { avatar })
        },
        include: { profile: true }
    })
}

export const getBookingsById = async (clientId: string, status?: BookingStatus) => {
    return await prisma.booking.findMany({
        where: {
            clientId,
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
            payment: true,
            review: true
        },
        orderBy: { createdAt: 'desc' }
    })
}

export const createReview = async (
    { id, userId, providerId, rating, comment }:
        {
            id: string,
            userId: string,
            providerId: string,
            rating: number,
            comment: string
        }) => {
    return await prisma.review.create({
        data: {
            bookingId: id,
            reviewerId: userId,
            revieweeId: providerId,
            rating,
            comment: comment || ''
        }
    })
}

export const [
    totalProviders,
    verifiedProviders,
    totalBookings,
    completedBookings,
    totalReviews
] = await Promise.all([
    prisma.user.count({ where: { role: { equals: 'PROFESSIONAL' } } }),
    prisma.user.count({ where: { role: { equals: 'PROFESSIONAL' }, profile: { verifiedAt: { not: null } } } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.review.count()
]);

export const getAvgRatingResult = async () => await prisma.review.aggregate({
    _avg: {
        rating: true
    }
});

export const getAllProviders = async (): Promise<{ location: string, firstName: string, lastName: string, avatar: string, rating: number, id: string, bio: string, services: string[] }[]> => await prisma.$queryRaw`
  SELECT u.*,p.bio,p.services,p.location, MAX(r.rating) as rating
  FROM "User" u
  LEFT JOIN "Review" r ON r."revieweeId" = u.id
  INNER JOIN "Profile" p ON p."userId" = u.id
  GROUP BY u.id,p.bio,p.services,p.location
  ORDER BY rating DESC NULLS LAST
  LIMIT 10
`;

export const getRecentReviews = async () => await prisma.review.findMany({
    where: {
        rating: { gte: 4 }
    },
    include: {
        reviewer: {
            select: {
                firstName: true,
                lastName: true,
                avatar: true
            }
        },
        reviewee: {
            include: { profile: { select: { services: true, location: true } } }
        },
        booking: {
            select: {
                scheduledDate: true
            }
        }
    },
    orderBy: {
        createdAt: 'desc'
    },
    take: 6
});

export const getProviderServices = async () =>
    await prisma.user.findMany({
        where: {
            role: 'PROFESSIONAL',
            profile: { verifiedAt: { not: null }, }
        },
        include: {
            profile: { select: { services: true } }
        }
    });
