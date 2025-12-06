import { generateRandomToken } from "@/lib/auth";
import { User } from "@/lib/generated/prisma/client";
import { prisma } from "@/prisma/prisma.init";
import { RegisterFormData } from "@/validators/auth.validator";
import { NextRequest } from "next/server";



export const getUser = async (email: string) => {
    return await prisma.user.findUnique({
        where: { email }
    })
}

export const updateLastLogin = async (id: string) => {
    await prisma.user.update({
        where: { id },
        data: {
            lastLogin: new Date()
        }
    })
}

export const createUser = async (data: RegisterFormData) => {
    const { email,
        phone,
        password,
        fullName,
        role,
        location,
        category,
        experience,
        hourlyRate,
        bio } = data
    const fName = fullName.split(' ');
    const firstName = fName[0]
    let lastName = "";
    if (fName.length > 1) lastName = fName[1]
    return await prisma.user.create({
        data: {
            email,
            phone,
            password,
            role: role || 'CLIENT',
            firstName,
            lastName,
            ...(role === 'PROFESSIONAL' && {
                profile: {
                    create: {
                        bio: bio || null,
                        services: category ? [category] : [],
                        hourlyRate: parseFloat(hourlyRate!),
                        yearsOfExperience: experience ? parseInt(experience) : null,
                        location: location || null,
                        languages: ['English'], // Default
                        verificationStatus: 'PENDING',
                    }
                }
            })
        },
        include: { profile: true }
    })
}
export const findUserbyEmailOrPhone = async (email: string, phone?: string): Promise<User | null> => {
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { phone }
            ]
        }
    })
    return user
}
export const createAuditLog = async (req: NextRequest, userId: string, action: string, entity: string, body?: object, entityId?: string) => {
    await prisma.auditLogs.create({
        data: {
            action,
            entity,
            userId,
            entityId: entityId || userId,
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
            userAgent: req.headers.get('user-agent') || 'unknown',
            details: body ? { updateFields: Object.keys(body) } : ""
        }
    })
}

export const createVerificationTokenSettings = async (userId?: string, expires?: boolean, isPasswordReset?: boolean): Promise<string> => {
    const value = (expires) ? { userId, expiresAt: new Date(Date.now() + 3600000) }
        : { userId, createdAt: new Date() }

    const vericationToken = generateRandomToken()
    await prisma.settings.create({
        data: {
            key: `${isPasswordReset ? 'password_reset' : 'email_verification'}:${vericationToken}`,
            value
        }
    })
    return vericationToken;
}

export const findVerificationToken = async (token: string, isPasswordReset?: boolean) => await prisma.settings
    .findUnique({
        where: {
            key: `${isPasswordReset ? 'password_reset' : 'email_verification'}:${token}`
        }
    })

export const activateUser = async (id: string) => {
    await prisma.user.update({
        where: { id },
        data: {
            emailVerified: true,
            status: 'ACTIVE'
        }
    })
}

export const removeVerificationToken = async (token: string, isPasswordReset?: boolean) => {
    await prisma.settings.delete({
        where: {
            key: `${isPasswordReset ? 'password_reset' : 'email_verification'}:${token}`
        }
    })
}

export const updatePassword = async (id: string, password: string) => {
    await prisma.user.update({ where: { id }, data: { password } })
}

export const getUserWithProfileById = async (id: string) => {
    return await prisma.user.findUnique({ where: { id }, include: { profile: true } })
}

export const deleteUser = async (id: string) => {
    return await prisma.user.delete({ where: { id } })
}
export const suspendUser = async (id: string, action: 'suspend' | 'unsuspend') => {
    const status = action === 'suspend' ? 'SUSPENDED' : 'ACTIVE';
    return await prisma.user.update({ where: { id }, data: { status } })
}
