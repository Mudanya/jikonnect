import { withRole } from '@/lib/api-auth';
import { getAllSettings, getDefaultSettings, getSysConfigs, updateSettings } from '@/services/queries/admin.query';
import { createAuditLog } from '@/services/queries/auth.query';
import { Configs } from '@/types/admni.type';
import { AuthenticatedRequest } from '@/types/auth';
import { NextRequest, NextResponse } from 'next/server';


// GET /api/admin/config
export const GET = withRole("ADMIN")(async (req: AuthenticatedRequest) => {
    try {

        const config = await getAllSettings();

        // If no settings exist, return defaults
        if (Object.keys(config).length === 0) {
            const defaults = getDefaultSettings();
            return NextResponse.json({
                success: true,
                config: defaults
            });
        }

        return NextResponse.json({
            success: true,
            config
        });

    } catch (error) {
        console.error('Failed to fetch config:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch configuration' },
            { status: 500 }
        );
    }
})


export const PUT = withRole("ADMIN")(async (req: AuthenticatedRequest) => {
    try {

        const configData: Configs = await req.json();

        // Validate configuration data
        if (!configData.platform && !configData.payments && !configData.notifications && !configData.security) {
            return NextResponse.json(
                { success: false, error: 'Invalid configuration data' },
                { status: 400 }
            );
        }

        // Upsert system configuration
        await updateSettings(configData);

        createAuditLog(req, req.user.userId, 'SYSTEM_CONFIG_UPDATED', 'System', configData)

        return NextResponse.json({
            success: true,
            message: 'Configuration updated successfully'
        });

    } catch (error) {
        console.error('Failed to update config:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update configuration' },
            { status: 500 }
        );
    }
})