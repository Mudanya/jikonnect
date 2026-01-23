import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/prisma/prisma.init';
import { AuthenticatedRequest } from '@/types/auth';
import { NextResponse } from 'next/server';

// GET - User gets their conversation with admin
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = req.user.userId;

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const userType = user.role === 'PROFESSIONAL' ? 'PROVIDER' : 'CLIENT';

    // Find any admin conversation with this user
    let conversation = await prisma.adminConversation.findFirst({
      where: {
        userId,
        userType
      },
      include: {
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Create conversation if doesn't exist (with any admin)
    if (!conversation) {
      // Get first admin user
      const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      });

      if (!admin) {
        return NextResponse.json(
          { success: false, message: 'No admin available' },
          { status: 404 }
        );
      }

      conversation = await prisma.adminConversation.create({
        data: {
          adminId: admin.id,
          userId,
          userType
        },
        include: {
          messages: {
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  role: true
                }
              }
            }
          },
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      });
    }

    // Mark messages as read by user
    await prisma.adminMessage.updateMany({
      where: {
        conversationId: conversation.id,
        senderType: 'ADMIN',
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      conversation
    });

  } catch (error: any) {
    console.error('Get user-admin conversation error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
});

// POST - User sends message to admin
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = req.user.userId;
    const { message, attachments = [] } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        firstName: true,
        lastName: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const userType = user.role === 'PROFESSIONAL' ? 'PROVIDER' : 'CLIENT';
    const senderType = userType; // CLIENT or PROVIDER

    // Find conversation with admin
    let conversation = await prisma.adminConversation.findFirst({
      where: {
        userId,
        userType
      }
    });

    // Create conversation if doesn't exist
    if (!conversation) {
      // Get first admin
      const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      });

      if (!admin) {
        return NextResponse.json(
          { success: false, message: 'No admin available' },
          { status: 404 }
        );
      }

      conversation = await prisma.adminConversation.create({
        data: {
          adminId: admin.id,
          userId,
          userType
        }
      });
    }

    // Create message
    const userMessage = await prisma.adminMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        senderType,
        content: message.trim(),
        attachments
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    // Update conversation lastMessageAt
    await prisma.adminConversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() }
    });


    return NextResponse.json({
      success: true,
      message: userMessage
    });

  } catch (error: any) {
    console.error('Send user message to admin error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
});