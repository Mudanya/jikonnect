import { withRole } from "@/lib/api-auth";
import { prisma } from "@/prisma/prisma.init";
import { AuthenticatedRequest } from "@/types/auth";
import { NextResponse } from "next/server";

export const GET = withRole('ADMIN', 'SUPER_ADMIN')(async (eq: AuthenticatedRequest) => {
    try {

        const categories = await prisma.serviceCategory.findMany({
            orderBy: { order: 'asc' },
            include: {
                _count: {
                    select: { services: true }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: categories
        });

    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch categories"
        }, { status: 500 });
    }
})
export const POST = withRole('ADMIN', 'SUPER_ADMIN')(async (req: AuthenticatedRequest) => {
    try {
        const body = await req.json();
        const { name, slug, icon, description, order } = body;

        if (!name || !slug) {
            return NextResponse.json({
                success: false,
                message: "Name and slug are required"
            }, { status: 400 });
        }

        const category = await prisma.serviceCategory.create({
            data: {
                name,
                slug,
                icon,
                description,
                order: order || 0
            }
        });

        return NextResponse.json({
            success: true,
            message: "Category created successfully",
            data: category
        }, { status: 201 });

    } catch (error: any) {
        console.error("Error creating category:", error);

        if (error.code === 'P2002') {
            return NextResponse.json({
                success: false,
                message: "Category with this name or slug already exists"
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            message: "Failed to create category"
        }, { status: 500 });
    }
})