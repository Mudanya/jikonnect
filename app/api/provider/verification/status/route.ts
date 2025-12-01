import { withAuth } from "@/lib/api-auth";
import logger from "@/lib/logger";
import { getUserProfileById } from "@/services/queries/provider.query";
import { AuthenticatedRequest } from "@/types/auth";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const profile = await getUserProfileById(req.user.userId)

        if (!profile) {
            return NextResponse.json(
                { success: false, message: 'Profile not found' },
                { status: 404 }
            );
        }

        const requirements = {
            idNumber: !!profile.idNumber,
            idDocument: !!profile.idDocument,
            certificates: (profile.certificates?.length || 0) > 0,
            profileComplete: !!profile.bio && (profile.services?.length || 0) > 0 && !!profile.hourlyRate
        };

        const canSubmit = requirements.idNumber && requirements.idDocument;

        return NextResponse.json({
            success: true,
            data: {
                verificationStatus: profile.verificationStatus,
                verifiedAt: profile.verifiedAt,
                rejectionReason: profile.rejectionReason,
                requirements,
                canSubmit,
                documents: {
                    idDocument: profile.idDocument,
                    certificates: profile.certificates || []
                }
            }
        });
    } catch (error) {
        logger.error((error as Error).message)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch verification status' },
            { status: 500 }
        );
    }
});