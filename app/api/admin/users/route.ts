// app/api/admin/users/route.ts
import { withRole } from '@/lib/api-auth';
import { UserStatus } from '@/lib/generated/prisma/enums';
import { prisma } from '@/prisma/prisma.init';
import { AuthenticatedRequest } from '@/types/auth';
import { NextResponse } from 'next/server';


export const GET = withRole("ADMIN")(async (req: AuthenticatedRequest) => {
    try {
        // Get query parameters
        const searchParams = req.nextUrl.searchParams;
        const role = searchParams.get('role'); // CLIENT or PROVIDER
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status'); // active, suspended, all
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        // Filter by role   
        if (role && (role === 'CLIENT' || role === 'PROFESSIONAL')) {
            where.role = role;
        }

        // Filter by search term
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Filter by status
        if (status && status !== 'all') {
            const theStatus = status as UserStatus
            where.status = theStatus ;
        } 
            
        // Fetch users with counts
        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        notifications: true,
                        policyViolations: true,

                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        })
        
        const total = await prisma.user.count({where})
        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(+total / limit),
            },
           
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users', details: (error as Error).message },
            { status: 500 }
        );
    }
})