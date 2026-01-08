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
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    });

    // Count unread booking messages where user is NOT the sender
    const bookingUnreadCount = await prisma.message.count({
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

    // Count unread admin messages
    const userType = fullUser?.role === 'PROFESSIONAL' ? 'PROVIDER' : 
                     fullUser?.role === 'ADMIN' ? 'ADMIN' : 'CLIENT';

    let adminUnreadCount = 0;

    if (fullUser?.role === 'ADMIN') {
      // Admin: count unread from clients and providers
      adminUnreadCount = await prisma.adminMessage.count({
        where: {
          conversation: {
            adminId: user.id
          },
          senderType: { not: 'ADMIN' },
          readAt: null
        }
      });
    } else {
      // Client/Provider: count unread from admin
      adminUnreadCount = await prisma.adminMessage.count({
        where: {
          conversation: {
            userId: user.id,
            userType
          },
          senderType: 'ADMIN',
          readAt: null
        }
      });
    }

    const totalUnreadCount = bookingUnreadCount + adminUnreadCount;

    return NextResponse.json({
      success: true,
      count: totalUnreadCount,
      bookingUnread: bookingUnreadCount,
      adminUnread: adminUnreadCount,
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