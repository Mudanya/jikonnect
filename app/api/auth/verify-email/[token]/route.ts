import logger from "@/lib/logger";
import { activateUser, createAuditLog, findVerificationToken, removeVerificationToken } from "@/services/auth.query";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest, { params }: { params: { token: string } }) => {
    try {
        const { token } = params
        const verification = await findVerificationToken(token);
        if (!verification) return Response.json({

            message: 'Invalid verification token',
            success: false
        }, { status: 400, });
        const data = verification?.value as { userId: string }
        await activateUser(data.userId) //update verification status
        await removeVerificationToken(token); //delete verification token
        await createAuditLog(req, data.userId, 'EMAIL_VERIFIED', 'User')
        return Response.json({
            success: false,
            message: 'Email verified successfully'
        })
    }
    catch (ex) {
        if (ex instanceof Error) logger.error(ex.message)
        return Response.json({

            success: false,
            message: 'Failed to verify email. Please try again.'
        }, { status: 500, })
    }
}