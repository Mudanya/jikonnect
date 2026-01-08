import { prisma } from "@/prisma/prisma.init";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = req.headers.get("x-user-role");
    const {id } = await params
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json({
        success: false,
        message: "Unauthorized"
      }, { status: 403 });
    }

    await prisma.service.delete({
      where: { id}
    });

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully"
    });

  } catch (error: any) {
    console.error("Error deleting category:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        message: "Service not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      message: "Failed to delete category"
    }, { status: 500 });
  }
}