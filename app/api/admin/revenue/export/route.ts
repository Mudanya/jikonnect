import { withRole } from '@/lib/api-auth';
import logger from '@/lib/logger';
import { getBookingsForExport, getSettingsByKey } from '@/services/queries/admin.query';
import { createAuditLog } from '@/services/queries/auth.query';
import { AuthenticatedRequest } from '@/types/auth';
import { NextResponse } from 'next/server';


// GET /api/admin/revenue/export
export const GET = withRole("ADMIN", "SUPER_ADMIN")(async (req: AuthenticatedRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // Get all completed bookings in the date range
        const bookings = await getBookingsForExport(startDate)
        // Generate CSV
        const csvRows = [];

        // Header
        csvRows.push([
            'Booking ID',
            'Date',
            'Client Name',
            'Client Email',
            'Provider Name',
            'Service',
            'Amount (KES)',
            'Commission (KES)',
            'M-Pesa Receipt',
            'Status'
        ].join(','));

        // Data rows
        const platformDetails = await getSettingsByKey('platform')
        const commissionRate = platformDetails?.commissionRate || 0.10; 
        for (const booking of bookings) {
            const commission = +booking.amount * commissionRate;
            csvRows.push([
                booking.id,
                new Date(booking.createdAt).toLocaleDateString(),
                booking.client.firstName + " " + booking.client.lastName,
                booking.client.email,
                booking.provider.firstName + " " + booking.provider.firstName,
                booking.provider.profile?.services[0],
                booking.amount.toFixed(2),
                commission.toFixed(2),
                booking.payment?.status || 'N/A',
                booking.status
            ].join(','));
        }

        const csv = csvRows.join('\n');

        // Create audit log
        await createAuditLog(req, req.user.userId, 'REVENUE_REPORT_EXPORTED', 'System', { days })

        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="revenue-report-${new Date().toISOString()}.csv"`
            }
        });

    } catch (error) {
        logger.error((error as Error).message)
        return NextResponse.json(
            { success: false, error: 'Failed to export report' },
            { status: 500 }
        );
    }
})