import { withRole } from '@/lib/api-auth';
import logger from '@/lib/logger';
import { getAuditLogs } from '@/services/queries/admin.query';
import { AuthenticatedRequest } from '@/types/auth';
import { NextResponse } from 'next/server';

export const GET = withRole("ADMIN", "SUPER_ADMIN")(async (req: AuthenticatedRequest) => {
    try {

        const logs = await getAuditLogs();

        return NextResponse.json({
            success: true,
            logs: logs.map(log => ({
                id: log.id,
                timestamp: log.createdAt,
                actor: log.user,
                action: log.action,
                category: log.entity,
                details: log.details,
                ipAddress: log.ipAddress,
                userAgent: log.userAgent,
            }))
        });

    } catch (error) {
        logger.error((error as Error).message)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch audit logs' },
            { status: 500 }
        );
    }
})