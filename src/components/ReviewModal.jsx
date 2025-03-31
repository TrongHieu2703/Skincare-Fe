import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaTimes } from 'react-icons/fa';
import { createReview } from '../api/reviewApi';
import { useAuth } from '../auth/AuthProvider';
import '/src/styles/ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, productId, orderId, orderItemId, productName, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { user } = useAuth();
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setComment('');
      setError('');
      setSuccess('');
      
      // Validate props when modal opens
      if (!orderItemId) {
        console.error("Missing orderItemId in ReviewModal props:", { productId, orderId, orderItemId, productName });
        setError('Không tìm thấy ID sản phẩm trong đơn hàng. Vui lòng tải lại trang và thử lại.');
      }
    }
  }, [isOpen, productId, orderId, orderItemId, productName]);
  
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
  
  const handleStarClick = (selectedRating) => {
    setRating(selectedRating);
  };
  
  const handleStarHover = (hoveredValue) => {
    setHoveredRating(hoveredValue);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (rating < 1) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }
    
    if (!comment.trim()) {
      setError('Vui lòng nhập nhận xét của bạn');
      return;
    }
    
    if (!orderItemId || orderItemId === 0) {
      setError('Không tìm thấy thông tin sản phẩm trong đơn hàng');
      console.error("Invalid orderItemId:", orderItemId);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const reviewData = {
        productId: productId,
        orderDetailId: orderItemId,
        rating: rating,
        comment: comment
      };
      
      const response = await createReview(reviewData);
      
      setSuccess('Cảm ơn bạn đã đánh giá sản phẩm!');
      
      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted(response.data);
      }
      
      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại sau.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="review-modal-overlay">
      <div className="review-modal">
        <div className="review-modal-header">
          <h2>Đánh giá sản phẩm</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="review-modal-product">
          <p>{productName}</p>
          <small>Mã sản phẩm: {productId} / Mã đơn hàng: {orderId}</small>
        </div>
        
        {error && (
          <div className="review-alert error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="review-alert success">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="review-form">
          <div className="rating-selector">
            <label>Xếp hạng:</label>
            <div className="stars-input" 
                 onMouseLeave={() => setHoveredRating(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                >
                  {star <= (hoveredRating || rating) ? (
                    <FaStar className="star filled" />
                  ) : (
                    <FaRegStar className="star empty" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="comment-input">
            <label htmlFor="comment">Nhận xét của bạn:</label>
            <textarea
              id="comment"
              className="review-text-area"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              rows={4}
              required
              disabled={!orderItemId || isSubmitting}
            />
          </div>
          
          <button
            type="submit"
            className="submit-review-btn"
            disabled={isSubmitting || !orderItemId}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal; 