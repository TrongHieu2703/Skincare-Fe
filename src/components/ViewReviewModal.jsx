import React, { useEffect } from 'react';
import { FaStar, FaRegStar, FaTimes } from 'react-icons/fa';
import '/src/styles/ReviewModal.css';

const ViewReviewModal = ({ isOpen, onClose, review, productName }) => {
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
  
  if (!isOpen || !review) return null;
  
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };
  
  return (
    <div className="review-modal-overlay">
      <div className="review-modal view-review-modal">
        <div className="review-modal-header">
          <h2>Đánh giá của bạn</h2>
          <button className="close-button" onClick={onClose} aria-label="Đóng">
            <FaTimes />
          </button>
        </div>
        
        <div className="review-modal-product">
          <p>{productName}</p>
          <small>Đánh giá vào: {formatDate(review.createdAt)}</small>
        </div>
        
        <div className="review-content-container">
          <div className="rating-display">
            <label>Xếp hạng:</label>
            <div className="stars-display">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star}>
                  {star <= review.rating ? (
                    <FaStar className="star filled" />
                  ) : (
                    <FaRegStar className="star empty" />
                  )}
                </div>
              ))}
            </div>
            <span className="rating-value">{review.rating}/5</span>
          </div>
          
          <div className="comment-display">
            <label>Nhận xét của bạn:</label>
            <div className="review-text-display">
              {review.comment}
            </div>
          </div>
          
          <div className="modal-actions">
            <button onClick={onClose} className="close-review-btn">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewReviewModal; 