import React, { useEffect, useState } from 'react';
import { getAllOrders, deleteOrder } from '/src/api/orderApi';
import Swal from 'sweetalert2';
import Sidebar from './Sidebar';
import styles from './OrderManager.module.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

const ManagerOrder = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getAllOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng:', err);
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
        Swal.fire('Lỗi', 'Xóa thất bại!', 'error');
      }
    }
  };

  const handleUpdate = (id) => {
    console.log('Sửa đơn hàng:', id);
  };

  return (
    <>
      <Sidebar />
      <div className={`container ${styles.container}`}>
        <h2>Quản lý đơn hàng</h2>
        <table className={`table ${styles.table}`}>
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
                    <span className={`status-badge ${order.status === 'pending'
                      ? 'status-pending'
                      : order.status === 'delivered'
                        ? 'status-delivered'
                        : 'status-shipped'
                      }`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.totalAmount.toLocaleString()}đ</td>
                  <td>{order.isPrepaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
                  <td>{order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <button className="action-btn edit-btn" onClick={() => handleUpdate(order.id)}>
                      <FaEdit /> Sửa
                    </button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(order.id)}>
                      <FaTrash /> Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ManagerOrder;
