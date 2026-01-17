import { withRole } from '@/lib/api-auth';
import { prisma } from '@/prisma/prisma.init';

import { AuthenticatedRequest } from '@/types/auth';
import { NextResponse } from 'next/server';

// GET - Get all admin conversations
export const GET = withRole('ADMIN')(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const userType = searchParams.get('userType'); // Filter by CLIENT or PROVIDER
    const status = searchParams.get('status'); // Filter by status
    const search = searchParams.get('search'); // Search by user name

    const where: any = {};

    // Filter by user type
    if (userType && ['CLIENT', 'PROVIDER'].includes(userType)) {
      where.userType = userType;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Search by user name
    if (search) {
      where.user = {
        OR: [
          {
            firstName: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            lastName: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ]
      };
    }

    const conversations = await prisma.adminConversation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            role: true
          }
        },
        messages: {
          select: {
            id: true,
            content: true,
            senderType: true,
            readAt: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1 // Last message only
        },
        _count: {
          select: {
            messages: {
              where: {
                senderType: { not: 'ADMIN' },
                readAt: null
              }
            }
          }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    // Format conversations with unread count and last message
    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      user: conv.user,
      userType: conv.userType,
      status: conv.status,
      lastMessageAt: conv.lastMessageAt,
      unreadCount: conv._count.messages,
      lastMessage: conv.messages[0] || null,
      createdAt: conv.createdAt
    }));

    return NextResponse.json({
      success: true,
      conversations: formattedConversations
    });

  } catch (error: any) {
    console.error('Get admin conversations error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
});