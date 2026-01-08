import logger from "@/lib/logger";
import { getProviderCount, getUserProfiles } from "@/services/queries/provider.query";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
     const { searchParams } = new URL(req.url);
        
        // Filters
        const category = searchParams.get('category');
        const location = searchParams.get('location');
        const minRate = searchParams.get('minRate');
        const maxRate = searchParams.get('maxRate');
        const minRating = searchParams.get('minRating');
        
        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        
        logger.info(`Search params - category: ${category}, location: ${location}, minRate: ${minRate}, maxRate: ${maxRate}, minRating: ${minRating}, page: ${page}, limit: ${limit}`);
        
        const filters = { category, location, minRate, maxRate, minRating };
        
        // Get total count for pagination
        const total = await getProviderCount(filters);
        
        // Get paginated profiles
        const profiles = await getUserProfiles({ 
            ...filters,
            page,
            limit 
        });
        
        return NextResponse.json({ 
            success: true, 
            data: {
                providers: profiles,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (err) {
        logger.error((err as Error).message)
        return NextResponse.json(
            { success: false, message: 'Failed to search provders' }, { status: 500 }
        )
    }

}