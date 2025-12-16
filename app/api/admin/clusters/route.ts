import { withRole } from '@/lib/api-auth';
import { prisma } from '@/prisma/prisma.init';
import { AuthenticatedRequest } from '@/types/auth';
import { NextResponse } from 'next/server';

import { z } from 'zod';

const clusterSchema = z.object({
    zoneId: z.string().min(1, 'Zone is required'),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    order: z.number().int().min(0),
    active: z.boolean(),
});

export const GET = withRole('ADMIN')(async (req: AuthenticatedRequest) => {
    try {
        const role = req.headers.get("x-user-role");

        if (role !== "ADMIN") {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 403 });
        }
        const { searchParams } = new URL(req.url);
        const zoneId = searchParams.get('zoneId');

        const clusters = await prisma.cluster.findMany({
            where: zoneId ? { zoneId } : undefined,
            include: {
                zone: true,
                _count: {
                    select: {
                        locations: true,
                    },
                },
            },
            orderBy: { order: 'asc' },
        });

        return NextResponse.json(clusters);
    } catch (error) {
        console.error('Error fetching clusters:', error);
        return NextResponse.json({ error: 'Failed to fetch clusters' }, { status: 500 });
    }
})

export const POST = withRole('ADMIN')(async (req: AuthenticatedRequest) => {
    try {


        const body = await req.json();
        const validatedData = clusterSchema.parse(body);

        // Generate slug from name
        const slug = validatedData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const cluster = await prisma.cluster.create({
            data: {
                ...validatedData,
                slug,
            },
            include: {
                zone: true,
            },
        });

        return NextResponse.json(cluster, { status: 201 });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error('Error creating cluster:', error);
        return NextResponse.json({ error: 'Failed to create cluster' }, { status: 500 });
    }
})