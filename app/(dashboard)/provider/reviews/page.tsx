'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, Calendar, Loader, TrendingUp, Award } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: {
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  booking: {
    service: string;
    scheduledDate: string;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function ProviderReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId'); // Assuming you store this on login
      
      const response = await fetch(`/api/provider/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setReviews(result.data.reviews || []);
        calculateStats(result.data.reviews || []);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsList: Review[]) => {
    const total = reviewsList.length;
    const avgRating = total > 0 
      ? reviewsList.reduce((sum, r) => sum + r.rating, 0) / total 
      : 0;

    const distribution = {
      5: reviewsList.filter(r => r.rating === 5).length,
      4: reviewsList.filter(r => r.rating === 4).length,
      3: reviewsList.filter(r => r.rating === 3).length,
      2: reviewsList.filter(r => r.rating === 2).length,
      1: reviewsList.filter(r => r.rating === 1).length,
    };

    setStats({
      totalReviews: total,
      averageRating: avgRating,
      ratingDistribution: distribution
    });
  };

  const filteredReviews = filterRating === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === filterRating);

  const getRatingPercentage = (rating: number) => {
    if (!stats) return 0;
    return stats.totalReviews > 0 
      ? (stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100 
      : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 py-8">
        <div className="mb-8">
         
          <p className="text-gray-600 mt-1">See what clients are saying about your work</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Average Rating */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <div className="flex items-baseline mt-2">
                    <h3 className="text-4xl font-bold text-gray-900">
                      {stats.averageRating.toFixed(1)}
                    </h3>
                    <span className="text-gray-600 ml-2">/ 5.0</span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Star className="text-yellow-600" size={24} />
                </div>
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.round(stats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                  />
                ))}
              </div>
            </div>

            {/* Total Reviews */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <h3 className="text-4xl font-bold text-gray-900 mt-2">
                    {stats.totalReviews}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    From completed jobs
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MessageSquare className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
                
            {/* Positive Rating */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Positive Reviews</p>
                  <h3 className="text-4xl font-bold text-gray-900 mt-2">
                    {stats.totalReviews > 0 
                      ? Math.round(((stats.ratingDistribution[5] + stats.ratingDistribution[4]) / stats.totalReviews) * 100)
                      : 0}%
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    4-5 star ratings
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <ThumbsUp className="text-green-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rating Distribution */}
          {stats && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Rating Distribution</h2>
              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{rating}</span>
                        <Star size={14} className="text-yellow-400 fill-current" />
                      </div>
                      <span className="text-sm text-gray-600">
                        {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]} reviews
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${getRatingPercentage(rating)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Filter */}
              <div className="mt-6 pt-6 border-t">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter by Rating
                </label>
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Reviews ({filteredReviews.length})
                </h2>
              </div>

              {filteredReviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {filterRating === 'all' ? 'No reviews yet' : `No ${filterRating} star reviews`}
                  </h3>
                  <p className="text-gray-600">
                    {filterRating === 'all' 
                      ? 'Complete jobs to start receiving reviews from clients'
                      : 'Try selecting a different rating filter'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6 mt-8">
          <div className="flex items-start space-x-4">
            <Award className="text-blue-600 flex-shrink-0" size={32} />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">How to Get Better Reviews</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Communicate clearly with clients before and during the job</li>
                <li>• Arrive on time and complete work as promised</li>
                <li>• Be professional and courteous at all times</li>
                <li>• Follow up with clients to ensure satisfaction</li>
                <li>• Ask happy clients to leave a review</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating === 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingLabel = (rating: number) => {
    if (rating === 5) return 'Excellent';
    if (rating === 4) return 'Good';
    if (rating === 3) return 'Average';
    if (rating === 2) return 'Below Average';
    return 'Poor';
  };

  return (
    <div className="border rounded-xl p-6 hover:bg-gray-50 transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={review.reviewer.avatar || '/images/avatar-placeholder.png'}
            alt={review.reviewer.firstName}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p className="font-medium text-gray-900">
              {review.reviewer.firstName} {review.reviewer.lastName}
            </p>
            <p className="text-sm text-gray-600">{review.booking.service}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
              />
            ))}
          </div>
          <p className={`text-sm font-medium ${getRatingColor(review.rating)}`}>
            {getRatingLabel(review.rating)}
          </p>
        </div>
      </div>

      {review.comment && (
        <p className="text-gray-700 mb-3">{review.comment}</p>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <Calendar size={14} />
          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
        </div>
        <span>
          Job completed on {new Date(review.booking.scheduledDate).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}