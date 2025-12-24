import { withAuth } from "@/lib/api-auth";
import logger from "@/lib/logger";
import { createAuditLog, getUserWithProfileById } from "@/services/queries/auth.query";
import { updateUserProfile } from "@/services/queries/client.query";
import { AuthenticatedRequest } from "@/types/auth";
import { clientSchema } from "@/validators/profile.validator";
import { NextResponse } from "next/server";


export const GET = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const user = await getUserWithProfileById(req.user.userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found', success: false }, { status: 404 });
        }
        return NextResponse.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                status: user.status,
                avatar: user.avatar,
                emailVerified: user.emailVerified,
                phoneVerified: user.phoneVerified,
                profile: user.profile,
            }
        });
    } catch (error) {
        if (error instanceof Error) logger.error("GET /api/profile - " + error.message);
        return NextResponse.json({ message: 'Failed to fetch profile', success: false }, { status: 500 });
    }
})

export const PUT = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const body = await req.json();
        const validate = clientSchema.safeParse(body);
        if (!validate.success) {
            return NextResponse.json({
                success: false,
                message: 'Validation error',
                errors: validate.error.issues.map(
                    err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
            }, { status: 400 });
        }

        

        const user = await updateUserProfile(req.user.userId, validate.data);

        await createAuditLog(req, req.user.userId, 'PROFILE_UPDATE', 'User', validate.data);
        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        if (error instanceof Error) logger.error("PUT /api/profile - " + error.message);
        return NextResponse.json({ message: 'Failed to update profile', success: false }, { status: 500 });
    }
})