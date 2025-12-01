import logger from "@/lib/logger";
import { getProviderbyId, getProviderCompletedJobs, getReviewsByid } from "@/services/queries/provider.query";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const { id } = await params
        const profile = await getProviderbyId(id)
        if (!profile) {
            return NextResponse.json(
                { success: false, message: 'Provider not found' },
                { status: 404 }
            );
        }
        const reviews = await getReviewsByid(id)
        const completedJobs = await getProviderCompletedJobs(id)
        return NextResponse.json({
            success: true,
            data: {
                profile,
                reviews,
                completedJobs
            }
        });
    }
    catch (err) {
        logger.error((err as Error).message)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch provider details' },    
            { status: 500 })
    }
}