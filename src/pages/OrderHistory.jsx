// src/pages/OrderHistory.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrdersByUser } from "../api/orderApi"; // Sử dụng hàm mới
import { useAuth } from "../auth/AuthProvider";
import { FaShoppingBag, FaCalendarAlt, FaBox, FaClock } from "react-icons/fa";
import "/src/styles/OrderHistory.css";
import { formatProductImageUrl, handleImageError } from "../utils/imageUtils";

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

  // Function to get class for status badge
  const getStatusClass = (status) => {
    if (!status) return "pending";
    
    switch (status.toLowerCase()) {
      case "completed":
        return "completed";
      case "shipped":
        return "shipped";
      case "processing":
        return "processing";
      case "cancelled":
        return "cancelled";
      default:
        return "pending";
    }
  };

  // Function to get human-readable status label
  const getStatusLabel = (status) => {
    if (!status) return "Đang xử lý";
    
    switch (status.toLowerCase()) {
      case "completed":
        return "Hoàn thành";
      case "shipped":
        return "Đang giao hàng";
      case "processing":
        return "Đang xử lý";
      case "cancelled":
        return "Đã hủy";
      case "pending":
        return "Chờ xử lý";
      default:
        return status;
    }
  };

  if (loading) {
    return <div>Đang tải đơn hàng...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (orders.length === 0) {
    return <div>Chưa có đơn hàng nào</div>;
  }

  return (
    <div className="order-history-page">
      <div className="order-history-header">
        <div className="header-icon">
          <FaShoppingBag />
        </div>
        <div className="header-text">
          <h1>Lịch sử đơn hàng</h1>
          <p>Theo dõi đơn hàng của bạn</p>
        </div>
      </div>

      <div className="orders-container">
        {orders.map((order) => {
          const totalAmount = order.totalAmount || 0;
          const items = order.items || order.orderItems || [];
          return (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-info">
                  <div className="order-number">
                    Đơn hàng <span className="order-id">#{order.id}</span>
                  </div>
                  <div className="order-date">
                    <FaClock />
                    <span>{formatDate(order.updatedAt)}</span>
                  </div>
                </div>
                <div className={`order-status ${getStatusClass(order.status)}`}>
                  {getStatusLabel(order.status)}
                </div>
              </div>

              <div className="order-card-content">
                <div className="order-products">
                  {items.map((item, index) => {
                    const productImage = item.productImage || "../src/assets/images/aboutus.jpg"; // Fallback if no image
                    return (
                      <div key={index} className="product-item">
                        <div className="product-image">
                          <img 
                            src={formatProductImageUrl(productImage)} 
                            alt={item.productName} 
                            onError={handleImageError} // Use the error handler
                          />
                        </div>
                        <div className="product-details">
                          <p className="product-name">
                            {item.productName || (item.product && item.product.name) || `Sản phẩm #${item.productId}`}
                          </p>
                          <div className="product-meta">
                            <span className="product-quantity">x{item.itemQuantity}</span>
                            <span className="product-price">
                              {formatPrice(item.productPrice || (item.product && item.product.price) || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {items.length > 1 && (
                    <div className="more-items">
                      +{items.length - 1} sản phẩm khác
                    </div>
                  )}
                </div>

                <div className="order-summary">
                  <div className="order-total">
                    <span className="total-label">Tổng tiền:</span>
                    <span className="total-amount">{formatPrice(totalAmount)}</span>
                  </div>
                  <button
                    className="detail-button"
                    onClick={() => handleViewOrderDetails(order.id)}
                  >
                    CHI TIẾT
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistory;
