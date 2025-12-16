// app/api/professional/services/route.ts
import { withRole } from "@/lib/api-auth";
import { prisma } from "@/prisma/prisma.init";
import { AuthenticatedRequest } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";


// GET - Get professional's services
export const GET = withRole("PROFESSIONAL")(async(req: AuthenticatedRequest)=> {
  try {
    const userId = req.headers.get("x-user-id");
  

     const professional = await prisma.profile.findUnique({
      where: { userId: userId! },
      include: {
        services: {
          include: {
            category: true
          },
          orderBy: {
            name: 'asc'
          }
        }
      }
    });

    if (!professional) {
      return NextResponse.json({
        success: false,
        message: "Professional profile not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: professional.services
    });

  } catch (error) {
    console.error("Error fetching professional services:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch services"
    }, { status: 500 });
  }
})

// POST - Add service to professional profile
export const POST = withRole("PROFESSIONAL")(async(req: AuthenticatedRequest)=> {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (role !== "PROFESSIONAL") {
      return NextResponse.json({
        success: false,
        message: "Unauthorized - Professional access only"
      }, { status: 403 });
    }

    const body = await req.json();
    const { serviceIds } = body; // Can be single ID or array of IDs

    if (!serviceIds || (Array.isArray(serviceIds) && serviceIds.length === 0)) {
      return NextResponse.json({
        success: false,
        message: "Service ID(s) required"
      }, { status: 400 });
    }

    const professional = await prisma.user.findUnique({
      where: { id: userId! }
    });

    if (!professional) {
      return NextResponse.json({
        success: false,
        message: "Professional profile not found"
      }, { status: 404 });
    }

    // Connect services to professional
    const ids = Array.isArray(serviceIds) ? serviceIds : [serviceIds];
    
    const updated = await prisma.profile.update({
      where: { userId: professional.id },
      data: {
        services: {
          connect: ids.map(id => ({ id }))
        }
      },
      include: {
        services: {
          include: {
            category: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `${ids.length} service(s) added successfully`,
      data: updated.services
    });

  } catch (error: any) {
    console.error("Error adding services:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        message: "One or more services not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      message: "Failed to add services"
    }, { status: 500 });
  }
})

// DELETE - Remove service from professional profile
export const DELETE = withRole("PROFESSIONAL")(async(req: AuthenticatedRequest)=> {
  try {
    const userId = req.headers.get("x-user-id");
    

    const body = await req.json();
    const { serviceId } = body;
    console.log('serviceId',serviceId)

    if (!serviceId) {
      return NextResponse.json({
        success: false,
        message: "Service ID required"
      }, { status: 400 });
    }

    const professional = await prisma.user.findUnique({
      where: { id: userId! }
    });

    if (!professional) {
      return NextResponse.json({
        success: false,
        message: "Professional profile not found"
      }, { status: 404 });
    }

    await prisma.profile.update({
      where: { userId: professional.id },
      data: {
        services: {
          disconnect: { id: serviceId }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Service removed successfully"
    });

  } catch (error) {
    console.error("Error removing service:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to remove service"
    }, { status: 500 });
  }
})