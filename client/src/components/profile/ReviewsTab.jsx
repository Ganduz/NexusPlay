import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaEdit, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import { profileApi } from '../../api/profileApi';
import { reviewsApi } from '../../api/reviewsApi';
import { formatRelativeDate, truncate } from '../../utils/formatters';
import { getPlaceholderImage, getErrorMessage } from '../../utils/helpers';
import StarRating from '../common/StarRating';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import toast from 'react-hot-toast';
import '../../styles/components/profile/ReviewsTab.css';

function ReviewsTab() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', body: '', rating: 5 });

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: res } = await profileApi.getMyReviews({ page, limit: 10 });
      setData(res.data);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    setDeletingId(reviewId);
    try {
      await reviewsApi.delete(reviewId);
      setData((prev) => ({
        ...prev,
        reviews: prev.reviews.filter((r) => r.id !== reviewId),
      }));
      toast.success('Review deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditStart = (review) => {
    setEditingReview(review.id);
    setEditForm({
      title: review.title || '',
      body: review.body || '',
      rating: review.rating,
    });
  };

  const handleEditCancel = () => {
    setEditingReview(null);
    setEditForm({ title: '', body: '', rating: 5 });
  };

  const handleEditSave = async (reviewId) => {
    if (!editForm.rating) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await reviewsApi.update(reviewId, editForm);
      setData((prev) => ({
        ...prev,
        reviews: prev.reviews.map((r) =>
          r.id === reviewId ? { ...r, ...editForm } : r
        ),
      }));
      setEditingReview(null);
      toast.success('Review updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading && !data) return <Loader text="Loading reviews..." />;

  if (data && (!data.reviews || data.reviews.length === 0)) {
    return (
      <EmptyState
        icon={<FaStar size={48} />}
        title="No reviews yet"
        message="Share your thoughts! Write reviews from game pages to help other gamers."
        actionText="Browse Games"
        actionLink="/search"
      />
    );
  }

  return (
    <div className="revs animate-fadeInUp">
      <div className="revs-list">
        {data?.reviews.map((review) => {
          const isEditing = editingReview === review.id;
          const isDeleting = deletingId === review.id;

          return (
            <div key={review.id} className="revs-card">
              {/* Game Info Header */}
              <div className="revs-card-header">
                <Link to={`/game/${review.game_slug}`} className="revs-card-game">
                  {review.background_image && (
                    <img
                      src={review.background_image || getPlaceholderImage(60, 34)}
                      alt=""
                      className="revs-card-game-img"
                    />
                  )}
                  <div className="revs-card-game-info">
                    <span className="revs-card-game-name">{review.game_name}</span>
                    <span className="revs-card-date">
                      {formatRelativeDate(review.created_at)}
                    </span>
                  </div>
                  <FaExternalLinkAlt className="revs-card-link-icon" />
                </Link>

                <div className="revs-card-rating">
                  {isEditing ? (
                    <StarRating
                      rating={editForm.rating}
                      size={18}
                      interactive
                      onRate={(r) => setEditForm((prev) => ({ ...prev, rating: r }))}
                    />
                  ) : (
                    <StarRating rating={review.rating} size={16} showValue />
                  )}
                </div>
              </div>

              {/* Review Content */}
              <div className="revs-card-body">
                {isEditing ? (
                  <div className="revs-edit-form">
                    <input
                      type="text"
                      className="revs-edit-title"
                      placeholder="Review title (optional)"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      maxLength={100}
                    />
                    <textarea
                      className="revs-edit-body"
                      placeholder="Write your review..."
                      value={editForm.body}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, body: e.target.value }))
                      }
                      rows={4}
                      maxLength={2000}
                    />
                    <div className="revs-edit-actions">
                      <button
                        className="revs-edit-btn revs-edit-btn-save"
                        onClick={() => handleEditSave(review.id)}
                      >
                        Save Changes
                      </button>
                      <button
                        className="revs-edit-btn revs-edit-btn-cancel"
                        onClick={handleEditCancel}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {review.title && (
                      <h4 className="revs-card-title">{review.title}</h4>
                    )}
                    {review.body && (
                      <p className="revs-card-text">
                        {truncate(review.body, 300)}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Actions */}
              {!isEditing && (
                <div className="revs-card-footer">
                  <button
                    className="revs-action-btn revs-action-edit"
                    onClick={() => handleEditStart(review)}
                    title="Edit review"
                  >
                    <FaEdit />
                    <span>Edit</span>
                  </button>
                  <button
                    className="revs-action-btn revs-action-delete"
                    onClick={() => handleDelete(review.id)}
                    disabled={isDeleting}
                    title="Delete review"
                  >
                    <FaTrash />
                    <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {data?.pagination && (
        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

export default ReviewsTab;
