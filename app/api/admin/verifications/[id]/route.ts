import { withRole } from "@/lib/api-auth";
import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import { verifyProviderProfile } from "@/services/queries/admin.query";
import { createAuditLog } from "@/services/queries/auth.query";
import { AuthenticatedRequest } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";

export const PUT = (async (
    req: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        const authHeader = req.headers.get('authorization');
        const {id} = await params
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }

        
        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);

        if (!payload) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        
        if (payload.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        
        const authenticatedRequest = req as AuthenticatedRequest;
        authenticatedRequest.user = payload;

        return handleVerificationAction(authenticatedRequest, id);
    }
    catch (err) {
        logger.error(`Update verification error: ${(err as Error).message}`)
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update verification'
            },
            { status: 500 }
        );
    }
})

const handleVerificationAction = async (req: AuthenticatedRequest, id: string) => {
    try {
        const body = await req.json();
        const { action, rejectionReason } = body;
        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { success: false, message: 'Invalid action' },
                { status: 400 }
            );
        }
        const profile = await verifyProviderProfile(id, action, rejectionReason)
        // audit Log
        await createAuditLog(req, profile.userId, `VERIFICATION_${action.toUpperCase()}D`, 'Profile', {
            profileUserId: profile.userId,
            rejectionReason: rejectionReason || null
        }, profile.id)

        return NextResponse.json({
            success: true,
            message: `Verification ${action}d successfully`,
            data: profile
        });
    }
    catch (err) {
        logger.error((err as Error).message)
    }
}