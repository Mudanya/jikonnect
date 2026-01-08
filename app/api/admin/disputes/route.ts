import { withRole } from '@/lib/api-auth';
import { DisputeStatus } from '@/lib/generated/prisma/enums';
import logger from '@/lib/logger';
import { getAllDisputes } from '@/services/queries/admin.query';
import { AuthenticatedRequest } from '@/types/auth';
import { NextResponse } from 'next/server';



export const GET = withRole("ADMIN", "SUPER_ADMIN")(async (req: AuthenticatedRequest) => {
    try {


        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') ;

        const disputes = await getAllDisputes(status as DisputeStatus)

        return NextResponse.json({
            success: true,
            disputes: disputes.map(dispute => ({
                id: dispute.id,
                booking: dispute.booking,
                user: dispute.user,
                reason: dispute.reason,
                status: dispute.status,
                resolution: dispute.resolution,
                createdAt: dispute.createdAt,
                messages: dispute.messages
            }))
        });

    } catch (error) {
        logger.error((error as Error).message)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch disputes' },
            { status: 500 }
        );
    }
})
