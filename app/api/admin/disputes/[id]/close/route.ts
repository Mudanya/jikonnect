import { verifyAccessToken } from '@/lib/jwt';
import logger from '@/lib/logger';
import { closeDispute } from '@/services/queries/admin.query';
import { createAuditLog } from '@/services/queries/auth.query';
import { NextRequest, NextResponse } from 'next/server';



export const POST = async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const authHeader = req.headers.get('authorization');
         const {id} = await params
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

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


        const disputeId = id;

        // Update dispute status
        await closeDispute(disputeId, user.userId)
        // Create audit log

        await createAuditLog(req, user.userId, 'DISPUTE_CLOSED', 'Dispute', {}, disputeId)
        return NextResponse.json({
            success: true,
            message: 'Dispute closed'
        });

    } catch (error) {
        logger.error((error as Error).message)
        return NextResponse.json(
            { success: false, error: 'Failed to close dispute' },
            { status: 500 }
        );
    }
}