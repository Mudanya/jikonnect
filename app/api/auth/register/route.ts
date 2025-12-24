
import { hashPassword } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { generateTokens } from "@/lib/jwt";
import logger from "@/lib/logger";
import { NotificationService } from "@/lib/notifications/notificationService";
import { prisma } from "@/prisma/prisma.init";
import { createAuditLog, createUser, createVerificationTokenSettings, findUserbyEmailOrPhone } from "@/services/queries/auth.query";
import { registerSchema } from "@/validators/auth.validator";

import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json()
        const validationRes = registerSchema.safeParse(body)
        if (!validationRes.success) return Response.json({
            success: false,
            message: 'Validation error',
            errors: validationRes.error.issues
                .map(err =>
                ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            ,

        }, { status: 400 });
        const user = validationRes.data;
        const existingUser = await findUserbyEmailOrPhone(user.email, user.phone)
        if (existingUser) return Response.json({ message: "User with email or phone already exists" }, { status: 400, });

        user.password = await hashPassword(user.password)
        user.role = user.role || 'CLIENT'

        const createdUser = await createUser(user)
        const verificationToken = await createVerificationTokenSettings(createdUser.id)

        // send verification email
        await sendVerificationEmail(createdUser.email, verificationToken)
        // save Audit trail
        await createAuditLog(req, createdUser.id, 'USER_REGISTERED', 'User');

        const tokens = generateTokens({
            userId: createdUser.id,
            role: createdUser.role,
            email: createdUser.email
        }, false);

        logger.info(`${createdUser.email} registered`);
        // Send welcome notification
        await NotificationService.create({
            userId: createdUser.id,
            type: 'INFO',
            priority: 'MEDIUM',
            title: `Welcome to JiKonnect, ${createdUser.firstName}!`,
            message: createdUser.role === 'PROFESSIONAL'
                ? 'Complete your profile to start receiving booking requests.'
                : 'Start browsing service providers and book your first service.',
            actionUrl: createdUser.role === 'PROFESSIONAL'
                ? '/dashboard/profile'
                : '/services'
        });
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true }
        });
        await Promise.all(
            admins.map(admin =>
                NotificationService.create({
                    userId: admin.id,
                    type: 'SYSTEM',
                    priority: 'LOWProfile',
                    title: 'New User Registration',
                    message: `${createdUser.firstName} ${createdUser.lastName} registered as a ${createdUser.role}.`,
                    actionUrl: `/admin/users/${createdUser.id}`
                })
            )
        );

        return Response.json({

            success: true,
            message: 'Registration successful. Please verify your email.',
            data: {
                user: {
                    id: createdUser.id,
                    email: createdUser.email,
                    phone: createdUser.phone,
                    firstName: createdUser.firstName,
                    lastName: createdUser.lastName,
                    role: createdUser.role,
                    status: createdUser.status,
                    avatar: createdUser.avatar,
                },
                tokens
            }
        }, { status: 201, })
    }
    catch (ex: unknown) {
        if (ex instanceof Error) logger.error(ex.message)
        return Response.json({
            success: false,
            message: "Registration failed. Please retry!"
        }, { status: 500 })
    }
}