import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import './ConfirmationModal.css';

/**
 * Reusable confirmation modal component
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when the modal should close
 * @param {Function} props.onConfirm - Function to call when the user confirms the action
 * @param {string} props.title - Modal title
 * @param {string} props.message - Modal message
 * @param {string} props.confirmButtonText - Text for the confirm button
 * @param {string} props.cancelButtonText - Text for the cancel button
 * @param {string} props.itemName - Name of the item being affected
 * @param {string} props.itemType - Type of item (product, voucher, order, etc.)
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận xóa',
  message = 'Bạn có chắc chắn muốn xóa mục này?',
  confirmButtonText = 'Xóa',
  cancelButtonText = 'Hủy',
  itemName = '',
  itemType = 'mục'
}) => {
  if (!isOpen) return null;

  // Prevent click propagation on modal content
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  // Dynamically build message with item details if provided
  const getFullMessage = () => {
    if (itemName) {
      return `${message} ${itemType} "${itemName}"?`;
    }
    return message;
  };

  return (
    <div className="confirmation-modal-overlay" onClick={onClose}>
      <div className="confirmation-modal-content" onClick={handleContentClick}>
        <div className="confirmation-modal-header">
          <div className="confirmation-modal-icon">
            <FaExclamationTriangle size={24} />
          </div>
          <h2 className="confirmation-modal-title">{title}</h2>
          <button className="confirmation-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="confirmation-modal-body">
          <p>{getFullMessage()}</p>
        </div>
        
        <div className="confirmation-modal-footer">
          <button 
            className="confirmation-modal-cancel-btn" 
            onClick={onClose}
          >
            {cancelButtonText}
          </button>
          <button 
            className="confirmation-modal-confirm-btn" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 