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

export const getBookingsById = async (clientId: string, status: BookingStatus) => {
    return await prisma.booking.findMany({
        where: {
            clientId: clientId,
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