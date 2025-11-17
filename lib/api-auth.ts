import { AuthenticatedRequest } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";
import logger from "./logger";

export const withAuth = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
        try {
            const userId = req.headers.get('x-user-id');
            const email = req.headers.get('x-user-email');
            const role = req.headers.get('x-user-role');

            if (!userId || !email || !role) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Authentication required'
                    },
                    { status: 401 }
                );
            }
            const authenticatedReq = req as AuthenticatedRequest;
            authenticatedReq.user = { userId, email, role };
            return await handler(authenticatedReq)
        }
        catch (ex) {
            if (ex instanceof Error) logger.error(ex.message)
            return NextResponse.json(
                {
                    success: false,
                    message: 'Internal server error'
                },
                { status: 500 })
        }
    }
}

export const withRole = (...allowedRoles: string[]) => {
    return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
        return withAuth(async (req: AuthenticatedRequest) => {
            if (!allowedRoles.includes(req.user.role)) {
                return NextResponse.json(
                    { success: false, message: 'Insufficient permissions' },
                    { status: 403 }
                );
            }
            return await handler(req)
        })
    }

}