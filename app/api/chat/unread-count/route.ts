import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/prisma/prisma.init';
import { AuthenticatedRequest } from '@/types/auth';
import { NextResponse } from 'next/server';


// GET - Get unread message count
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    
  

    const user = await prisma.user.findUnique({
      where: { email: request.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Count unread messages where user is NOT the sender
    const unreadCount = await prisma.message.count({
      where: {
        senderId: {
          not: user.id,
        },
        conversation: {
          OR: [
            { clientId: user.id },
            { providerId: user.id },
          ],
        },
        status: {
          not: 'READ',
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: unreadCount,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch unread count',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
})