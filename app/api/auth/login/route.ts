import { verifyPassword } from "@/lib/auth";
import { generateTokens } from "@/lib/jwt";
import logger from "@/lib/logger";
import { createAuditLog, getUser, updateLastLogin } from "@/services/auth.query";
import { loginSchema } from "@/validators/auth.validator";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const body = req.json();
        const validationRes = loginSchema.safeParse(body);
        if (!validationRes.success) return Response.json(
            {
                success: false,
                message: 'Validation error',
                errors: validationRes.error.issues.map(
                    err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
            }, { status: 400 })
        const { email, password } = validationRes.data;
        const user = await getUser(email)
        if (!user) return Response.json(
            {

                message: 'Invalid email or password',
                success: false
            }, { status: 401, })
        if (user.status === 'SUSPENDED') return Response.json(
            {

                message: 'Account is suspended please. Please contact support',
                success: false
            }, { status: 403, })
        const isValidPwd = await verifyPassword(password, user.password)
        if (!isValidPwd) return Response.json({

            message: 'Invalid email or password',
            success: false
        }, { status: 401, })
        // update last login
        await updateLastLogin(user.id)
        const tokens = generateTokens({
            userId: user.id,
            role: user.role,
            email: user.email
        })

        // Audit Log
        await createAuditLog(req, user.id, 'USER_LOGIN', 'User');
        logger.info(`${user.email} Logged In`)
        return Response.json({
            message: 'login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    phone: user.phone,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    status: user.status,
                    emailVerified: user.emailVerified,
                    phoneVerified: user.phoneVerified
                },
                tokens
            }
        })
    }
    catch (ex) {
        if (ex instanceof Error) logger.error(ex.message)
        return Response.json({ success: false, message: 'Unable to login. Try again' }, { status: 500 })
    }
}