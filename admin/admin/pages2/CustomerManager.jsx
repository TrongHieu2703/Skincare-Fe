import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from '/admin/admin/pages2/CustomerManager.module.css';

const CustomerManager = ({ orders, products }) => {
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    group: 'regular'
  });
  const [editCustomer, setEditCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filterGroup, setFilterGroup] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Customer groups
  const customerGroups = [
    { value: 'new', label: 'Khách mới', color: '#3498db' },
    { value: 'regular', label: 'Khách thường xuyên', color: '#2ecc71' },
    { value: 'vip', label: 'Khách VIP', color: '#f39c12' },
    { value: 'inactive', label: 'Không hoạt động', color: '#95a5a6' }
  ];

  // Extract unique customers from orders on component mount
  useEffect(() => {
    const uniqueCustomers = [];
    const customerMap = new Map();

    orders.forEach(order => {
      if (!customerMap.has(order.phone)) {
        customerMap.set(order.phone, {
          id: uniqueCustomers.length + 1,
          name: order.customer,
          phone: order.phone,
          address: order.address,
          email: '',
          group: determineCustomerGroup(order.phone, orders),
          orders: []
        });
        uniqueCustomers.push(customerMap.get(order.phone));
      }

      // Add order to customer's order history
      customerMap.get(order.phone).orders.push(order.id);
    });

    setCustomers(uniqueCustomers);
  }, [orders]);

  // Determine customer group based on order history
  const determineCustomerGroup = (phone, allOrders) => {
    const customerOrders = allOrders.filter(order => order.phone === phone);

    if (customerOrders.length === 0) return 'new';
    if (customerOrders.length >= 5) return 'vip';
    if (customerOrders.length >= 2) return 'regular';

    // Check if last order was more than 3 months ago
    const lastOrderDate = new Date(Math.max(...customerOrders.map(o => new Date(o.date))));
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    if (lastOrderDate < threeMonthsAgo) return 'inactive';

    return 'new';
  };

  const addCustomer = () => {
    if (newCustomer.name && newCustomer.phone) {
      setCustomers([...customers, {
        id: customers.length + 1,
        ...newCustomer,
        orders: []
      }]);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        group: 'regular'
      });
    } else {
      alert('Vui lòng nhập tên và số điện thoại khách hàng!');
    }
  };

  const updateCustomer = () => {
    if (editCustomer && editCustomer.name && editCustomer.phone) {
      setCustomers(customers.map(c =>
        c.id === editCustomer.id ? editCustomer : c
      ));
      setEditCustomer(null);
    } else {
      alert('Vui lòng nhập đầy đủ thông tin!');
    }
  };

  const deleteCustomer = (id) => {
    setCustomers(customers.filter(c => c.id !== id));
    if (selectedCustomer && selectedCustomer.id === id) {
      setSelectedCustomer(null);
    }
  };

  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
  };

  const getCustomerOrderHistory = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return [];

    return orders.filter(order => order.phone === customer.phone)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getGroupLabel = (groupValue) => {
    const group = customerGroups.find(g => g.value === groupValue);
    return group ? group.label : 'Unknown';
  };

  const getGroupColor = (groupValue) => {
    const group = customerGroups.find(g => g.value === groupValue);
    return group ? group.color : '#000';
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

  const getTotalSpent = (customerPhone) => {
    return orders
      .filter(order => order.phone === customerPhone)
      .reduce((sum, order) => sum + order.total, 0);
  };

  // Filter customers based on group and search term
  const filteredCustomers = customers
    .filter(customer => filterGroup === 'all' || customer.group === filterGroup)
    .filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div className={styles.section}>
      <h1>Quản lý khách hàng</h1>

      {/* Add new customer form */}
      <div className={styles.form}>
        <input
          type="text"
          placeholder="Tên khách hàng"
          value={newCustomer.name}
          onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
          className={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={newCustomer.email}
          onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          value={newCustomer.phone}
          onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Địa chỉ"
          value={newCustomer.address}
          onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
          className={styles.input}
        />
        <select
          value={newCustomer.group}
          onChange={(e) => setNewCustomer({ ...newCustomer, group: e.target.value })}
          className={styles.select}
        >
          {customerGroups.map(group => (
            <option key={group.value} value={group.value}>{group.label}</option>
          ))}
        </select>
        <button onClick={addCustomer} className={styles.button}>Thêm khách hàng</button>
      </div>

      {/* Edit customer form */}
      {editCustomer && (
        <div className={styles.form}>
          <h3>Chỉnh sửa thông tin khách hàng</h3>
          <input
            type="text"
            placeholder="Tên khách hàng"
            value={editCustomer.name}
            onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
            className={styles.input}
          />
          <input
            type="email"
            placeholder="Email"
            value={editCustomer.email}
            onChange={(e) => setEditCustomer({ ...editCustomer, email: e.target.value })}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="Số điện thoại"
            value={editCustomer.phone}
            onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="Địa chỉ"
            value={editCustomer.address}
            onChange={(e) => setEditCustomer({ ...editCustomer, address: e.target.value })}
            className={styles.input}
          />
          <select
            value={editCustomer.group}
            onChange={(e) => setEditCustomer({ ...editCustomer, group: e.target.value })}
            className={styles.select}
          >
            {customerGroups.map(group => (
              <option key={group.value} value={group.value}>{group.label}</option>
            ))}
          </select>
          <button onClick={updateCustomer} className={styles.button}>Lưu thay đổi</button>
          <button onClick={() => setEditCustomer(null)} className={styles.cancelButton}>Hủy</button>
        </div>
      )}

      {/* Filter and search */}
      <div className={styles.filterContainer}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Lọc theo nhóm:</label>
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Tất cả khách hàng</option>
            {customerGroups.map(group => (
              <option key={group.value} value={group.value}>
                {group.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Customers table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>ID</th>
            <th className={styles.th}>Tên khách hàng</th>
            <th className={styles.th}>Số điện thoại</th>
            <th className={styles.th}>Email</th>
            <th className={styles.th}>Nhóm</th>
            <th className={styles.th}>Tổng chi tiêu</th>
            <th className={styles.th}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map(customer => (
            <tr key={customer.id}>
              <td className={styles.td}>{customer.id}</td>
              <td className={styles.td}>{customer.name}</td>
              <td className={styles.td}>{customer.phone}</td>
              <td className={styles.td}>{customer.email || '—'}</td>
              <td className={styles.td}>
                <span
                  className={styles.groupBadge}
                  style={{ backgroundColor: getGroupColor(customer.group) }}
                >
                  {getGroupLabel(customer.group)}
                </span>
              </td>
              <td className={styles.td}>{getTotalSpent(customer.phone).toLocaleString()}đ</td>
              <td className={styles.td}>
                <button
                  onClick={() => viewCustomerDetails(customer)}
                  className={styles.viewButton}
                >
                  Chi tiết
                </button>
                <button
                  onClick={() => setEditCustomer(customer)}
                  className={styles.editButton}
                >
                  Sửa
                </button>
                <button
                  onClick={() => deleteCustomer(customer.id)}
                  className={styles.deleteButton}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Customer details modal */}
      {selectedCustomer && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <span className={styles.closeButton} onClick={() => setSelectedCustomer(null)}>&times;</span>
            <div className={styles.customerDetails}>
              <h2>Thông tin khách hàng</h2>
              <div className={styles.customerInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Tên:</span>
                  <span className={styles.infoValue}>{selectedCustomer.name}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Số điện thoại:</span>
                  <span className={styles.infoValue}>{selectedCustomer.phone}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Email:</span>
                  <span className={styles.infoValue}>{selectedCustomer.email || '—'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Địa chỉ:</span>
                  <span className={styles.infoValue}>{selectedCustomer.address || '—'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Nhóm:</span>
                  <span
                    className={`${styles.infoValue} ${styles.groupBadge}`}
                    style={{ backgroundColor: getGroupColor(selectedCustomer.group) }}
                  >
                    {getGroupLabel(selectedCustomer.group)}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Tổng chi tiêu:</span>
                  <span className={styles.infoValue}>{getTotalSpent(selectedCustomer.phone).toLocaleString()}đ</span>
                </div>
              </div>

              <h3>Lịch sử mua hàng</h3>
              <div className={styles.orderHistory}>
                {getCustomerOrderHistory(selectedCustomer.id).length > 0 ? (
                  <table className={styles.historyTable}>
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Ngày đặt</th>
                        <th>Sản phẩm</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCustomerOrderHistory(selectedCustomer.id).map(order => {
                        const product = products.find(p => p.id === order.productId);
                        return (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{formatDate(order.date)}</td>
                            <td>{product ? product.name : 'Không xác định'}</td>
                            <td>{order.total.toLocaleString()}đ</td>
                            <td>
                              <span
                                className={styles.statusBadge}
                                style={{
                                  backgroundColor:
                                    order.status === 'delivered' ? '#27ae60' :
                                      order.status === 'cancelled' ? '#e74c3c' :
                                        order.status === 'pending' ? '#f39c12' : '#3498db'
                                }}
                              >
                                {order.status === 'delivered' ? 'Đã giao' :
                                  order.status === 'cancelled' ? 'Đã hủy' :
                                    order.status === 'pending' ? 'Chờ xử lý' : 'Đang xử lý'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p className={styles.noOrders}>Khách hàng chưa có đơn hàng nào.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show message when no customers */}
      {filteredCustomers.length === 0 && (
        <div className={styles.noCustomers}>
          <p>Không tìm thấy khách hàng nào.</p>
        </div>
      )}
    </div>
  );
};

// Define prop types
CustomerManager.propTypes = {
  orders: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    customer: PropTypes.string.isRequired,
    productId: PropTypes.string.isRequired,
    total: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    phone: PropTypes.string,
    address: PropTypes.string,
    paymentMethod: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      productId: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      quantity: PropTypes.number.isRequired,
    }))
  })).isRequired,
  products: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  })).isRequired,
};

export default CustomerManager; 