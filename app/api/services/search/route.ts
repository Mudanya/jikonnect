import logger from "@/lib/logger";
import { getUserProfiles } from "@/services/queries/provider.query";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url)
        const category = searchParams.get('category')
        const location = searchParams.get('location')
        const minRate = searchParams.get('minRate');
        const maxRate = searchParams.get('maxRate');
        const minRating = searchParams.get('minRating');
        logger.info(`Search params - category: ${category}, location: ${location}, minRate: ${minRate}, maxRate: ${maxRate}, minRating: ${minRating}`);
        const profiles = await getUserProfiles({ category, location, minRate, maxRate, minRating })
        return NextResponse.json({ success: true, data: profiles })
    }
    catch (err) {
        logger.error((err as Error).message)
        return NextResponse.json(
            { success: false, message: 'Failed to search provders' }, { status: 500 }
        )
    }

}