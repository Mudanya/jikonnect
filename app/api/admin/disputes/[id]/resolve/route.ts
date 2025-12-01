import { verifyAccessToken } from '@/lib/jwt';
import logger from '@/lib/logger';
import { getDisputeById, updateDisputeResolution } from '@/services/queries/admin.query';
import { createAuditLog } from '@/services/queries/auth.query';
import { NextRequest, NextResponse } from 'next/server';


// POST /api/admin/disputes/[id]/resolve
export const POST = async (
    req: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
 const {id} = await params
        const token = authHeader.substring(7);

        const user = verifyAccessToken(token);

        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }


        const { resolution, notes } = await req.json();

        if (!resolution || !notes) {
            return NextResponse.json(
                { success: false, error: 'Resolution type and notes are required' },
                { status: 400 }
            );
        }

        const disputeId = id;

        // Get dispute details
        const dispute = await getDisputeById(disputeId)

        if (!dispute) {
            return NextResponse.json(
                { success: false, error: 'Dispute not found' },
                { status: 404 }
            );
        }

        // Update dispute
        await updateDisputeResolution(disputeId, resolution, notes, user.userId)

        // Handle resolution actions based on type
        if (resolution === 'CLIENT_FAVOR') {
            // Refund client, penalize provider rating
            // TODO: Process refund
            // TODO: Update provider rating
        } else if (resolution === 'PROVIDER_FAVOR') {
            // Keep payment with provider, update client note
            // TODO: Update client record
        } else if (resolution === 'MUTUAL') {
            // Partial refund or other agreed resolution
            // TODO: Process agreed terms
        }

        // Create audit log
        await createAuditLog(req, user.userId, 'DISPUTE_RESOLVED', 'Dispute', { resolution, notes }, disputeId)

        // TODO: Send notification emails to both parties

        return NextResponse.json({
            success: true,
            message: 'Dispute resolved successfully'
        });

    } catch (error) {
        logger.error((error as Error).message)
        return NextResponse.json(
            { success: false, error: 'Failed to resolve dispute' },
            { status: 500 }
        );
    }
}