import logger from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from '@/lib/jwt';
import { deletePortfolio, getUserProfileById } from "@/services/queries/provider.query";
export const DELETE = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);

        const user = verifyAccessToken(token);

        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }
        await deletePortfolio((await params).id)

        return NextResponse.json({
            success: true,
            message: 'Portfolio item deleted successfully'
        });

    } catch (err) {
        logger.error((err as Error).message)
        return NextResponse.json(
            { success: false, message: 'Failed to delete portfolio item' },
            { status: 500 }
        );
    }
}
export const GET = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);

        const user = verifyAccessToken(token);

        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }
        const profile = await getUserProfileById((await params).id)

        return NextResponse.json({
            success: true,
            data: profile
        });

    } catch (err) {
        logger.error((err as Error).message)
        return NextResponse.json(
            { success: false, message: 'Failed to delete portfolio item' },
            { status: 500 }
        );
    }
}