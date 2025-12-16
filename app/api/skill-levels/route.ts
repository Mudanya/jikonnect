// app/api/skill-levels/route.ts
import { prisma } from "@/prisma/prisma.init";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    try {
        const skillLevels = await prisma.service.findMany({
            // orderBy: { order: 'asc' },
            select:{skillLevels:true}
        });

        return NextResponse.json({
            success: true,
            data: skillLevels
        });

    } catch (error) {
        console.error("Error fetching skill levels:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch skill levels"
            },
            { status: 500 }
        );
    }
}