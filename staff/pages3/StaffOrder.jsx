import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '/src/api/orderApi';
import { FaEdit } from 'react-icons/fa';
import StaffSidebar from './StaffSidebar';
import './StaffOrder.css';

const StaffOrderManager = () => {
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

    const handleUpdate = async (id, status) => {
        try {
            await updateOrderStatus(id, status);
            fetchOrders(); // Refresh orders after update
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái đơn hàng:', err);
        }
    };

    return (
        <>
            <StaffSidebar />
            <div className="container">
                <h2>Quản lý đơn hàng (Nhân viên)</h2>
                <table className="table">
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
                                        <button className="action-btn edit-btn" onClick={() => handleUpdate(order.id, 'shipped')}>
                                            <FaEdit /> Cập nhật trạng thái
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

export default StaffOrderManager;
