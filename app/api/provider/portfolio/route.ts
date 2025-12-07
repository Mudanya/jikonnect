import { withAuth } from "@/lib/api-auth";
import logger from "@/lib/logger";
import { createPortfolio, findProfileWithPortfolio, getUserProfileById } from "@/services/queries/provider.query";
import { AuthenticatedRequest } from "@/types/auth";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { join } from "path";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const profile = await findProfileWithPortfolio(req.user.userId);
        if (!profile) {
            return NextResponse.json(
                { success: false, message: 'Profile not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: profile.portfolios
        });
    }
    catch (err) {
        logger.error((err as Error).message)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch portfolio' },
            { status: 500 }
        );
    }
})

export const POST = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const formData = await req.formData()
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const category = formData.get('category') as string;
        const files = formData.getAll('images') as File[];

        if (!title || !category) {
            return NextResponse.json(
                { success: false, message: 'Title and category are required' },
                { status: 400 }
            );
        }
        const profile = await getUserProfileById(req.user.userId);
        if (!profile) {
            return NextResponse.json(
                { success: false, message: 'Profile not found' },
                { status: 404 }
            );
        }
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'portfolio');
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        const imageUrls: string[] = [];
        for (const file of files) {
            if (file.size > 0) {
                const timestamp = Date.now();
                const extension = file.name.split('.').pop();
                const filename = `${req.user.userId}_${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`;
                const filepath = join(uploadsDir, filename);

                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                await writeFile(filepath, buffer);

                imageUrls.push(`/uploads/portfolio/${filename}`);
            }
        }
        const portfolioItem = await createPortfolio(profile.id, title, description, category, imageUrls)
        
        return NextResponse.json({
            success: true,
            message: 'Portfolio item added successfully',
            data: portfolioItem
        });

    }
    catch (err) {
        logger.error((err as Error).message)
        return NextResponse.json(
            { success: false, message: 'Failed to add portfolio item' },
            { status: 500 }
        );
    }
})