import { sendPasswordResetEmail } from "@/lib/email";
import logger from "@/lib/logger";
import { createAuditLog, createVerificationTokenSettings, findUserbyEmailOrPhone, getUser } from "@/services/queries/auth.query";
import { forgotPasswordSchema } from "@/validators/auth.validator";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json()
        const validationRes = forgotPasswordSchema.safeParse(body);
        if (!validationRes.success) return Response.json({
            success: false,

            message: 'Validation error',
            errors: validationRes.error.issues
        }, { status: 400, })

        const { email } = validationRes.data
        const user = await findUserbyEmailOrPhone(email)
        logger.warn('user:'+user)
        
        if (!user) return Response.json({
            success: true,
            message: 'If an account with this email exists, A password reset link has been sent!'
        })

        const resetToken = await createVerificationTokenSettings(user?.id, true, true)
        await sendPasswordResetEmail(user!.email, resetToken)
        // audit trail
        await createAuditLog(req, user!.id, 'PASSWORD_RESET', 'User')
        logger.info(`Password reset for: ${user?.email}`)
        return Response.json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent.'
        })
    }
    catch (err) {
        if (err instanceof Error) logger.error(err.message)
        return Response.json({

            message: 'Failed to process request. Retry!',
            success: false
        }, { status: 500, })
    }

}