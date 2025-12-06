import { withAuth } from "@/lib/api-auth";
import { getProviderBookingsById, getUserByUserId } from "@/services/queries/provider.query";
import { AuthenticatedRequest } from "@/types/auth";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const user = await getUserByUserId(req.user.userId)

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }
        const booking = await getProviderBookingsById(user.id)
        return NextResponse.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Get availability error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch availability' },
            { status: 500 }
        );
    }
});
