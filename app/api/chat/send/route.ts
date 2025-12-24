import { NextResponse } from 'next/server';
import { MessageFilter } from '@/lib/chat/messageFilter';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/prisma/prisma.init';
import { AuthenticatedRequest } from '@/types/auth';

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: request.user.email },
      select: { id: true, role: true }, // Added role for client/provider logic
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { message, recipientId } = await request.json();

    if (!message || !recipientId) {
      return NextResponse.json(
        { error: 'Message and recipient are required' },
        { status: 400 }
      );
    }

    // Check if user is suspended
    const isSuspended = await MessageFilter.isUserSuspended(user.id);
    if (isSuspended) {
      return NextResponse.json(
        {
          error: 'Your account is suspended',
          blocked: true,
          reason: 'Account suspended due to policy violations',
        },
        { status: 403 }
      );
    }

    // 🛡️ FILTER MESSAGE FOR PROHIBITED CONTENT
    const filterResult = await MessageFilter.filterMessage(message, user.id);
    if (!filterResult.allowed) {
      return NextResponse.json(
        {
          error: 'Message blocked',
          blocked: true,
          reason: filterResult.reason,
          detectedPatterns: filterResult.detectedPatterns,
          strikeNumber: filterResult.strikeNumber,
        },
        { status: 400 }
      );
    }

    // Get recipient to determine their role
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, role: true },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Determine clientId and providerId based on roles
    let clientId: string;
    let providerId: string;

    if (user.role === 'CLIENT' && recipient.role === 'PROFESSIONAL') {
      // User is client messaging provider
      clientId = user.id;
      providerId = recipientId;
    } else if (user.role === 'PROFESSIONAL' && recipient.role === 'CLIENT') {
      // User is provider messaging client
      clientId = recipientId;
      providerId = user.id;
    } else {
      // Both have same role or edge cases (ADMIN, etc)
      // Use alphabetical order for consistency
      [clientId, providerId] = [user.id, recipientId].sort();
    }

    // Find or create conversation using clientId/providerId
    let conversation = await prisma.conversation.findFirst({
      where: {
        clientId,
        providerId,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          clientId,
          providerId,
        },
      });
    }

    // Create message (NO recipientId field in new schema)
    const chatMessage = await prisma.message.create({
      data: {
        content: message,
        senderId: user.id,
        recipientId: recipient.id,
        conversationId: conversation.id,
        status: 'SENT',
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true, // Changed from 'name'
            lastName: true,  // New field
            avatar: true,    // Changed from 'image'
            role: true,      // Added role
          },
        },
      },
    });

    // Update conversation's lastMessage and lastMessageAt
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: message,      // Cache message content
        lastMessageAt: new Date(),
      },
    });

   

    return NextResponse.json({
      success: true,
      message: chatMessage,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message', details: (error as Error).message },
      { status: 500 }
    );
  }
});