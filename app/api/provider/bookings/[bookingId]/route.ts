// app/api/provider/bookings/[bookingId]/route.ts
import { withAuth } from '@/lib/api-auth';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/prisma/prisma.init';
import { AuthenticatedRequest } from '@/types/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get booking details (Provider only sees their own bookings)
export const GET = async (
    req: NextRequest,
    { params }: { params: Promise<{ bookingId: string }> }
) => {
    try {
        const { bookingId } = await params;
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);

        const user = verifyAccessToken(token);

        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }
        if (user.role !== 'PROFESSIONAL') {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }
        const providerId = user.userId;

        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                providerId  // Ensure provider can only see their own bookings
            },
            include: {
                client: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        avatar: true
                    }
                },
                payment: true,
                review: true,
                dispute: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                role: true
                            }
                        },
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
                            orderBy: {
                                createdAt: 'asc'
                            }
                        }
                    }
                }
            }
        });

        if (!booking) {
            return NextResponse.json(
                { success: false, message: 'Booking not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            booking
        });

    } catch (error: any) {
        console.error('Get booking error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};