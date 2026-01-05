import { withAuth } from "@/lib/api-auth"
import { getSettingsByKey } from "@/services/queries/admin.query";
import { AuthenticatedRequest } from "@/types/auth"
import { NextResponse } from "next/server";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const platformDetails = await getSettingsByKey('platform')
        const paymentDetails = await getSettingsByKey('payments')
        return NextResponse.json({
            success: true, data: {
                commission: platformDetails?.commissionRate,
                isMpesaEnabled: paymentDetails?.mpesaEnabled
            }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "An error occurred" },
            { status: 500 }
        );
    }
})