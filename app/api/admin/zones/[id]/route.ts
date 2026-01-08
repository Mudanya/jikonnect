import { prisma } from '@/prisma/prisma.init';
import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

const zoneSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
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
        if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 403 });
        }

        const body = await req.json();
        const validatedData = zoneSchema.parse(body);

        // Generate slug from name
        const slug = validatedData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const zone = await prisma.zone.update({
            where: { id },
            data: {
                ...validatedData,
                slug,
            },
        });

        return NextResponse.json(zone);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error('Error updating zone:', error);
        return NextResponse.json({ error: 'Failed to update zone' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const role = req.headers.get("x-user-role");
        const { id } = await params
        if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 403 });
        }
        await prisma.zone.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting zone:', error);
        return NextResponse.json({ error: 'Failed to delete zone' }, { status: 500 });
    }
}