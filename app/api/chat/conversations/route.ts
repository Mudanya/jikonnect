// app/api/chat/conversations/route.ts
import { NextResponse } from 'next/server';

import { withAuth } from '@/lib/api-auth';
import { AuthenticatedRequest } from '@/types/auth';
import { prisma } from '@/prisma/prisma.init';
import logger from '@/lib/logger';

// GET - Fetch all conversations for current user
export const GET = withAuth(
  async (request: AuthenticatedRequest) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email: request.user.email },
        select: { id: true },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

   const allConversations = [];

    // 1. Get all booking conversations where user is either client or provider
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { clientId: user.id },
          { providerId: user.id },
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: {
                  not: user.id,
                },
                status: {
                  not: 'READ',
                },
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Format booking conversations
    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      type: 'BOOKING',
      clientId: conv.clientId,
      providerId: conv.providerId,
      client: conv.client,
      provider: conv.provider,
      lastMessage: conv.lastMessage,
      lastMessageAt: conv.lastMessageAt,
      unreadCount: conv._count.messages,
      createdAt: conv.createdAt,
    }));

    allConversations.push(...formattedConversations);

    // 2. Get admin conversations
    const userType = request.user.role === 'PROFESSIONAL' ? 'PROVIDER' : 
                     request.user.role === 'ADMIN' ? 'ADMIN' : 'CLIENT';

    if (request.user.role === 'ADMIN') {
      // Admin gets all their conversations
      const adminConversations = await prisma.adminConversation.findMany({
        where: {
          adminId: user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              role: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              content: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  senderType: { not: 'ADMIN' },
                  readAt: null,
                },
              },
            },
          },
        },
        orderBy: {
          lastMessageAt: 'desc',
        },
      });

      const formattedAdminConvs = adminConversations.map(conv => ({
        id: conv.id,
        type: 'ADMIN',
        userId: conv.userId,
        userType: conv.userType,
        user: conv.user,
        lastMessage: conv.messages[0]?.content || null,
        lastMessageAt: conv.lastMessageAt || conv.createdAt,
        unreadCount: conv._count.messages,
        createdAt: conv.createdAt,
      }));

      allConversations.push(...formattedAdminConvs);
    } else {
      // Client/Provider gets their admin conversation
      const adminConversation = await prisma.adminConversation.findFirst({
        where: {
          userId: user.id,
          userType,
        },
        include: {
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              content: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  senderType: 'ADMIN',
                  readAt: null,
                },
              },
            },
          },
        },
      });

      if (adminConversation) {
        allConversations.push({
          id: adminConversation.id,
          type: 'ADMIN',
          admin: adminConversation.admin,
          lastMessage: adminConversation.messages[0]?.content || null,
          lastMessageAt: adminConversation.lastMessageAt || adminConversation.createdAt,
          unreadCount: adminConversation._count.messages,
          createdAt: adminConversation.createdAt,
        });
      }
    }

    // Sort all conversations by most recent
    allConversations.sort((a, b) => {
      const dateA = new Date(a.lastMessageAt || 0).getTime();
      const dateB = new Date(b.lastMessageAt || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      data: allConversations,
      total: allConversations.length,
    });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch conversations',
          details: (error as Error).message,
        },
        { status: 500 }
      );
    }
  }
);

// POST - Create new conversation
export const POST = withAuth(
  async (request: AuthenticatedRequest) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email: request.user.email },
        select: { id: true, role: true },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const body = await request.json();
      logger.warn('Conversation POST body:', body);
      const { providerId, clientId } = body;

      // Determine client and provider IDs
      let finalClientId: string;
      let finalProviderId: string;

      if (providerId) {
        // User wants to message a provider (user is client)
        finalClientId = user.id;
        finalProviderId = providerId;
      } else if (clientId) {
        // User wants to message a client (user is provider)
        finalClientId = clientId;
        finalProviderId = user.id;
      } else {
        return NextResponse.json(
          { error: 'Either providerId or clientId is required' },
          { status: 400 }
        );
      }

      // Verify the other user exists
      const otherUserId = finalClientId === user.id ? finalProviderId : finalClientId;
      const otherUser = await prisma.user.findUnique({
        where: { id: otherUserId },
        select: { id: true },
      });

      if (!otherUser) {
        return NextResponse.json(
          { error: 'Other user not found' },
          { status: 404 }
        );
      }

      // Check if conversation already exists
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          clientId: finalClientId,
          providerId: finalProviderId,
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              role: true,
            },
          },
          provider: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              role: true,
            },
          },
        },
      });

      if (existingConversation) {
        const otherParticipant =
          existingConversation.clientId === user.id
            ? existingConversation.provider
            : existingConversation.client;

        return NextResponse.json({
          success: true,
          data: {
            ...existingConversation,
            participant: otherParticipant,
            otherParticipant,
          },
          message: 'Conversation already exists',
        });
      }

      // Create new conversation
      const conversation = await prisma.conversation.create({
        data: {
          clientId: finalClientId,
          providerId: finalProviderId,
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              role: true,
            },
          },
          provider: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              role: true,
            },
          },
        },
      });

      const otherParticipant =
        conversation.clientId === user.id
          ? conversation.provider
          : conversation.client;

      return NextResponse.json({
        success: true,
        data: {
          ...conversation,
          participant: otherParticipant,
          otherParticipant,
        },
        message: 'Conversation created successfully',
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      return NextResponse.json(
        {
          error: 'Failed to create conversation',
          details: (error as Error).message,
        },
        { status: 500 }
      );
    }
  }
);