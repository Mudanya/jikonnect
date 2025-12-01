import { withAuth } from "@/lib/api-auth";
import logger from "@/lib/logger";
import { createAuditLog } from "@/services/queries/auth.query";
import { getUserProfileById, updateIdNumber } from "@/services/queries/provider.query";
import { AuthenticatedRequest } from "@/types/auth";
import { NextResponse } from "next/server";

export const POST = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const body = await req.json();
        const { idNumber } = body;
        if (!idNumber) {
            return NextResponse.json({
                success: false,
                message: 'ID number is required'
            }, { status: 400 });
        }
        const profile = await getUserProfileById(req.user.userId);
        if (!profile) {
            return NextResponse.json({
                success: false,
                message: 'User profile not found, Create one first'
            }, { status: 404 });
        }
        if (!profile.idDocument) {
            return NextResponse.json({
                success: false,
                message: 'No ID document uploaded. Please upload an ID document first.'
            }, { status: 400 });
        }
        const updatedProfile = await updateIdNumber(req.user.userId, idNumber);
        // Audit Log
        await createAuditLog(req, req.user.userId, 'ID_VERIFICATION_SUBMITTED', 'Profile', {}, profile.id);
        return NextResponse.json({
            success: true,
            message: 'ID verification submitted successfully. Please wait for admin approval',
            data: updatedProfile
        });
    }
    catch (error) {
        if (error instanceof Error) { logger.error("POST /api/profile/id-verification - " + error.message); }
        return NextResponse.json({
            success: false,
            message: 'Internal server error'
        }, { status: 500 });
    }
});