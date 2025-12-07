// app/api/locations/zones/route.ts
import { prisma } from '@/prisma/prisma.init';
import { NextRequest, NextResponse } from 'next/server';


export const GET = async (req: NextRequest) => {
    try {
        const zones = await prisma.zone.findMany({
            where: { active: true },
            include: {
                clusters: {
                    where: { active: true },
                    include: {
                        locations: {
                            where: { active: true },
                            orderBy: { name: 'asc' },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
                locations: {
                    where: {
                        active: true,
                        clusterId: null, // Only get locations without clusters
                    },
                    orderBy: { name: 'asc' },
                },
            },
            orderBy: { order: 'asc' },
        });

        return NextResponse.json({ success: true, data: zones });
    } catch (error) {
        console.error('Error fetching zones:', error);
        return NextResponse.json(
            { error: 'Failed to fetch zones' },
            { status: 500 }
        );
    }
}