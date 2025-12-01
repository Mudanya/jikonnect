import { verifyAccessToken } from '@/lib/jwt';
import logger from '@/lib/logger';
import { updateDispute } from '@/services/queries/admin.query';
import { createAuditLog } from '@/services/queries/auth.query';
import { NextRequest, NextResponse } from 'next/server';


export const POST = async (
    req: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const { id } = await params
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

        const { message } = await req.json();

        if (!message || !message.trim()) {
            return NextResponse.json(
                { success: false, error: 'Message is required' },
                { status: 400 }
            );
        }

        const disputeId = id;



        // Update dispute status to IN_REVIEW if it was OPEN
        await updateDispute(disputeId)

        // Create audit log
        await createAuditLog(req, user.userId, 'DISPUTE_MESSAGE_SENT', 'Dispute', {}, disputeId)
        // TODO: Send notification to both parties

        return NextResponse.json({
            success: true,
            message: 'Message sent successfully'
        });

    } catch (error) {
        logger.error((error as Error).message)
        return NextResponse.json(
            { success: false, error: 'Failed to send message' },
            { status: 500 }
        );
    }
}