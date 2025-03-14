// src/pages/OrderHistory.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrdersByUser } from "../api/orderApi"; // Sử dụng hàm mới
import { useAuth } from "../auth/AuthProvider";
import { FaShoppingBag, FaCalendarAlt, FaBox } from "react-icons/fa";
import "/src/styles/OrderHistory.css";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/order-history" } });
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Lấy danh sách đơn hàng của user
        const ordersData = await getOrdersByUser();
        console.log("API orders data:", ordersData); // Debug log
        if (Array.isArray(ordersData)) {
          setOrders(ordersData);
        } else {
          console.error("Expected an array of orders but received:", ordersData);
        }
      } catch (err) {
        setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleViewOrderDetails = (orderId) => {
    if (orderId) {
      navigate(`/order/${orderId}`);
    } else {
      console.error("Invalid orderId:", orderId);
    }
  };

  return (
    <div className="order-history-page">
      <div className="order-history-header">
        <h1>
          <FaShoppingBag /> Lịch sử đơn hàng
        </h1>
        <p>Theo dõi đơn hàng của bạn</p>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải đơn hàng...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-orders">
          <FaBox className="empty-icon" />
          <h2>Chưa có đơn hàng nào</h2>
          <p>Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!</p>
          <button onClick={() => navigate("/product-list")}>
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => {
            const totalAmount = order.totalAmount || 0;
            return (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-number">
                    <span className="label">Đơn hàng #</span>
                    <span className="value">{order.id}</span>
                  </div>
                  <div className={`order-status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </div>
                </div>

                <div className="order-date">
                  <FaCalendarAlt />
                  {formatDate(order.updatedAt)}
                </div>

                <div className="order-products">
                  {order.orderItems?.slice(0, 3).map((item, index) => (
                    <div key={index} className="product-item">
                      <img
                        src={item.product?.mainImage || "/placeholder.png"}
                        alt={item.product?.name}
                      />
                      <div className="product-details">
                        <p className="product-name">{item.product?.name}</p>
                        <span className="product-quantity">
                          x{item.itemQuantity}
                        </span>
                      </div>
                    </div>
                  ))}
                  {order.orderItems?.length > 3 && (
                    <div className="more-items">
                      +{order.orderItems.length - 3} sản phẩm khác
                    </div>
                  )}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span>Tổng tiền:</span>
                    <span className="amount">{formatPrice(totalAmount)}</span>
                  </div>
                  <button
                    className="view-detail-btn"
                    onClick={() => handleViewOrderDetails(order.id)}
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
