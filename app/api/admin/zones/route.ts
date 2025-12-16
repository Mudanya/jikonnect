import { useAuth } from '@/contexts/AuthContext';
import { withRole } from '@/lib/api-auth';
import { prisma } from '@/prisma/prisma.init';
import { AuthenticatedRequest } from '@/types/auth';
import { NextRequest, NextResponse } from 'next/server';



import { z } from 'zod';

const zoneSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
    order: z.number().int().min(0),
    active: z.boolean(),
});

export const GET = withRole('ADMIN')(async (req: AuthenticatedRequest) => {
    try {



        const zones = await prisma.zone.findMany({
            include: {
                _count: {
                    select: {
                        clusters: true,
                        locations: true,
                    },
                },
            },
            orderBy: { order: 'asc' },
        });

        return NextResponse.json(zones);
    } catch (error) {
        console.error('Error fetching zones:', error);
        return NextResponse.json({ error: 'Failed to fetch zones' }, { status: 500 });
    }
})

export const POST = withRole('ADMIN')(async (req: AuthenticatedRequest) => {
    try {


        const body = await req.json();
        const validatedData = zoneSchema.parse(body);

        // Generate slug from name
        const slug = validatedData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const zone = await prisma.zone.create({
            data: {
                ...validatedData,
                slug,
            },
        });

        return NextResponse.json(zone, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.flatten }, { status: 400 });
        }
        console.error('Error creating zone:', error);
        return NextResponse.json({ error: 'Failed to create zone' }, { status: 500 });
    }
})