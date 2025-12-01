import { withAuth } from "@/lib/api-auth";
import { getUserProfileById, updateProfileAvailability } from "@/services/queries/provider.query";
import { AuthenticatedRequest } from "@/types/auth";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const profile = await getUserProfileById(req.user.userId)

        if (!profile) {
            return NextResponse.json(
                { success: false, message: 'Profile not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: profile.availability || {}
        });
    } catch (error) {
        console.error('Get availability error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch availability' },
            { status: 500 }
        );
    }
});

export const PUT = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const body = await req.json();
        const { availability } = body;

        const profile = await updateProfileAvailability(req.user.userId, availability)

        return NextResponse.json({
            success: true,
            message: 'Availability updated successfully',
            data: profile.availability
        });
    } catch (error) {
        console.error('Update availability error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update availability' },
            { status: 500 }
        );
    }
});

