import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/prisma/prisma.init";
import { deleteUser, suspendUser } from "@/services/queries/auth.query";
import { getUserByUserId } from "@/services/queries/provider.query";
import { NextRequest, NextResponse } from "next/server";


export const DELETE = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const authHeader = req.headers.get('authorization');
        const { id } = await params
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }


        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);

        if (!payload) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired token' },
                { status: 401 }
            );
        }


        if (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Insufficient permissions' },
                { status: 403 }
            );
        }
        const user = await getUserByUserId(id)

        if (!user) return NextResponse.json(
            { success: false, message: 'User not found!' },
            { status: 404 }
        );
        await deleteUser(user.id)
        return NextResponse.json(
            { success: true, message: `${user.firstName} deleted!` },
            { status: 200 }
        );

    } catch (err) {
        console.log(err)
        return NextResponse.json(
            { success: false, message: (err as Error).message || 'Something went wrong!' },
            { status: 500 })
    }
}
export const PATCH = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const authHeader = req.headers.get('authorization');
        const { id } = await params
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }


        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);

        if (!payload) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired token' },
                { status: 401 }
            );
        }


        if (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Insufficient permissions' },
                { status: 403 }
            );
        }
        const user = await getUserByUserId(id)

        if (!user) return NextResponse.json(
            { success: false, message: 'User not found!' },
            { status: 404 }
        );
        const body = await req.json()
        if (!body || !body?.action) return NextResponse.json(
            { success: false, message: 'action missing' },
            { status: 400 }
        );
        const action = body.action as 'suspend' | 'unsuspend' | 'makeAdmin'
        if (action === 'makeAdmin' && payload.role === 'SUPER_ADMIN') {
            await prisma.user.update({
                where: { id: user.id },
                data: { role: 'ADMIN' }
            })
            return NextResponse.json(
                { success: true, message: `${user.firstName} is now an Admin!` },
                { status: 200 }
            );
        }
        await suspendUser(user.id, action)
        return NextResponse.json(
            { success: true, message: `${user.firstName} suspended!` },
            { status: 200 }
        );

    } catch (err) {
        return NextResponse.json(
            { success: false, message: (err as Error).message || 'Something went wrong!' },
            { status: 500 })
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = req.headers.get('authorization');
        const { id } = await params
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }


        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);

        if (!payload) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired token' },
                { status: 401 }
            );
        }


        if (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Insufficient permissions' },
                { status: 403 }
            );
        }


        const user = await prisma.user.findUnique({
            where: { id},
            include: {
                profile: {include:{services:true}},
                reviews: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Calculate stats
        const bookings = await prisma.booking.findMany({
            where: {
                OR: [{ clientId: user.id }, { providerId: user.id }],
            },
        });

        const stats = {
            totalBookings: bookings.length,
            activeBookings: bookings.filter((b) =>
                ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(b.status)
            ).length,
            completedBookings: bookings.filter((b) => b.status === "COMPLETED")
                .length,
            cancelledBookings: bookings.filter((b) => b.status === "CANCELLED")
                .length,
            totalSpent:
                user.role === "CLIENT"
                    ? bookings
                        .filter((b) => b.clientId === user.id && b.status === "COMPLETED")
                        .reduce((sum, b) => sum + Number(b.amount || 0), 0)
                    : undefined,
            totalEarned:
                user.role === "PROFESSIONAL"
                    ? bookings
                        .filter(
                            (b) => b.providerId === user.id && b.status === "COMPLETED"
                        )
                        .reduce((sum, b) => sum + Number(b.amount || 0), 0)
                    : undefined,
        };

        // Format professional data
        const professional = user.role === "PROFESSIONAL"
            ? {
                businessName: user.firstName + ' ' + user.lastName,
                specializations: user.profile?.services.map((s) => s.name),
                experience: user.profile?.yearsOfExperience,
                rating: user?.reviews?.reduce((acc, r) => acc + r.rating, 0) / (user?.reviews.length || 1),
                completedBookings: stats.completedBookings,
                earnings: stats.totalEarned || 0,
            }
            : undefined;

        return NextResponse.json({
            user: {
                ...user,
                professional,
                stats,
            },
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
