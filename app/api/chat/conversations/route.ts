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

      // Get all conversations where user is either client or provider
      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            { clientId: user.id },
            { providerId: user.id }

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
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Get last message
            select: {
              id: true,
              content: true,
              createdAt: true,
              senderId: true,
              status: true,
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  senderId: {
                    not: user.id, // Messages NOT sent by current user
                  },
                  status: {
                    not: 'READ', // That are unread
                  },
                },
              },
            },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      });

      // Format conversations to show the "other participant"
      const formattedConversations = conversations.map((conv) => {
        // Determine who the "other participant" is
        const otherParticipant =
          conv.clientId === user.id ? conv.provider : conv.client;
        
        const lastMessage = conv.messages[0] || null;

        return {
          id: conv.id,
          clientId: conv.clientId,
          providerId: conv.providerId,
          participant: otherParticipant, // For backward compatibility
          otherParticipant, // Better naming
          lastMessage,
          unreadCount: conv._count.messages,
          lastMessageAt: conv.lastMessageAt,
          createdAt: conv.createdAt,
        };
      });

      return NextResponse.json({
        success: true,
        data: formattedConversations,
        conversations: formattedConversations, // For backward compatibility
        total: conversations.length,
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