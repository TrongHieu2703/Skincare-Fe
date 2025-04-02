import React, { useEffect, useState } from 'react';
import { getAllOrders, deleteOrder, updateOrder, getOrderById } from '/src/api/orderApi';
import Swal from 'sweetalert2';
import Sidebar from './Sidebar';
import styles from './OrderManager.module.css';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaSort, FaCalendar } from 'react-icons/fa';
import { Modal, Button, Form } from 'react-bootstrap';
import ConfirmationModal from "/src/components/ConfirmationModal";

const ManagerOrder = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    isPrepaid: false,
    totalAmount: 0,
    paymentMethod: 'Cash',
  });

  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0
  });

  // Filter and sort states
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  // Add translation function for status
  const getStatusLabel = (status) => {
    if (!status) return "Đang xử lý";
    switch (status) {
      case "Delivered": return "Đã giao hàng";
      case "Shipped": return "Đang giao hàng";
      case "Processing": return "Đang xử lý";
      case "Confirmed": return "Đã xác nhận";
      case "Cancelled": return "Đã hủy";
      case "Pending": return "Chờ xử lý";
      default: return status;
    }
  };

  // Add state for delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    orderId: null,
    orderNumber: null
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.currentPage, pagination.pageSize]);

  // Apply filters and sorting
  useEffect(() => {
    if (orders.length === 0) return;

    applyFiltersAndSort();
  }, [orders, statusFilter, paymentFilter, sortOption, searchKeyword, startDate, endDate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrders();
      const ordersData = res.data || [];
      setOrders(ordersData);

      // Initialize filteredOrders and pagination
      const totalItems = ordersData.length;
      const totalPages = Math.ceil(totalItems / pagination.pageSize);

      setPagination(prev => ({
        ...prev,
        totalItems,
        totalPages
      }));

      applyFiltersAndSort(ordersData);
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng:', err);
      Swal.fire('Lỗi', 'Không thể tải danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = (data = orders) => {
    let result = [...data];

    // Apply status filter
    if (statusFilter) {
      result = result.filter(order =>
        order.status && order.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply payment filter
    if (paymentFilter) {
      result = result.filter(order =>
        paymentFilter === 'paid' ? order.isPrepaid : !order.isPrepaid
      );
    }

    // Apply search filter
    if (searchKeyword.trim()) {
      const term = searchKeyword.toLowerCase().trim();
      result = result.filter(order => {
        // Search by order ID
        if (order.id.toString().includes(term)) return true;

        // Search by customer info
        if (order.customerInfo) {
          if (order.customerInfo.username && order.customerInfo.username.toLowerCase().includes(term)) return true;
          if (order.customerInfo.email && order.customerInfo.email.toLowerCase().includes(term)) return true;
          if (order.customerInfo.phoneNumber && order.customerInfo.phoneNumber.includes(term)) return true;
        }

        return false;
      });
    }

    // Apply date range filter
    if (startDate || endDate) {
      result = result.filter(order => {
        if (!order.updatedAt) return false;

        const orderDate = new Date(order.updatedAt);

        // If only start date is provided, filter orders after that date
        if (startDate && !endDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          return orderDate >= start;
        }

        // If only end date is provided, filter orders before that date
        if (!startDate && endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return orderDate <= end;
        }

        // If both dates are provided, filter orders between those dates
        if (startDate && endDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);

          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);

          return orderDate >= start && orderDate <= end;
        }

        return true;
      });
    }

    // Apply sorting
    switch (sortOption) {
      case "newest":
        result.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0));
        break;
      case "highest-price":
        result.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
        break;
      case "lowest-price":
        result.sort((a, b) => (a.totalAmount || 0) - (b.totalAmount || 0));
        break;
      default:
        // Default sort by newest
        result.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
        break;
    }

    // Apply pagination
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const paginatedOrders = result.slice(startIndex, startIndex + pagination.pageSize);

    // Update the total pages based on filtered results
    const totalItems = result.length;
    const totalPages = Math.ceil(totalItems / pagination.pageSize);

    setPagination(prev => ({
      ...prev,
      totalItems,
      totalPages
    }));

    setFilteredOrders(paginatedOrders);
  };

  const handleDelete = async (orderId) => {
    try {
      await deleteOrder(orderId);
      Swal.fire('Đã xóa!', 'Đơn hàng đã được xóa.', 'success');

      // Refresh the order list after deletion
      fetchOrders();
    } catch (err) {
      console.error('Lỗi khi xóa đơn hàng:', err);

      // Specific error handling based on response
      const errorMessage = err.response?.data?.message || 'Xóa thất bại!';
      Swal.fire('Lỗi', errorMessage, 'error');
    }
  };

  // Add function to show delete confirmation modal
  const showDeleteConfirmation = (orderId, orderNumber) => {
    setDeleteModal({
      isOpen: true,
      orderId,
      orderNumber: orderNumber || orderId
    });
  };

  // Add function to close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      orderId: null,
      orderNumber: null
    });
  };

  // Add function to handle delete confirmation
  const confirmDeleteOrder = async () => {
    if (deleteModal.orderId) {
      await handleDelete(deleteModal.orderId);
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

  // Handle page change for pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }));
    }
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPagination(prev => ({
      ...prev,
      pageSize: newSize,
      currentPage: 1, // Reset to first page when changing page size
      totalPages: Math.ceil(prev.totalItems / newSize)
    }));
  };

  // Reset all filters
  const handleResetFilters = () => {
    setStatusFilter("");
    setPaymentFilter("");
    setSortOption("");
    setSearchKeyword("");
    setStartDate("");
    setEndDate("");

    // Reset pagination
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  // Pagination component
  const Pagination = () => {
    const maxPageButtons = 5; // Max number of page buttons to show
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxPageButtons - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    const pageButtons = [];
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <button
          key={i}
          className={`${styles.pageButton} ${i === pagination.currentPage ? styles.activePage : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className={styles.paginationContainer}>
        <div className={styles.paginationControls}>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(1)}
            disabled={pagination.currentPage === 1}
          >
            &laquo;
          </button>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            &lsaquo;
          </button>

          {pageButtons}

          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            &rsaquo;
          </button>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            &raquo;
          </button>
        </div>

        <div className={styles.pageSizeSelector}>
          <span>Hiển thị:</span>
          <select
            value={pagination.pageSize}
            onChange={handlePageSizeChange}
            className={styles.pageSizeSelect}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>mục / trang</span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1>Quản lý đơn hàng</h1>

        {/* Add Filter/Search Container */}
        <div className={styles.filterContainer}>
          {/* Filters Bar */}
          <div className={styles.filterBar}>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipped">Đang giao hàng</option>
              <option value="delivered">Đã giao hàng</option>
              <option value="cancelled">Đã hủy</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Tất cả thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="unpaid">Chưa thanh toán</option>
            </select>

            {/* Sort Options */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="highest-price">Giá cao nhất</option>
              <option value="lowest-price">Giá thấp nhất</option>
            </select>
          </div>

          {/* Search and Date Filter Bar */}
          <div className={styles.searchBarRow}>
            {/* Search Input */}
            <div className={styles.searchInputWrapper}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm kiếm theo mã đơn hoặc tên khách hàng..."
                className={styles.searchInput}
              />
            </div>

            {/* Date Range Filter */}
            <div className={styles.dateFilterWrapper}>
              <FaCalendar className={styles.calendarIcon} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={styles.dateInput}
              />
              <span className={styles.dateSeparator}>đến</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>

            {/* Reset Filters Button - only show if there are active filters */}
            {(statusFilter || paymentFilter || sortOption || searchKeyword || startDate || endDate) && (
              <button
                className={styles.resetFilterBtn}
                onClick={handleResetFilters}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Order count indicator */}
        <div className={styles.orderCount}>
          Hiển thị {filteredOrders.length} / {pagination.totalItems} đơn hàng
        </div>

        <div className={styles.tableWrapper}>
          {loading ? (
            <div className={styles.loadingIndicator}>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className={styles.noOrders}>
              <p>Không có đơn hàng nào phù hợp</p>
              {(statusFilter || paymentFilter || sortOption || searchKeyword || startDate || endDate) && (
                <button className={styles.resetFilterBtn} onClick={handleResetFilters}>
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
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
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>{order.totalAmount ? order.totalAmount.toLocaleString() : 0}đ</td>
                    <td>{order.isPrepaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
                    <td>{formatDate(order.updatedAt)}</td>
                    <td className={styles.actionButtons}>
                      <button
                        className={styles.editButton}
                        onClick={() => handleUpdate(order.id)}
                      >
                        <FaEdit />
                      </button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredOrders.length > 0 && <Pagination />}

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
                      <option value={currentOrder.status}>{getStatusLabel(currentOrder.status)} (Hiện tại)</option>
                      {statusOptions[currentOrder.status]?.map((status) => (
                        <option key={status} value={status}>{getStatusLabel(status)}</option>
                      ))}
                    </select>
                    <small className={styles.formHelper}>
                      Trạng thái chỉ có thể thay đổi theo quy trình: Chờ xử lý → Đã xác nhận → Đang xử lý → Đang giao hàng → Đã giao hàng
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

        {/* Add delete confirmation modal */}
        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDeleteOrder}
          title="Xác nhận xóa đơn hàng"
          message="Bạn có chắc muốn xóa"
          itemName={`#${deleteModal.orderNumber}`}
          itemType="đơn hàng"
        />
      </div>
    </div>
  );
};

export default ManagerOrder;