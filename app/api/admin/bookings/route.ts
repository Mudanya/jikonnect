import { withRole } from "@/lib/api-auth";
import logger from "@/lib/logger";
import { getAllBokings } from "@/services/queries/admin.query";
import { AuthenticatedRequest } from "@/types/auth";
import { NextResponse } from "next/server";

export const GET = withRole("ADMIN")(async (req: AuthenticatedRequest) => {
    try {
        const bookings = await getAllBokings()
        return NextResponse.json({
            success: true,
            bookings: bookings.map(booking => ({
                id: booking.id,
                client: booking.client,
                provider: {
                    id: booking.provider.id,
                    name: booking.provider.firstName + " " + booking.provider.lastName,
                    avatar: booking.provider.avatar
                },
                status: booking.status,
                // scheduledFor: booking., //TODO : include sheduledFor
                amount: booking.amount,
                createdAt: booking.createdAt,
                mpesaReceipt: booking.status
            }))
        })
    }
    catch (err) {
        logger.error((err as Error).message)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch bookings' },
            { status: 500 }
        );
    }
})