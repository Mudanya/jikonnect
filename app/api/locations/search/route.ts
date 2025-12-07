import { prisma } from '@/prisma/prisma.init';
import { NextRequest, NextResponse } from 'next/server';


export const GET = async(req: NextRequest)=> {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const locations = await prisma.location.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        zone: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        cluster: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      take: 20,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ locations, count: locations.length });
  } catch (error) {
    console.error('Error searching locations:', error);
    return NextResponse.json(
      { error: 'Failed to search locations' },
      { status: 500 }
    );
  }
}