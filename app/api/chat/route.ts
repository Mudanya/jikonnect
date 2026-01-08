
import { NextRequest, NextResponse } from 'next/server';


import { prisma } from '@/prisma/prisma.init';
import { withAuth } from '@/lib/api-auth';
import { AuthenticatedRequest } from '@/types/auth';
import { MessageFilter } from '@/lib/chat/messageFilter';

export const POST = withAuth( async (req: AuthenticatedRequest) =>{
  try {
    

    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { message, recipientId, conversationId } = await req.json();

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

    // Filter the message for prohibited content
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

    // Save message to database
    // const chatMessage = await prisma.message.create({
    //   data: {
    //     content: message,
    //     senderId: user.id,
    //     recipientId,
    //     conversationId,
    //   },
    //   include: {
    //     sender: {
    //       select: {
    //         id: true,
    //         name: true,
    //         image: true,
    //       },
    //     },
    //   },
    // });

    // Send real-time message via Pusher
    // if (conversationId) {
    //   await pusherServer.trigger(`chat-${conversationId}`, 'new-message', {
    //     id: chatMessage.id,
    //     content: chatMessage.content,
    //     senderId: chatMessage.senderId,
    //     sender: chatMessage.sender,
    //     createdAt: chatMessage.createdAt,
    //   });
    // }

    return NextResponse.json({
      success: true,
    //   message: chatMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
)
















