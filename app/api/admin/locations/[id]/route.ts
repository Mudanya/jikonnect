import { prisma } from '@/prisma/prisma.init';
import { NextRequest, NextResponse } from 'next/server';

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
   const role = req.headers.get("x-user-role");
    const {id } = await params
    if (role !== "ADMIN") {
      return NextResponse.json({
        success: false,
        message: "Unauthorized"
      }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = locationSchema.parse(body);

    // Generate slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const location = await prisma.location.update({
      where: { id },
      data: {
        ...validatedData,
        slug,
      },
      include: {
        zone: true,
        cluster: true,
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Error updating location:', error);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
   const role = req.headers.get("x-user-role");
    const {id } = await params
    if (role !== "ADMIN") {
      return NextResponse.json({
        success: false,
        message: "Unauthorized"
      }, { status: 403 });
    }

    await prisma.location.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
  }
}