// app/bookings/page.tsx - Client Bookings Dashboard
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, DollarSign, User, Star, X, CheckCircle, AlertCircle, MessageCircle, Phone } from 'lucide-react';

export default function ClientBookingsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });

  const statusFilters = [
    { value: 'all', label: 'All', color: 'gray' },
    { value: 'PENDING', label: 'Pending', color: 'yellow' },
    { value: 'CONFIRMED', label: 'Confirmed', color: 'blue' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'purple' },
    { value: 'COMPLETED', label: 'Completed', color: 'green' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'red' }
  ];

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
    //   router.push('/login');
    } else {
      loadBookings();
    }
  }, [isAuthenticated]);

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'CANCELLED',
          cancellationReason: 'Cancelled by client'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Booking cancelled successfully');
        loadBookings();
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedBooking) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/bookings/${selectedBooking.id}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewForm)
      });

      const data = await response.json();
      if (data.success) {
        alert('Review submitted successfully!');
        setShowReviewModal(false);
        setReviewForm({ rating: 5, comment: '' });
        loadBookings();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const filteredBookings = selectedStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === selectedStatus);

//   if (!mounted || loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <button
              onClick={() => router.push('/services')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              + New Booking
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Status Filters */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {statusFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedStatus === filter.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
                {filter.value !== 'all' && (
                  <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                    {bookings.filter(b => b.status === filter.value).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {booking.provider.firstName[0]}{booking.provider.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-lg">
                          {booking.provider.firstName} {booking.provider.lastName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{booking.service}</p>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar size={16} className="mr-2" />
                          {new Date(booking.scheduledDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock size={16} className="mr-2" />
                          {booking.scheduledTime} ({booking.duration}h)
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin size={16} className="mr-2" />
                          {booking.location}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign size={16} className="mr-2" />
                          KES {Number(booking.amount).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      KES {Number(booking.amount).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Booking #{booking.bookingNumber}
                    </div>
                  </div>
                </div>

                {booking.description && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{booking.description}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-3">
                    {booking.provider.phone && (
                      <a
                        href={`tel:${booking.provider.phone}`}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                      >
                        <Phone size={16} />
                        <span className="text-sm font-medium">Call</span>
                      </a>
                    )}
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">
                      <MessageCircle size={16} />
                      <span className="text-sm font-medium">Message</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-3">
                    {booking.status === 'COMPLETED' && !booking.review && (
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowReviewModal(true);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition"
                      >
                        <Star size={16} />
                        <span className="text-sm font-medium">Write Review</span>
                      </button>
                    )}

                    {booking.status === 'COMPLETED' && booking.review && (
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Star size={16} className="fill-yellow-500" />
                        <span className="text-sm font-medium text-gray-700">Reviewed</span>
                      </div>
                    )}

                    {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
                      >
                        <X size={16} />
                        <span className="text-sm font-medium">Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedStatus === 'all' ? 'No bookings yet' : `No ${selectedStatus.toLowerCase()} bookings`}
            </h3>
            <p className="text-gray-600 mb-6">
              Start by booking a service from our verified professionals
            </p>
            <button
              onClick={() => router.push('/services')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Browse Services
            </button>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Write a Review</h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewForm({ rating: 5, comment: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                How was your experience with {selectedBooking.provider.firstName}?
              </p>
              <div className="flex justify-center space-x-2 my-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewForm({...reviewForm, rating: star})}
                    className="transition hover:scale-110"
                  >
                    <Star
                      size={40}
                      className={star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600">
                {reviewForm.rating === 5 && 'Excellent!'}
                {reviewForm.rating === 4 && 'Great!'}
                {reviewForm.rating === 3 && 'Good'}
                {reviewForm.rating === 2 && 'Fair'}
                {reviewForm.rating === 1 && 'Poor'}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share your experience (optional)
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                rows={4}
                placeholder="Tell us what you liked or what could be improved..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleSubmitReview}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg transition"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}   