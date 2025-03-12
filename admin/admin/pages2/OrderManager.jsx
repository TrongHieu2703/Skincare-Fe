import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from '/admin/admin/pages2/OrderManager.module.css';
import { getAllOrders } from '/src/api/orderApi';

const OrderManager = ({ products, orderId, setOrderId }) => {
  const [orders, setOrders] = useState([]);
  const [newOrder, setNewOrder] = useState({
    customer: '',
    productId: '',
    status: 'pending',
    phone: '',
    address: '',
    paymentMethod: 'cod',
    items: []
  });
  const [editOrder, setEditOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Lấy danh sách đơn hàng từ API khi component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getAllOrders();
        // Giả sử API trả về: { message: "Fetched all orders successfully", data: [ ... ] }
        const fetchedOrders = response.data.data.map(order => ({
          id: order.id,
          customer: order.customer || 'Không xác định',
          status: order.status.toLowerCase(),
          total: order.totalAmount,
          date: order.updatedAt,
          items: order.orderItems.map(item => ({
            productId: item.productId,
            name: item.productName,
            price: item.productPrice,
            quantity: item.itemQuantity
          })),
          paymentMethod: order.paymentInfo.paymentMethod.toLowerCase(),
          phone: order.phone || '',
          address: order.address || ''
        }));
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  // Các option cho trạng thái đơn hàng
  const statusOptions = [
    { value: 'pending', label: 'Chờ xử lý', color: '#f39c12' },
    { value: 'processing', label: 'Đang xử lý', color: '#3498db' },
    { value: 'shipping', label: 'Đang giao', color: '#2980b9' },
    { value: 'delivered', label: 'Đã giao', color: '#27ae60' },
    { value: 'cancelled', label: 'Đã hủy', color: '#e74c3c' },
    { value: 'refunded', label: 'Hoàn tiền', color: '#9b59b6' }
  ];

  // Các phương thức thanh toán
  const paymentMethods = [
    { value: 'cod', label: 'Thanh toán khi nhận hàng' },
    { value: 'bank', label: 'Chuyển khoản ngân hàng' },
    { value: 'momo', label: 'Ví MoMo' },
    { value: 'zalopay', label: 'ZaloPay' },
    { value: 'credit card', label: 'Thẻ tín dụng' },
    { value: 'paypal', label: 'Paypal' }
  ];

  // Hàm thêm đơn hàng mới (có thể tích hợp API POST nếu cần)
  const addOrder = () => {
    if (newOrder.customer && newOrder.productId && newOrder.phone && newOrder.address) {
      const product = products.find(p => p.id === parseInt(newOrder.productId));
      const orderDate = new Date();

      const newOrderData = {
        id: orderId,
        customer: newOrder.customer,
        productId: product.id,
        total: product.price,
        status: newOrder.status,
        phone: newOrder.phone,
        address: newOrder.address,
        paymentMethod: newOrder.paymentMethod,
        date: orderDate.toISOString(),
        items: [{
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        }]
      };

      setOrders([...orders, newOrderData]);
      setOrderId(orderId + 1);
      setNewOrder({
        customer: '',
        productId: '',
        status: 'pending',
        phone: '',
        address: '',
        paymentMethod: 'cod',
        items: []
      });
    } else {
      alert('Vui lòng nhập đầy đủ thông tin đơn hàng!');
    }
  };

  const deleteOrder = (id) => {
    // Tích hợp API DELETE nếu cần
    setOrders(orders.filter(order => order.id !== id));
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder(null);
    }
  };

  const startEditOrder = (order) => {
    setEditOrder(order);
  };

  const saveEditOrder = () => {
    if (editOrder.customer && editOrder.productId && editOrder.phone && editOrder.address) {
      const product = products.find(p => p.id === parseInt(editOrder.productId));
      setOrders(orders.map(o =>
        o.id === editOrder.id ? {
          ...editOrder,
          total: product.price,
          items: [{
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
          }]
        } : o
      ));
      setEditOrder(null);
    } else {
      alert('Vui lòng nhập đầy đủ thông tin!');
    }
  };

  const updateOrderStatus = (id, newStatus) => {
    setOrders(orders.map(order =>
      order.id === id ? { ...order, status: newStatus } : order
    ));
    console.log(`Đơn hàng #${id} đã được cập nhật trạng thái thành ${getStatusLabel(newStatus)}`);
  };

  const getStatusLabel = (statusValue) => {
    const status = statusOptions.find(s => s.value === statusValue);
    return status ? status.label : 'Không xác định';
  };

  const getStatusColor = (statusValue) => {
    const status = statusOptions.find(s => s.value === statusValue);
    return status ? status.color : '#000';
  };

  const getPaymentMethodLabel = (methodValue) => {
    const method = paymentMethods.find(m => m.value === methodValue);
    return method ? method.label : 'Không xác định';
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const dataToExport = filterStatus === 'all'
      ? orders
      : orders.filter(order => order.status === filterStatus);

    let csvContent = "ID,Khách hàng,Số điện thoại,Địa chỉ,Sản phẩm,Tổng tiền,Trạng thái,Phương thức thanh toán,Ngày đặt\n";

    dataToExport.forEach(order => {
      const product = products.find(p => p.id === order.productId);
      const productName = product ? product.name : 'Không xác định';

      csvContent += `${order.id},${order.customer},${order.phone || ''},"${order.address || ''}",${productName},${order.total},${getStatusLabel(order.status)},${getPaymentMethodLabel(order.paymentMethod)},${formatDate(order.date)}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Lọc đơn hàng theo trạng thái
  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  return (
    <div className={styles.section}>
      <h1>Quản lý đơn hàng</h1>

      {/* Form thêm đơn hàng */}
      <div className={styles.form}>
        <input
          type="text"
          placeholder="Tên khách hàng"
          value={newOrder.customer}
          onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          value={newOrder.phone}
          onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Địa chỉ giao hàng"
          value={newOrder.address}
          onChange={(e) => setNewOrder({ ...newOrder, address: e.target.value })}
          className={styles.input}
        />
        <select
          value={newOrder.productId}
          onChange={(e) => setNewOrder({ ...newOrder, productId: e.target.value })}
          className={styles.select}
        >
          <option value="">Chọn sản phẩm</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.price.toLocaleString()}đ)
            </option>
          ))}
        </select>
        <select
          value={newOrder.status}
          onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
          className={styles.select}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={newOrder.paymentMethod}
          onChange={(e) => setNewOrder({ ...newOrder, paymentMethod: e.target.value })}
          className={styles.select}
        >
          {paymentMethods.map(method => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>
        <button onClick={addOrder} className={styles.button}>Thêm đơn hàng</button>
      </div>

      {/* Form chỉnh sửa đơn hàng */}
      {editOrder && (
        <div className={styles.form}>
          <h3>Chỉnh sửa đơn hàng</h3>
          <input
            type="text"
            placeholder="Tên khách hàng"
            value={editOrder.customer}
            onChange={(e) => setEditOrder({ ...editOrder, customer: e.target.value })}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="Số điện thoại"
            value={editOrder.phone || ''}
            onChange={(e) => setEditOrder({ ...editOrder, phone: e.target.value })}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="Địa chỉ giao hàng"
            value={editOrder.address || ''}
            onChange={(e) => setEditOrder({ ...editOrder, address: e.target.value })}
            className={styles.input}
          />
          <select
            value={editOrder.productId}
            onChange={(e) => setEditOrder({ ...editOrder, productId: e.target.value })}
            className={styles.select}
          >
            <option value="">Chọn sản phẩm</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.price.toLocaleString()}đ)
              </option>
            ))}
          </select>
          <select
            value={editOrder.status}
            onChange={(e) => setEditOrder({ ...editOrder, status: e.target.value })}
            className={styles.select}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={editOrder.paymentMethod || 'cod'}
            onChange={(e) => setEditOrder({ ...editOrder, paymentMethod: e.target.value })}
            className={styles.select}
          >
            {paymentMethods.map(method => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
          <button onClick={saveEditOrder} className={styles.button}>Lưu</button>
          <button onClick={() => setEditOrder(null)} className={styles.cancelButton}>Hủy</button>
        </div>
      )}

      {/* Bộ lọc và xuất CSV */}
      <div className={styles.filterContainer}>
        <div className={styles.filterGroup}>
          <label>Lọc theo trạng thái:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Tất cả đơn hàng</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button onClick={exportToCSV} className={styles.exportButton}>
          Xuất dữ liệu (CSV)
        </button>
      </div>

      {/* Bảng danh sách đơn hàng */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>ID</th>
            <th className={styles.th}>Khách hàng</th>
            <th className={styles.th}>Sản phẩm</th>
            <th className={styles.th}>Tổng tiền</th>
            <th className={styles.th}>Trạng thái</th>
            <th className={styles.th}>Ngày đặt</th>
            <th className={styles.th}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => {
            const product = products.find(p => p.id === order.productId);
            return (
              <tr key={order.id}>
                <td className={styles.td}>{order.id}</td>
                <td className={styles.td}>{order.customer}</td>
                <td className={styles.td}>{product ? product.name : 'Không xác định'}</td>
                <td className={styles.td}>{order.total.toLocaleString()}đ</td>
                <td className={styles.td}>
                  <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td className={styles.td}>{order.date ? formatDate(order.date) : 'N/A'}</td>
                <td className={styles.td}>
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => viewOrderDetails(order)}
                      className={styles.viewButton}
                      title="Xem chi tiết"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => startEditOrder(order)}
                      className={styles.editButton}
                      title="Sửa đơn hàng"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className={styles.deleteButton}
                      title="Xóa đơn hàng"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal hiển thị chi tiết đơn hàng */}
      {selectedOrder && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
              <button
                className={styles.closeButton}
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.orderInfo}>
                <h3>Thông tin khách hàng</h3>
                <p><strong>Tên:</strong> {selectedOrder.customer}</p>
                <p><strong>Số điện thoại:</strong> {selectedOrder.phone || 'Không có'}</p>
                <p><strong>Địa chỉ:</strong> {selectedOrder.address || 'Không có'}</p>
                <p>
                  <strong>Phương thức thanh toán:</strong> {getPaymentMethodLabel(selectedOrder.paymentMethod || 'cod')}
                </p>
                <p><strong>Ngày đặt:</strong> {selectedOrder.date ? formatDate(selectedOrder.date) : 'N/A'}</p>
              </div>

              <div className={styles.orderItems}>
                <h3>Sản phẩm đã đặt</h3>
                <table className={styles.itemsTable}>
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Đơn giá</th>
                      <th>Số lượng</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.price.toLocaleString()}đ</td>
                          <td>{item.quantity}</td>
                          <td>{(item.price * item.quantity).toLocaleString()}đ</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4">Không có thông tin sản phẩm</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3"><strong>Tổng cộng:</strong></td>
                      <td><strong>{selectedOrder.total.toLocaleString()}đ</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className={styles.orderStatus}>
                <h3>Cập nhật trạng thái</h3>
                <div className={styles.statusButtons}>
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateOrderStatus(selectedOrder.id, option.value)}
                      className={`${styles.statusButton} ${selectedOrder.status === option.value ? styles.activeStatus : ''}`}
                      style={{
                        backgroundColor: selectedOrder.status === option.value ? option.color : 'transparent',
                        color: selectedOrder.status === option.value ? 'white' : option.color,
                        borderColor: option.color
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hiển thị thông báo khi không có đơn hàng */}
      {filteredOrders.length === 0 && (
        <div className={styles.noOrders}>
          <p>
            Không có đơn hàng nào
            {filterStatus !== 'all' ? ` với trạng thái "${getStatusLabel(filterStatus)}"` : ''}.
          </p>
        </div>
      )}
    </div>
  );
};

OrderManager.propTypes = {
  products: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  })).isRequired,
  orderId: PropTypes.number.isRequired,
  setOrderId: PropTypes.func.isRequired,
};

export default OrderManager;
