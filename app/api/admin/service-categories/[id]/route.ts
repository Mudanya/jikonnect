// app/api/admin/service-categories/[id]/route.ts
import { prisma } from "@/prisma/prisma.init";
import { NextRequest, NextResponse } from "next/server";


// PATCH - Update category
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = req.headers.get("x-user-role");

    if (role !== "ADMIN") {
      return NextResponse.json({
        success: false,
        message: "Unauthorized"
      }, { status: 403 });
    }
    const {id} = await params
    const body = await req.json();
    const { name, slug, icon, description, order } = body;

    const category = await prisma.serviceCategory.update({
      where: { id},
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(icon !== undefined && { icon }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
      }
    });

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      data: category
    });

  } catch (error: any) {
    console.error("Error updating category:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        message: "Category not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      message: "Failed to update category"
    }, { status: 500 });
  }
}

// DELETE - Delete category
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = req.headers.get("x-user-role");
    const {id } = await params
    if (role !== "ADMIN") {
      return NextResponse.json({
        success: false,
        message: "Unauthorized"
      }, { status: 403 });
    }

    await prisma.serviceCategory.delete({
      where: { id}
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully"
    });

  } catch (error: any) {
    console.error("Error deleting category:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        message: "Category not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      message: "Failed to delete category"
    }, { status: 500 });
  }
}