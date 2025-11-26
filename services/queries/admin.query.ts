import { prisma } from "@/prisma/prisma.init"

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