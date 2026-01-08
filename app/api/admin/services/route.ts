import { withRole } from "@/lib/api-auth";
import { prisma } from "@/prisma/prisma.init";
import { AuthenticatedRequest } from "@/types/auth";
import { NextResponse } from "next/server";


export const GET = withRole("ADMIN", "SUPER_ADMIN")(async (req: AuthenticatedRequest) => {
    try {

        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get("categoryId");

        const services = await prisma.service.findMany({
            where: categoryId ? { categoryId } : undefined,
            include: {
                category: true,
                _count: {
                    select: { profiles: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({
            success: true,
            data: services
        });

    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch services"
        }, { status: 500 });
    }
})


export const POST = withRole("ADMIN", "SUPER_ADMIN")(async (req: AuthenticatedRequest) => {
    try {
        const role = req.headers.get("x-user-role");

        if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 403 });
        }

        const body = await req.json();
        const { name, slug, categoryId, description, skillLevels } = body;

        if (!name || !slug || !categoryId) {
            return NextResponse.json({
                success: false,
                message: "Name, slug, and category are required"
            }, { status: 400 });
        }

        const service = await prisma.service.create({
            data: {
                name,
                slug,
                categoryId,
                description,
                skillLevels: skillLevels || []
            },
            include: {
                category: true
            }
        });

        return NextResponse.json({
            success: true,
            message: "Service created successfully",
            data: service
        }, { status: 201 });

    } catch (error: any) {
        console.error("Error creating service:", error);

        if (error.code === 'P2002') {
            return NextResponse.json({
                success: false,
                message: "Service with this slug already exists"
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            message: "Failed to create service"
        }, { status: 500 });
    }
})