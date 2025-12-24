// app/api/cron/booking-reminders/route.ts
import { NotificationService } from '@/lib/notifications/notificationService';
import { prisma } from '@/prisma/prisma.init';
import { addHours, isSameDay, parseISO } from 'date-fns';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const tomorrow = addHours(now, 24);

    // Find bookings happening in next 24 hours
    const upcomingBookings = await prisma.booking.findMany({
        where: {
            status: 'CONFIRMED',
            scheduledDate: {
                gte: now,
                lte: tomorrow
            }
        },
        include: {
            client: true,
            provider: true,
        }
    });

    // Send reminders
    await Promise.all(
        upcomingBookings.map(async (booking) => {
            // Remind client
            await NotificationService.create({
                userId: booking.clientId,
                type: 'INFO',
                priority: 'HIGH',
                title: 'Upcoming Booking Reminder',
                message: `Your booking with ${booking.provider.firstName} for ${booking.service} is tomorrow at ${booking.scheduledTime }.`,
                actionUrl: `/bookings/${booking.id}`
            });

            // Remind provider
            await NotificationService.create({
                userId: booking.providerId,
                type: 'INFO',
                priority: 'HIGH',
                title: 'Upcoming Booking Reminder',
                message: `You have a booking with ${booking.client.firstName} tomorrow at ${booking.scheduledTime}.`,
                actionUrl: `/bookings/${booking.id}`
            });
        })
    );

    return NextResponse.json({
        success: true,
        reminders: upcomingBookings.length
    });
}