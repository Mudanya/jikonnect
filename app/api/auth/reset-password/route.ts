import { hashPassword } from "@/lib/auth";
import logger from "@/lib/logger";
import { createAuditLog, findVerificationToken, removeVerificationToken, updatePassword } from "@/services/auth.query";
import { resetPasswordSchema } from "@/validators/auth.validator";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const body = req.json();
        const validationRes = resetPasswordSchema.safeParse(body)
        if (!validationRes.success) return Response.json({

            success: false,
            message: 'Validation error',
            errors: validationRes.error.issues
        }, { status: 400, })

        const { token, newPassword } = validationRes.data
        const pwdReset = await findVerificationToken(token, true)
        if (!pwdReset) return Response.json({

            success: false,
            message: 'Invalid or expired reset token'
        }, { status: 400, })

        const data = pwdReset.value as { expiresAt: string, userId: string, email: string }
        const expriresAt = new Date(data.expiresAt)
        if (expriresAt < new Date()) {
            await removeVerificationToken(token, true)
            return Response.json({
                success: false,
                message: 'Reset token has expired'
            }, { status: 400, })
        }
        const hashedPaswword = await hashPassword(newPassword)
        await updatePassword(data.userId, hashedPaswword)
        await removeVerificationToken(token, true)

        await createAuditLog(req, data.userId, 'PASSWORD_RESET_COMPLETE', 'User')
        logger.info(`${data.email} password reset successfully!`)
        return Response.json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        })
    }
    catch (ex) {
        if (ex instanceof Error) logger.error(ex.message)
        return Response.json({
            success: false,

            message: 'Failed to reset password. Retry'
        }, { status: 500, })
    }
}