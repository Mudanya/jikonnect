// app/api/services/route.ts
import { prisma } from "@/prisma/prisma.init";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");

    if (categorySlug) {
      // Get services for a specific category
      const category = await prisma.serviceCategory.findUnique({
        where: { slug: categorySlug },
        include: {
          services: {
            orderBy: { name: 'asc' }
          }
        }
      });

      if (!category) {
        return NextResponse.json({
          success: false,
          message: "Category not found"
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: category
      });
    }

   
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        services: {
          orderBy: { name: 'asc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch services"
    }, { status: 500 });
  }
}