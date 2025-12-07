import { generateTokens, verifyRefreshToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const { refreshtoken } = await req.json()
        if (!refreshtoken) return Response.json({
            status: 400,
            message: 'Refresh token is required',
            success: false
        });
        const payload = verifyRefreshToken(refreshtoken);
        if (!payload) return Response.json({

            message: 'Invalid or expired refresh token',
            success: false
        }, { status: 401, })
        const tokens = generateTokens(payload,false)
        return Response.json({
            success: true,
            message: 'Token refreshed successfully',
            data: { tokens }
        })

    }
    catch (ex) {
        if (ex instanceof Error) logger.error(ex.message)
        return Response.json({

            success: false,
            message: 'Failed to refesh token. Please retry.'
        }, { status: 500, });
    }
}