import logger from "@/lib/logger";
import { activateUser, createAuditLog, findVerificationToken, removeVerificationToken } from "@/services/queries/auth.query";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest, { params }: { params: Promise<{ token: string }> }) => {

    try {

        const { token } = await params;
        
        const verification = await findVerificationToken(token);
        if (!verification) return Response.json({

            message: 'Invalid verification token',
            success: false
        }, { status: 400, });
        const data = verification?.value as { userId: string }
        await activateUser(data.userId) //update verification status
        await removeVerificationToken(token); //delete verification token
        await createAuditLog(req, data.userId, 'EMAIL_VERIFIED', 'User')
        return NextResponse.json({
            success: true,
            message: 'Email verified successfully'
        })
    }
    catch (ex) {
        if (ex instanceof Error) logger.error(ex.message)
        return NextResponse.json({

            success: false,
            message: 'Failed to verify email. Please try again.'
        }, { status: 500, })
    }
}