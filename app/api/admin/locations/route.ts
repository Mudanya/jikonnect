import { withRole } from '@/lib/api-auth';
import { prisma } from '@/prisma/prisma.init';
import { AuthenticatedRequest } from '@/types/auth';
import { NextResponse } from 'next/server';

import { z } from 'zod';

const locationSchema = z.object({
    zoneId: z.string().min(1, 'Zone is required'),
    clusterId: z.string().nullable().optional(),
    name: z.string().min(1, 'Name is required'),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    matchingRadius: z.number().int().min(1).max(50),
    active: z.boolean(),
});

export const GET = withRole("ADMIN")(async (req: AuthenticatedRequest) => {
    try {


        const { searchParams } = new URL(req.url);
        const zoneId = searchParams.get('zoneId');
        const clusterId = searchParams.get('clusterId');

        const where: any = {};
        if (zoneId) where.zoneId = zoneId;
        if (clusterId) where.clusterId = clusterId;

        const locations = await prisma.location.findMany({
            where,
            include: {
                zone: true,
                cluster: true,
                _count: {
                    select: {
                        profiles: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
    }
})

export const POST = withRole("ADMIN")(async (req: AuthenticatedRequest) => {
    try {


        const body = await req.json();
        const validatedData = locationSchema.parse(body);

        // Generate slug from name
        const slug = validatedData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const location = await prisma.location.create({
            data: {
                ...validatedData,
                slug,
            },
            include: {
                zone: true,
                cluster: true,
            },
        });

        return NextResponse.json(location, { status: 201 });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error('Error creating location:', error);
        return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
    }
})