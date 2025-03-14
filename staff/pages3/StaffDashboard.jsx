import React, { useEffect, useState } from 'react';
import { getAllOrders } from '/src/api/orderApi';
import StaffSidebar from './StaffSidebar';
import './StaffDashboard.css';

const StaffDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await getAllOrders();
            setOrders(res.data || []);
        } catch (err) {
            console.error('Lỗi khi tải đơn hàng:', err);
        } finally {
            setLoading(false);
        }
    };

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;

    return (
        <>
            <StaffSidebar />
            <div className="dashboard-container">
                <h2>Tổng quan hệ thống</h2>
                {loading ? (
                    <p>Đang tải dữ liệu...</p>
                ) : (
                    <div className="dashboard-stats">
                        <div className="stat-card">
                            <h3>Tổng đơn hàng</h3>
                            <p>{totalOrders}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Tổng doanh thu</h3>
                            <p>{totalRevenue.toLocaleString()}đ</p>
                        </div>
                        <div className="stat-card">
                            <h3>Đơn hàng đang chờ</h3>
                            <p>{pendingOrders}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Đơn hàng đã giao</h3>
                            <p>{deliveredOrders}</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default StaffDashboard;
