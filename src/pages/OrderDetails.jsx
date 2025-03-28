// src/pages/OrderDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getOrderDetail } from '../api/orderApi';
import { getProductById } from '../api/productApi';
import { useAuth } from '../auth/AuthProvider';
import '/src/styles/OrderDetails.css';
import { formatProductImageUrl } from "../utils/imageUtils";

const OrderDetails = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  const orderIdToFetch = orderId || (location.state && location.state.orderId);

  console.log("OrderDetails component - orderId from params:", orderId);
  console.log("OrderDetails component - location state:", location.state);
  console.log("OrderDetails component - orderIdToFetch:", orderIdToFetch);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!orderIdToFetch) {
          setError('Không tìm thấy mã đơn hàng');
          setLoading(false);
          return;
        }

        const orderData = await getOrderDetail(orderIdToFetch);
        console.log("Order data received:", orderData);
        setOrder(orderData);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderIdToFetch, isAuthenticated, navigate, location]);

  useEffect(() => {
    if (order && order.items && order.items.length > 0) {
      const fetchProductDetails = async () => {
        const details = {};

        for (const item of order.items) {
          try {
            const product = await getProductById(item.productId);
            details[item.productId] = product;
          } catch (err) {
            details[item.productId] = {
              name: `Sản phẩm #${item.productId}`,
              price: order.totalPrice / order.items.reduce((acc, i) => acc + i.itemQuantity, 0)
            };
          }
        }

        setProductDetails(details);
      };

      fetchProductDetails();
    }
  }, [order]);

  useEffect(() => {
    if (location.state && location.state.paymentSuccess) {
      setShowPaymentSuccess(true);

      const timer = setTimeout(() => {
        setShowPaymentSuccess(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'shipped':
        return 'status-processing';
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handlePrintOrder = () => {
    window.print();
  };

  const navigateToProducts = () => {
    navigate('/product-list');
  };

  const navigateToHome = () => {
    navigate('/');
  };

  const getProductInfo = (productId) => {
    return productDetails[productId] || {
      name: `Sản phẩm #${productId}`,
      price: order?.totalPrice / order?.items.reduce((acc, item) => acc + item.itemQuantity, 0) || 0
    };
  };

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-details-page">
        <div className="error-container">
          <h2>Lỗi</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={navigateToHome}>Quay về trang chủ</button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-page">
        <div className="error-container">
          <h2>Không tìm thấy đơn hàng</h2>
          <p>Đơn hàng không tồn tại hoặc bạn không có quyền xem.</p>
          <button className="btn-primary" onClick={navigateToHome}>Quay về trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-details-page">
      {showPaymentSuccess && (
        <div className="payment-success-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-check-circle"></i>
            Đặt hàng thành công! Cảm ơn bạn đã mua sắm.
          </div>
          <button
            onClick={() => setShowPaymentSuccess(false)}
            className="close-button"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="order-details-container">
        <div className="order-header">
          <div className="order-title">
            <h1>Chi tiết đơn hàng #{order.id}</h1>
            <span className={`order-status ${getStatusClass(order.status)}`}>
              {order.status || 'Đang xử lý'}
            </span>
          </div>
          <div className="order-date">
            <p>Đặt hàng ngày: {formatDate(order.updatedAt || new Date())}</p>
          </div>
        </div>

        <div className="order-body">
          <div className="order-info-grid">
            <div className="info-card">
              <h3>Thông tin khách hàng</h3>
              <div className="info-content">
                <p><strong>Tên khách hàng:</strong> {order.customer?.username || ''}</p>
                <p><strong>Email:</strong> {order.customer?.email || 'Email không có sẵn'}</p>
                <p><strong>Số điện thoại:</strong> {order.customer?.phoneNumber || ''}</p>
              </div>
            </div>

            <div className="info-card">
              <h3>Thông tin giao hàng</h3>
              <div className="info-content">
                <p><strong>Địa chỉ:</strong> {order.customer?.address || ''}</p>
                <p><strong>Phương thức vận chuyển:</strong> Giao hàng tiêu chuẩn</p>
                <p><strong>Trạng thái:</strong> {order.status === 'Completed' ? 'Đã giao hàng' : order.status === 'Shipped' ? 'Đang giao hàng' : 'Đang xử lý'}</p>
              </div>
            </div>

            <div className="info-card">
              <h3>Thông tin thanh toán</h3>
              <div className="info-content">
                <p>
                  <strong>Phương thức thanh toán:</strong>{' '}
                  {order.payment?.paymentMethod === 'Cash'
                    ? 'Tiền mặt khi nhận hàng (COD)'
                    : order.payment?.paymentMethod === 'Credit'
                      ? 'Thẻ tín dụng (Credit Card)'
                      : order.payment?.paymentMethod === 'Bank'
                        ? 'Chuyển khoản (PayPal)'
                        : order.payment?.paymentMethod || 'Không có thông tin'
                  }
                </p>
                <p>
                  <strong>Trạng thái thanh toán:</strong>{' '}
                  {order.payment?.status === 'Paid' ? 'Đã thanh toán' :
                    order.isPrepaid ? 'Đang xử lý thanh toán' : 'Thanh toán khi nhận hàng'}
                </p>
                {order.payment?.createdDate && (
                  <p>
                    <strong>Ngày thanh toán:</strong> {formatDate(order.payment.createdDate)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="order-items">
            <h3>Sản phẩm đã đặt</h3>
            <div className="order-items-table">
              <div className="order-items-header">
                <div className="item-col product-col">Sản phẩm</div>
                <div className="item-col quantity-col">Số lượng</div>
                <div className="item-col price-col">Đơn giá</div>
                <div className="item-col total-col">Thành tiền</div>
              </div>

              <div className="order-items-body">
                {order.items && order.items.map((item, index) => {
                  const product = getProductInfo(item.productId);
                  const productImage = item.productImage || 'placeholder.jpg';
                  const imageUrl = formatProductImageUrl(productImage);

                  return (
                    <div className="order-item-row" key={index}>
                      <div className="item-col product-col">
                        <div className="product-info">
                          <div className={`product-image ${!item.productImage ? 'placeholder' : ''}`}>
                            <img
                              src={imageUrl}
                              alt={item.productName}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder.png";
                              }}
                            />
                          </div>
                          <div className="product-details">
                            <p className="product-name">{item.productName}</p>
                            <p className="product-id">Mã: SP{item.productId}</p>
                          </div>
                        </div>
                      </div>
                      <div className="item-col quantity-col">{item.itemQuantity}</div>
                      <div className="item-col price-col">
                        {formatPrice(item.productPrice)}
                      </div>
                      <div className="item-col total-col">
                        {formatPrice(item.productPrice * item.itemQuantity)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="order-summary-section">
            <div className="order-actions">
              <button className="btn-secondary" onClick={handlePrintOrder}>
                In đơn hàng
              </button>
              <button className="btn-primary" onClick={navigateToProducts}>
                Tiếp tục mua sắm
              </button>
            </div>

            <div className="order-summary">
              <h3>Tổng cộng</h3>
              <div className="summary-details">
                <div className="summary-row">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(order.totalPrice || 0)}</span>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển:</span>
                  <span>{formatPrice(30000)}</span>
                </div>
                {order.discountPrice && order.discountPrice > 0 && (
                  <div className="summary-row discount">
                    <span>Giảm giá:</span>
                    <span>-{formatPrice(order.discountPrice)}</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Tổng thanh toán:</span>
                  <span>{formatPrice(order.totalAmount || (order.totalPrice + 30000))}</span>
                </div>

                {order.voucher && (
                  <div className="voucher-info">
                    <p>
                      <strong>Voucher áp dụng:</strong>
                      <span className="voucher-code">{order.voucher.code}</span>
                      <span className="voucher-value">
                        {order.voucher.isPercent
                          ? `(Giảm ${order.voucher.value}%)`
                          : `(Giảm ${formatPrice(order.voucher.value)})`}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
