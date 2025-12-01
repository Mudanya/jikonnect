export const searchService = async (queryParams: URLSearchParams) => {
    const response = await fetch(`/api/services/search?${queryParams}`);
    return await response.json();
}

export const fetchBookings = async (token: string) => {
    const response = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
}

export const updateBooking = async (
    { token, status, reason, bookingId }:
        { token: string, status: 'CANCELLED', reason: string, bookingId: string }) => {
    const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status,
            cancellationReason: reason
        })
    });

    return await response.json();
}

export const submitReview = async (token: string, bookingId: string, reviewForm: {
    rating: number,
    comment?: string
}) => {
    const response = await fetch(`/api/bookings/${bookingId}/review`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewForm)
    });

    return await response.json();
}