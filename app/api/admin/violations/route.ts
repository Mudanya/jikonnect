
import { withRole } from '@/lib/api-auth';
import logger from '@/lib/logger';
import { prisma } from '@/prisma/prisma.init';
import { AuthenticatedRequest } from '@/types/auth';
import { NextResponse } from 'next/server';

export const GET = withRole("ADMIN", "SUPER_ADMIN")(async (req: AuthenticatedRequest) => {
    try {


        const searchParams = req.nextUrl.searchParams;
        const severity = searchParams.get('severity');
        const resolved = searchParams.get('resolved');

        const where: any = {};
        if (severity) where.severity = severity;
        if (resolved !== null) where.resolved = resolved === 'true';

        const violations = await prisma.policyViolation.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });

        return NextResponse.json({ violations });
    } catch (error) {
        console.error('Error fetching violations:', error);
        if (error instanceof Error) logger.error('Error fetching violations: ' + error.message) 
        return NextResponse.json(
            { error: 'Failed to fetch violations' },
            { status: 500 }
        );
    }
})