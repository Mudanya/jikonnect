import { withAuth } from "@/lib/api-auth";
import logger from "@/lib/logger";
import { createAuditLog } from "@/services/queries/auth.query";
import { getUserByUserId, getUserProfileById, updateUserProfile } from "@/services/queries/provider.query";
import { AuthenticatedRequest } from "@/types/auth";
import { profileSchema } from "@/validators/profile.validator";
import { NextResponse } from "next/server";

export const PUT = withAuth(async (req: AuthenticatedRequest) => {
    try {

        const body = await req.json();
        const validate = profileSchema.safeParse(body);

        if (!validate.success) {
            return NextResponse.json({
                success: false,
                message: 'Invalid data',
                errors: validate.error.issues
            }, { status: 400 });
        }


        const user = await getUserByUserId(req.user.userId);
        if (user?.role !== 'PROFESSIONAL') {
            return NextResponse.json({
                success: false,
                message: 'Only professionals can update professional profil'
            }, { status: 403 });
        }
        const existingProfile = await getUserProfileById(req.user.userId);
        if (!existingProfile) {
            return NextResponse.json({
                success: false,
                message: 'Professional profile not found'
            }, { status: 404 });
        }
        const profile = await updateUserProfile(req.user.userId, validate.data);

        await createAuditLog(req, req.user.userId, 'PROFESSIONAL_PROFILE_UPDATED', 'Profile', validate.data, profile.id);
        return NextResponse.json({
            success: true,
            message: 'Professional Profile updated successfully',
            data: profile
        });
    } catch (error) {
        if (error instanceof Error) { logger.error("PUT /api/profile - " + error.message); }
        return NextResponse.json({
            success: false,
            message: 'Internal server error'
        }, { status: 500 });
    }
})