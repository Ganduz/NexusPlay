import { useState, useEffect } from 'react';
import { FaThumbsUp, FaThumbsDown, FaEdit, FaTrash } from 'react-icons/fa';
import { reviewsApi } from '../../api/reviewsApi';
import useAuthStore from '../../store/authStore';
import StarRating from '../common/StarRating';
import Pagination from '../common/Pagination';
import toast from 'react-hot-toast';
import { formatRelativeDate } from '../../utils/formatters';
import '../../styles/components/game/ReviewSection.css';

function ReviewSection({ slug, gameId }) {
  const { user, isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ rating: 5, title: '', body: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async (page = 1) => {
    try {
      const { data } = await reviewsApi.getByGame(slug, { page, limit: 10 });
      setReviews(data.data.reviews || []);
      setAvgRating(data.data.avgRating);
      setPagination(data.data.pagination);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchReviews(); }, [slug]);

  const hasReviewed = reviews.some(r => r.user_id === user?.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rating) { toast.error('Please select a rating'); return; }
    setIsSubmitting(true);
    try {
      if (editId) {
        await reviewsApi.update(editId, formData);
        toast.success('Review updated');
      } else {
        await reviewsApi.create(slug, formData);
        toast.success('Review submitted');
      }
      setShowForm(false);
      setEditId(null);
      setFormData({ rating: 5, title: '', body: '' });
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (review) => {
    setFormData({ rating: review.rating, title: review.title || '', body: review.body || '' });
    setEditId(review.id);
    setShowForm(true);
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Delete this review?')) return;
    try {
      await reviewsApi.delete(reviewId);
      toast.success('Review deleted');
      fetchReviews();
    } catch { toast.error('Failed to delete'); }
  };

  const handleVote = async (reviewId, voteType) => {
    if (!isAuthenticated) { toast.error('Please sign in to vote'); return; }
    try {
      await reviewsApi.vote(reviewId, voteType);
      fetchReviews(pagination.page);
    } catch { toast.error('Failed to vote'); }
  };

  return (
    <div className="review-section">
      <div className="review-header">
        <h3 className="review-title">Reviews</h3>
        <div className="review-summary">
          {avgRating && <StarRating rating={parseFloat(avgRating)} showValue />}
          <span className="review-count">({pagination.total} reviews)</span>
        </div>
        {isAuthenticated && !hasReviewed && !showForm && (
          <button className="review-write-btn" onClick={() => setShowForm(true)}>Write a Review</button>
        )}
      </div>

      {showForm && (
        <form className="review-form animate-slideDown" onSubmit={handleSubmit}>
          <h4>{editId ? 'Edit Review' : 'Write a Review'}</h4>
          <div className="review-form-rating">
            <label>Rating</label>
            <StarRating rating={formData.rating} interactive onRate={(r) => setFormData(f => ({ ...f, rating: r }))} size={24} />
          </div>
          <input type="text" placeholder="Review title (optional)" value={formData.title} onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))} className="review-form-input" maxLength={200} />
          <textarea placeholder="Write your review..." value={formData.body} onChange={(e) => setFormData(f => ({ ...f, body: e.target.value }))} className="review-form-textarea" rows={4} maxLength={5000} />
          <div className="review-form-actions">
            <button type="submit" className="review-submit-btn" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : (editId ? 'Update' : 'Submit')}</button>
            <button type="button" className="review-cancel-btn" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="review-list">
        {reviews.map((review) => (
          <div key={review.id} className="review-item">
            <div className="review-item-header">
              <div className="review-author">
                {review.avatar_url ? <img src={review.avatar_url} alt="" className="review-avatar" /> : <div className="review-avatar-placeholder">{review.username?.[0]?.toUpperCase()}</div>}
                <div>
                  <span className="review-username">{review.username}</span>
                  <span className="review-date">{formatRelativeDate(review.created_at)} {review.is_edited && '(edited)'}</span>
                </div>
              </div>
              <StarRating rating={review.rating} size={14} />
            </div>
            {review.title && <h4 className="review-item-title">{review.title}</h4>}
            {review.body && <p className="review-item-body">{review.body}</p>}
            <div className="review-item-actions">
              <button className={`review-vote ${review.user_vote === 'up' ? 'active' : ''}`} onClick={() => handleVote(review.id, 'up')}><FaThumbsUp /> {review.upvotes || 0}</button>
              <button className={`review-vote ${review.user_vote === 'down' ? 'active' : ''}`} onClick={() => handleVote(review.id, 'down')}><FaThumbsDown /> {review.downvotes || 0}</button>
              {user?.id === review.user_id && (
                <>
                  <button className="review-action-btn" onClick={() => handleEdit(review)}><FaEdit /></button>
                  <button className="review-action-btn review-delete-btn" onClick={() => handleDelete(review.id)}><FaTrash /></button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && <p className="review-empty">No reviews yet. Be the first to share your thoughts!</p>}

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={(p) => fetchReviews(p)} />
    </div>
  );
}

export default ReviewSection;
