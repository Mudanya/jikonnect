import logger from '@/lib/logger';
import { completedBookings, geetProviderServices, getAllProviders, getAvgRatingResult, getRecentReviews, totalBookings, totalProviders, totalReviews, verifiedProviders } from '@/services/queries/client.query';
import { NextRequest, NextResponse } from 'next/server';


export const GET = async (request: NextRequest) => {
    try {


        // Calculate average rating
        const avgRatingResult = await getAvgRatingResult()


        const averageRating = avgRatingResult._avg.rating || 0;

        // Get top-rated providers with their services
        const topProviders = await getAllProviders()

        // Get recent reviews with booking and reviewer info
        const recentReviews = await getRecentReviews()

        // Get service categories with provider counts
        const allProviders = await geetProviderServices()

        // Count providers by category
        const categoryMap = new Map<string, number>();
        allProviders.forEach(provider => {
            provider.profile?.services.forEach(category => {
                categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
            });
        });

        const serviceCategories = Array.from(categoryMap.entries()).map(([name, count]) => ({
            name,
            count,
            description: getCategoryDescription(name)
        })).sort((a, b) => b.count - a.count);

        return NextResponse.json({
            success: true,
            data: {
                stats: {
                    totalProviders,
                    verifiedProviders,
                    totalBookings,
                    completedBookings,
                    totalReviews,
                    averageRating: Number(averageRating.toFixed(1))
                },
                topProviders: topProviders.map(p => ({
                    id: p.id,
                    title: p.services[0],
                    name: p.firstName + p.lastName,
                    avatar: p.avatar,
                    rating: p.rating,
                    location: p.location,
                    categories: p.services,
                    bio: p.bio
                })),
                recentReviews: recentReviews.map(r => ({
                    id: r.id,
                    rating: r.rating,
                    comment: r.comment,
                    createdAt: r.createdAt,
                    reviewerName: r.reviewer.firstName + " " + r.reviewer.lastName,
                    reviewerAvatar: r.reviewer.avatar,
                    providerTitle: r.reviewee.profile?.services[0],
                    providerLocation: r.reviewee.profile?.location,
                    serviceDate: r.booking.scheduledDate
                })),
                serviceCategories: serviceCategories.slice(0, 12) // Top 12 categories
            }
        });

    } catch (error) {
        logger.error('Failed to fetch landing page data: ' + (error as Error).message);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch landing page data' },
            { status: 500 }
        );
    }
}

// TODO pick from DB
function getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
        'PLUMBING': 'Professional plumbing services',
        'ELECTRICAL': 'Licensed electrical work',
        'CARPENTRY': 'Expert carpentry & woodwork',
        'PAINTING': 'Professional painting services',
        'CLEANING': 'Home & office cleaning',
        'GARDENING': 'Garden maintenance & landscaping',
        'SECURITY': 'Security guard services',
        'BABYSITTING': 'Trusted childcare services',
        'NURSING': 'Professional nursing care',
        'ELDERLY_CARE': 'Compassionate elderly care',
        'HOME_CARE': 'Comprehensive home care',
        'DECOR': 'Interior design & decoration',
        'MOVING': 'Moving & relocation services',
        'CATERING': 'Catering services',
        'EVENT_PLANNING': 'Event planning & management',
        'TUTORING': 'Educational tutoring',
        'FITNESS': 'Personal training & fitness',
        'BEAUTY': 'Beauty & wellness services',
        'TAILORING': 'Tailoring & alterations',
        'LAUNDRY': 'Laundry & dry cleaning'
    };

    return descriptions[category] || 'Professional services';
}