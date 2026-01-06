import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./lib/jwt";

export const proxy = (req: NextRequest) => {
    const token = req.cookies.get('accessToken')?.value ||
        req.headers.get('authorization')?.replace('Bearer ', '');
    const { pathname } = req.nextUrl;

    const publicRoutes = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/forgot-password',
        '/api/auth/reset-password',
        '/api/auth/verify-email',
        '/api/landing',
        '/api/services/top',
        '/api/locations/zones',
        '/api/locations/search',
        '/api/services',

    ];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    if (isPublicRoute) return NextResponse.next();
    if (pathname.startsWith('/api')) {
        if (!token) return Response.json({
            success: false,
            message: 'Authentication required'
        },
            { status: 401 }
        );
        const user = verifyAccessToken(token!)
        if (!user) {

            return Response.json({
                success: false,
                message: 'Invalid or expired token'
            },
                { status: 401 });
        }
        const requestHeaders = new Headers(req.headers)
        requestHeaders.set('x-user-id', user.userId)
        requestHeaders.set('x-user-email', user.email)
        requestHeaders.set('x-user-role', user.role)

        return NextResponse.next({
            request:
                { headers: requestHeaders }
        })
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/:path*',
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};