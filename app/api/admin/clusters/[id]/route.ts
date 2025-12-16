import { prisma } from '@/prisma/prisma.init';
import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

const clusterSchema = z.object({
    zoneId: z.string().min(1, 'Zone is required'),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    order: z.number().int().min(0),
    active: z.boolean(),
});

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const role = req.headers.get("x-user-role");
        const { id } = await params
        if (role !== "ADMIN") {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 403 });
        }

        const body = await req.json();
        const validatedData = clusterSchema.parse(body);

        // Generate slug from name
        const slug = validatedData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const cluster = await prisma.cluster.update({
            where: { id },
            data: {
                ...validatedData,
                slug,
            },
            include: {
                zone: true,
            },
        });

        return NextResponse.json(cluster);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error('Error updating cluster:', error);
        return NextResponse.json({ error: 'Failed to update cluster' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const role = req.headers.get("x-user-role");
        const { id } = await params
        if (role !== "ADMIN") {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 403 });
        }

        await prisma.cluster.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting cluster:', error);
        return NextResponse.json({ error: 'Failed to delete cluster' }, { status: 500 });
    }
}