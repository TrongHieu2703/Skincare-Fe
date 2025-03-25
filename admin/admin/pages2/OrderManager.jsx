import React, { useEffect, useState } from 'react';
import { getAllOrders, deleteOrder, updateOrder, getOrderById } from '/src/api/orderApi';
import Swal from 'sweetalert2';
import Sidebar from './Sidebar';
import styles from './OrderManager.module.css';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { Modal, Button, Form } from 'react-bootstrap';

const ManagerOrder = () => {
  const [orders, setOrders] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    isPrepaid: false,
    totalAmount: 0,
    paymentMethod: 'Cash',
  });

  // Possible status transitions based on your backend logic
  const statusOptions = {
    'Pending': ['Confirmed', 'Cancelled'],
    'Confirmed': ['Processing', 'Cancelled'],
    'Processing': ['Shipped', 'Cancelled'],
    'Shipped': ['Delivered', 'Cancelled'],
    'Delivered': [],
    'Cancelled': []
  };

  // Valid payment methods
  const paymentMethods = ['Cash', 'Banking', 'Momo', 'ZaloPay', 'VNPay'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getAllOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng:', err);
      Swal.fire('Lỗi', 'Không thể tải danh sách đơn hàng', 'error');
    }
  };

  const handleDelete = async (orderId) => {
    const confirm = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: 'Bạn có chắc muốn xóa đơn hàng này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (confirm.isConfirmed) {
      try {
        await deleteOrder(orderId);
        Swal.fire('Đã xóa!', 'Đơn hàng đã được xóa.', 'success');
        setOrders((prev) => prev.filter((order) => order.id !== orderId));
      } catch (err) {
        console.error('Lỗi khi xóa đơn hàng:', err);
        
        // Specific error handling based on response
        const errorMessage = err.response?.data?.message || 'Xóa thất bại!';
        Swal.fire('Lỗi', errorMessage, 'error');
      }
    }
  };

  const handleUpdate = async (orderId) => {
    try {
      setLoading(true);
      // Fetch order by ID directly
      const response = await getOrderById(orderId);
      const orderData = response.data;
      
      console.log("Fetched order data:", orderData);
      
      // Set current order with detailed information
      setCurrentOrder(orderData);
      
      // Get payment method from latest transaction if available
      const paymentMethod = orderData.paymentInfo?.paymentMethod || 'Cash';
      
      // Initialize the update form with current values
      setUpdateForm({
        status: orderData.status || 'Pending',
        isPrepaid: orderData.isPrepaid || false,
        totalAmount: orderData.totalAmount || 0,
        paymentMethod: paymentMethod,
      });
      
      setShowUpdateModal(true);
    } catch (err) {
      console.error('Lỗi khi tải chi tiết đơn hàng:', err);
      Swal.fire('Lỗi', 'Không thể tải chi tiết đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowUpdateModal(false);
    setCurrentOrder(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpdateForm({
      ...updateForm,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();

    // Validate form
    if (updateForm.totalAmount < 0) {
      Swal.fire('Lỗi', 'Tổng tiền không được âm', 'error');
      return;
    }

    try {
      // Determine what changed
      const statusChanged = currentOrder.status !== updateForm.status;
      const paymentChanged = currentOrder.isPrepaid !== updateForm.isPrepaid;
      const amountChanged = currentOrder.totalAmount !== parseFloat(updateForm.totalAmount);
      
      // Only include fields that actually changed
      const updateDto = {};
      
      // Only include status if it changed
      if (statusChanged) {
        updateDto.status = updateForm.status;
      }
      
      // Always include payment status
      updateDto.isPrepaid = updateForm.isPrepaid;
      
      // Only include amount if it changed
      if (amountChanged) {
        updateDto.totalAmount = parseFloat(updateForm.totalAmount);
      }
      
      // Special case: if marking as Delivered, ensure payment is made
      if (updateForm.status === 'Delivered' && !updateForm.isPrepaid) {
        Swal.fire('Lỗi', 'Đơn hàng phải được thanh toán trước khi chuyển sang trạng thái Delivered', 'error');
        return;
      }
      
      // Include updateTransactionStatus flag to update existing transactions instead of creating new ones
      updateDto.updateTransactionStatus = true;

      console.log('Sending update data:', updateDto);

      // Call API to update order
      const result = await updateOrder(currentOrder.id, updateDto);
      console.log('Update result:', result);
      
      // Refresh orders list to show updated data
      await fetchOrders();

      // Close modal and notify success
      handleCloseModal();
      Swal.fire('Thành công', 'Cập nhật đơn hàng thành công', 'success');
    } catch (err) {
      console.error('Lỗi khi cập nhật đơn hàng:', err);
      
      // More specific error handling
      if (err.response?.data?.message?.includes("Cannot change status")) {
        Swal.fire('Lỗi', 'Không thể thay đổi trạng thái đơn hàng', 'error');
      } else if (err.response?.status === 400) {
        Swal.fire('Lỗi', 'Dữ liệu cập nhật không hợp lệ', 'error');
      } else if (err.response?.status === 404) {
        Swal.fire('Lỗi', 'Không tìm thấy đơn hàng', 'error');
      } else {
        Swal.fire('Lỗi', err.response?.data?.message || 'Cập nhật thất bại', 'error');
      }
    }
  };

  // Helper function to get status class
  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return styles.statusPending;
      case 'Confirmed': return styles.statusConfirmed;
      case 'Processing': return styles.statusProcessing;
      case 'Shipped': return styles.statusShipped;
      case 'Delivered': return styles.statusDelivered;
      case 'Cancelled': return styles.statusCancelled;
      default: return '';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1>Quản lý đơn hàng</h1>
        
        <div className={styles.tableWrapper}>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Trạng thái</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Ngày cập nhật</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6">Không có đơn hàng</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.totalAmount.toLocaleString()}đ</td>
                    <td>{order.isPrepaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
                    <td>{formatDate(order.updatedAt)}</td>
                    <td className={styles.actionButtons}>
                      <button 
                        className={styles.editButton}
                        onClick={() => handleUpdate(order.id)}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDelete(order.id)}
                        disabled={['Delivered', 'Processing', 'Shipped'].includes(order.status)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Order Update Modal */}
        {showUpdateModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Cập nhật đơn hàng #{currentOrder?.id}</h2>
              
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Đang tải dữ liệu...</p>
                </div>
              ) : currentOrder ? (
                <form onSubmit={handleSubmitUpdate}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Trạng thái đơn hàng</label>
                    <select 
                      className={styles.textInput}
                      name="status" 
                      value={updateForm.status}
                      onChange={handleInputChange}
                    >
                      <option value={currentOrder.status}>{currentOrder.status} (Hiện tại)</option>
                      {statusOptions[currentOrder.status]?.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <small className={styles.formHelper}>
                      Trạng thái chỉ có thể thay đổi theo quy trình: Pending → Confirmed → Processing → Shipped → Delivered
                    </small>
                  </div>

                  <div className={styles.formGroup}>
                    <div className={styles.checkboxItem}>
                      <input 
                        type="checkbox"
                        id="isPrepaid"
                        name="isPrepaid"
                        checked={updateForm.isPrepaid}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="isPrepaid">Đã thanh toán</label>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tổng tiền</label>
                    <input 
                      className={styles.textInput}
                      type="number" 
                      name="totalAmount"
                      value={updateForm.totalAmount}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Customer Information */}
                  <div className={styles.formGroup}>
                    <h6 className={styles.formLabel}>Thông tin khách hàng:</h6>
                    <div className={styles.customerInfo}>
                      <p>Tên: {currentOrder.customerInfo?.username || '—'}</p>
                      <p>Email: {currentOrder.customerInfo?.email || '—'}</p>
                      <p>SĐT: {currentOrder.customerInfo?.phoneNumber || '—'}</p>
                      <p>Địa chỉ: {currentOrder.customerInfo?.address || '—'}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className={styles.formGroup}>
                    <h6 className={styles.formLabel}>Sản phẩm ({currentOrder.orderItems?.length || 0}):</h6>
                    <ul className={styles.orderItems}>
                      {(currentOrder.orderItems || []).map((item) => (
                        <li key={item.productId} className={styles.orderItem}>
                          <div className={styles.productInfo}>
                            {item.productName} x {item.itemQuantity}
                          </div>
                          <span>{(item.productPrice * item.itemQuantity).toLocaleString()}đ</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.modalFooter}>
                    <button type="button" className={styles.cancelButton} onClick={handleCloseModal}>
                      Hủy
                    </button>
                    <button type="submit" className={styles.saveButton}>
                      Cập nhật đơn hàng
                    </button>
                  </div>
                </form>
              ) : (
                <p>Không tìm thấy thông tin đơn hàng</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerOrder;