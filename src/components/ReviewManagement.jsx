import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  Building, 
  Globe, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw,
  AlertCircle,
  User,
  MapPin,
  Calendar,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { reviewService } from '../services/reviewService';

const ReviewManagement = ({ userRole = 'admin', showStats = true, showActions = true, forcedReviewType = null, headerTitle, sidebarLayout = false }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
    websiteServiceReviews: 0,
    propertyReviews: 0
  });
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [reviewTypeFilter, setReviewTypeFilter] = useState(forcedReviewType || 'all');
  const [reviewSearch, setReviewSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (forcedReviewType) {
      setReviewTypeFilter(forcedReviewType);
    }
  }, [forcedReviewType]);

  useEffect(() => {
    fetchReviews();
    fetchReviewStats();
  }, [currentPage, reviewFilter, reviewTypeFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        status: reviewFilter === 'all' ? undefined : reviewFilter,
        reviewType: reviewTypeFilter === 'all' ? undefined : reviewTypeFilter,
        search: reviewSearch || undefined
      };

      const response = await reviewService.getReviews(params);
      if (response.success) {
        setReviews(response.data.data.reviews || []);
        setTotalPages(response.data.data.pagination?.pages || 1);
      } else {
        setError('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Error loading reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await reviewService.getReviewStats();
      if (response.success) {
        setReviewStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

  const handleStatusUpdate = async (reviewId, newStatus, adminNotes = '') => {
    try {
      const response = await reviewService.updateReviewStatus(reviewId, {
        status: newStatus,
        adminNotes
      });
      
      if (response.success) {
        setReviews(prev => prev.map(review => 
          review._id === reviewId 
            ? { ...review, status: newStatus, adminNotes }
            : review
        ));
        fetchReviewStats();
        if (selectedReview?._id === reviewId) {
          setShowReviewModal(false);
          setSelectedReview(null);
        }
      }
    } catch (error) {
      console.error('Error updating review status:', error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const response = await reviewService.deleteReview(reviewId);
        if (response.success) {
          setReviews(prev => prev.filter(review => review._id !== reviewId));
          fetchReviewStats();
        }
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const renderRating = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={`${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}/5</span>
      </div>
    );
  };

  const renderStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderReviewTypeBadge = (reviewType) => {
    const config = reviewType === 'property' 
      ? { color: 'bg-blue-100 text-blue-800', icon: Building, text: 'Property' }
      : { color: 'bg-purple-100 text-purple-800', icon: Globe, text: 'Website Service' };

    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  const renderReviewModal = () => {
    if (!selectedReview) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">Review Details</h3>
            <button
              onClick={() => setShowReviewModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User size={20} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">{selectedReview.buyer?.name || 'Anonymous'}</p>
                  <p className="text-sm text-gray-500">{selectedReview.buyer?.email}</p>
                </div>
              </div>
              <div className="text-right">
                {renderRating(selectedReview.rating)}
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(selectedReview.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {renderReviewTypeBadge(selectedReview.reviewType)}
              {renderStatusBadge(selectedReview.status)}
            </div>

            {selectedReview.title && (
              <div>
                <h4 className="font-medium text-gray-900">{selectedReview.title}</h4>
              </div>
            )}
            
            <div>
              <p className="text-gray-700 leading-relaxed">{selectedReview.review}</p>
            </div>

            {selectedReview.property && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Property Review</h5>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building size={16} />
                  <span>{selectedReview.property.title}</span>
                  <MapPin size={16} />
                  <span>{selectedReview.property.location}</span>
                </div>
              </div>
            )}

            {selectedReview.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} />
                <span>{selectedReview.location}</span>
              </div>
            )}

            {selectedReview.adminNotes && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <h5 className="font-medium text-yellow-900 mb-2">Admin Notes</h5>
                <p className="text-sm text-yellow-800">{selectedReview.adminNotes}</p>
              </div>
            )}

            {showActions && (userRole === 'admin' || userRole === 'employee') && (
              <div className="border-t pt-4">
                <h5 className="font-medium text-gray-900 mb-3">Review Actions</h5>
                
                {selectedReview.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(selectedReview._id, 'approved')}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <ThumbsUp size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedReview._id, 'rejected')}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <ThumbsDown size={16} />
                      Reject
                    </button>
                  </div>
                )}

                {selectedReview.status === 'approved' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedReview._id, 'rejected')}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <ThumbsDown size={16} />
                    Reject
                  </button>
                )}

                {selectedReview.status === 'rejected' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedReview._id, 'approved')}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <ThumbsUp size={16} />
                    Approve
                  </button>
                )}

                {userRole === 'admin' && (
                  <button
                    onClick={() => handleDeleteReview(selectedReview._id)}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 ml-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const StatsPanel = (
    showStats ? (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{reviewStats.totalReviews}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{reviewStats.averageRating ? reviewStats.averageRating.toFixed(1) : '0.0'}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-yellow-600">{reviewStats.pendingReviews}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>
    ) : null
  );

  const FiltersPanel = (
    <div className="bg-white p-4 rounded-lg shadow border">
      <div className="flex flex-col gap-3">
        <div className="relative">
          {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /> */}
          <input
            type="text"
            placeholder="Search reviews..."
            value={reviewSearch}
            onChange={(e) => setReviewSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={reviewFilter}
          onChange={(e) => setReviewFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        {!forcedReviewType && (
          <select
            value={reviewTypeFilter}
            onChange={(e) => setReviewTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="property">Property</option>
            <option value="website_service">Website Service</option>
          </select>
        )}
        <button
          onClick={() => { setCurrentPage(1); fetchReviews(); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
    </div>
  );

  const TablePanel = (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User & Review</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="animate-spin h-5 w-5 text-blue-600 mr-2" />
                    Loading reviews...
                  </div>
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No reviews found</td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User size={20} className="text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{review.buyer?.name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500 truncate">{review.title || review.review.substring(0, 50)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      {renderReviewTypeBadge(review.reviewType)}
                      {renderStatusBadge(review.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4">{renderRating(review.rating)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => { setSelectedReview(review); setShowReviewModal(true); }} className="text-blue-600 hover:text-blue-900" title="View Details"><Eye size={16} /></button>
                      {showActions && userRole === 'admin' && (
                        <button onClick={() => handleDeleteReview(review._id)} className="text-red-600 hover:text-red-900" title="Delete Review"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between w-full">
              <div>
                <p className="text-sm text-gray-700">Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span></p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">Previous</button>
                  <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">Next</button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (sidebarLayout) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <aside className="md:col-span-3 space-y-4">
          {headerTitle && (
            <div className="bg-white p-4 rounded-lg shadow border">
              <h2 className="text-xl font-semibold text-neutral-900">{headerTitle}</h2>
              <p className="text-sm text-neutral-500 mt-1">Website Service Reviews</p>
            </div>
          )}
          {StatsPanel}
          {FiltersPanel}
        </aside>
        <section className="md:col-span-9">
          {TablePanel}
        </section>
        {showReviewModal && renderReviewModal()}
      </div>
    );
  }

  return (
    <div className="review-management">
      {headerTitle && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-neutral-900">{headerTitle}</h2>
        </div>
      )}
      {StatsPanel}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {FiltersPanel}
        </div>
      </div>
      {TablePanel}
      {showReviewModal && renderReviewModal()}
    </div>
  );
};

export default ReviewManagement;
