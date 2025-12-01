import { withAuth } from "@/lib/api-auth";
import logger from "@/lib/logger";
import { findUserWithPortfolio } from "@/services/queries/provider.query";
import { AuthenticatedRequest } from "@/types/auth";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const user = await findUserWithPortfolio(req.user.userId)
        if (!user || user.role !== 'PROFESSIONAL') {
            return NextResponse.json(
                { success: false, message: 'Only professionals can access onboarding' },
                { status: 403 }
            );
        }

        const steps = {
            profileCreated: !!user.profile,
            servicesAdded: (user.profile?.services?.length || 0) > 0,
            ratesSet: !!user.profile?.hourlyRate,
            bioAdded: !!user.profile?.bio,
            portfolioAdded: (user.profile?.portfolio?.length || 0) > 0,
            documentsUploaded: !!user.profile?.idDocument,
            verificationSubmitted: user.profile?.verificationStatus !== 'PENDING' || !!user.profile?.idNumber,
            availabilitySet: !!user.profile?.availability
        };

        const totalSteps = Object.keys(steps).length;
        const completedSteps = Object.values(steps).filter(Boolean).length;
        const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
        return NextResponse.json({
            success: true,
            data: {
                user,
                onboardingStatus: {
                    steps,
                    completedSteps,
                    totalSteps,
                    completionPercentage,
                    isComplete: completionPercentage === 100
                }
            }
        });
    }
    catch (err) {
        logger.error((err as Error).message)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch onboarding status' },
            { status: 500 }
        );
    }
})