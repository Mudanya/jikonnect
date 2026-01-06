import logger from "@/lib/logger";
import { getProviderServices } from "@/services/queries/client.query";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
    try {
        const allProviders = await getProviderServices()
        return NextResponse.json({ success: true, data: allProviders.map(provider => provider?.profile?.services || []).flat().slice(0, 8), });
    }
    catch (err) {
        logger.error((err as Error).message)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch top services' }, { status: 500 }
        )
    }
}