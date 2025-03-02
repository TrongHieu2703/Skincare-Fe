// src/pages/OrderHistory.jsx
import React, { useEffect, useState } from 'react';
import { getAllOrders, getOrderById } from '../api/orderApi'; // Nếu có endpoint lấy theo user thì dùng getOrderByUser, nhưng ở controller bạn dùng GET /api/order/user
import { useNavigate } from 'react-router-dom';
import "/src/styles/OrderHistory.css";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrders() {
      try {
        // Giả sử API: GET /api/Order/user trả về đơn hàng của user hiện tại
        const response = await getAllOrders(); // hoặc getOrdersByUser nếu có
        setOrders(response);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="order-history-page">
      <h1>Your Order History</h1>
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card" onClick={() => navigate(`/order/${order.id}`)}>
              <h3>Order #{order.id}</h3>
              <p>Status: {order.status}</p>
              <p>Total: {(order.totalAmount / 23000).toFixed(2)} USD</p>
              <p>Updated At: {new Date(order.updatedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
