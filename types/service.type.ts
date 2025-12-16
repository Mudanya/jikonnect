export type serviceSearchParams = {
    location?: string | null
    category?: string | null
    minRate?: string | null
    maxRate?: string | null
    minRating?: string | null
}

export type BookingStatus =
    'PENDING' |
    'CONFIRMED' |
    'IN_PROGRESS' |
    'COMPLETED' |
    'CANCELLED' |
    'DISPUTED'


export interface LandingPageData {
    stats: {
        totalProviders: number;
        verifiedProviders: number;
        totalBookings: number;
        completedBookings: number;
        totalReviews: number;
        averageRating: number;
    };
    topProviders: Array<{
        id: string;
        title: string;
        name: string;
        avatar: string | null;
        rating: number;
        location: string;
        categories: string[];
        bio: string | null;
    }>;
    recentReviews: Array<{
        id: string;
        rating: number;
        comment: string;
        createdAt: string;
        reviewerName: string;
        reviewerAvatar: string | null;
        providerTitle: string;
        providerLocation: string;
        serviceDate: string;
    }>;
    serviceCategories: Array<{
        name: string;
        count?: number;
        description: string;
        category: { icon: string }
    }>;
    platform?: {
        phone: string,
        email: string,
        name: string
    }
}