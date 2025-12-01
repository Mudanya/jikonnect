import { withRole } from "@/lib/api-auth";
import logger from "@/lib/logger";
import { getAllPendingProfiles } from "@/services/queries/admin.query";
import { AuthenticatedRequest } from "@/types/auth";
import { NextResponse } from "next/server";

// TODO: use withRole:Admin
export const GET = withRole("ADMIN")(async (req: AuthenticatedRequest) => {
    try {
        const profiles = await getAllPendingProfiles()
        return NextResponse.json({
            success: true,
            data: profiles
        });
    }
    catch (err) {
        logger.error((err as Error).message)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch verifications' },
            { status: 500 }
        );
    }
})