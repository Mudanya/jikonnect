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