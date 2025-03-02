import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getOrderById, getOrderDetail } from '../api/orderApi';
import { getProductById } from '../api/productApi';
import { useAuth } from '../auth/AuthProvider';
import '/src/styles/OrderDetails.css';

const OrderDetails = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [productDetails, setProductDetails] = useState({});
  
  // Lấy thông tin đơn hàng từ location state (nếu từ trang payment) hoặc từ API
  const orderIdToFetch = orderId || (location.state && location.state.orderId);
  
  // Thêm state để hiển thị thông báo thanh toán thành công
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  
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
        
        console.log(`Fetching order details for ID: ${orderIdToFetch}`);
        const orderData = await getOrderDetail(orderIdToFetch);
        console.log('Order data received:', orderData);
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderIdToFetch, isAuthenticated, navigate, location]);
  
  useEffect(() => {
    if (order && order.orderItems && order.orderItems.length > 0) {
      const fetchProductDetails = async () => {
        const details = {};
        
        for (const item of order.orderItems) {
          try {
            const product = await getProductById(item.productId);
            details[item.productId] = product;
          } catch (err) {
            console.error(`Error fetching product #${item.productId}:`, err);
            details[item.productId] = { 
              name: `Sản phẩm #${item.productId}`,
              price: order.totalPrice / order.orderItems.reduce((acc, i) => acc + i.itemQuantity, 0)
            };
          }
        }
        
        setProductDetails(details);
      };
      
      fetchProductDetails();
    }
  }, [order]);
  
  // Lấy thông tin thanh toán thành công từ location state
  useEffect(() => {
    if (location.state && location.state.paymentSuccess) {
      setShowPaymentSuccess(true);
      
      // Ẩn thông báo sau 5 giây
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
  
  const getPaymentStatusText = (isPrepaid, transactions) => {
    if (!transactions || transactions.length === 0) return 'Chưa thanh toán';
    
    const lastTransaction = transactions[transactions.length - 1];
    if (lastTransaction.status?.toLowerCase() === 'completed') return 'Đã thanh toán';
    if (isPrepaid) return 'Đang xử lý thanh toán';
    return 'Thanh toán khi nhận hàng';
  };
  
  const formatPrice = (price) => {
    return `$${(price / 23000).toFixed(2)}`;
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
      price: order?.totalPrice / order?.orderItems.reduce((acc, item) => acc + item.itemQuantity, 0) || 0
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
          <i className="fas fa-check-circle"></i>
          Thanh toán thành công! Cảm ơn bạn đã đặt hàng.
          <button className="close-button" onClick={() => setShowPaymentSuccess(false)}>
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
            <div className="customer-info info-card">
              <h3>Thông tin khách hàng</h3>
              <div className="info-content">
                <p><strong>Tên khách hàng:</strong> {order.customerInfo?.username || ''}</p>
                <p><strong>Email:</strong> {order.customerInfo?.email || ''}</p>
                <p><strong>Số điện thoại:</strong> {order.customerInfo?.phoneNumber || ''}</p>
              </div>
            </div>
            
            <div className="shipping-info info-card">
              <h3>Thông tin giao hàng</h3>
              <div className="info-content">
                <p><strong>Địa chỉ:</strong> {order.customerInfo?.address || ''}</p>
                <p><strong>Phương thức vận chuyển:</strong> Giao hàng tiêu chuẩn</p>
                <p><strong>Trạng thái:</strong> {order.status === 'Completed' ? 'Đã giao hàng' : 'Đang xử lý'}</p>
              </div>
            </div>
            
            <div className="payment-info info-card">
              <h3>Thông tin thanh toán</h3>
              <div className="info-content">
                <p>
                  <strong>Phương thức thanh toán:</strong> 
                  {order.paymentInfo?.paymentMethod === 'Cash' 
                    ? 'Tiền mặt khi nhận hàng (COD)' 
                    : order.paymentInfo?.paymentMethod === 'Credit' 
                      ? 'Thẻ tín dụng (Credit Card)'
                      : order.paymentInfo?.paymentMethod === 'Bank'
                        ? 'Chuyển khoản (PayPal)'
                        : order.paymentInfo?.paymentMethod || 'Không có thông tin'
                  }
                </p>
                <p>
                  <strong>Trạng thái thanh toán:</strong> 
                  {order.paymentInfo?.status === 'Completed' ? 'Đã thanh toán' : 
                   order.isPrepaid ? 'Đang xử lý thanh toán' : 'Thanh toán khi nhận hàng'}
                </p>
                {order.paymentInfo?.createdDate && (
                  <p>
                    <strong>Ngày thanh toán:</strong> {formatDate(order.paymentInfo.createdDate)}
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
                {order.orderItems && order.orderItems.map((item, index) => {
                  const product = getProductInfo(item.productId);
                  return (
                    <div className="order-item-row" key={index}>
                      <div className="item-col product-col">
                        <div className="product-info">
                          <div className={`product-image ${!item.productImage ? 'placeholder' : ''}`}>
                            {item.productImage ? 
                              <img src={item.productImage} alt={item.productName} /> : 
                              <i className="fas fa-box"></i>
                            }
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
            </div>
          </div>
          
          {/* Hiển thị voucher nếu có */}
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
        
        <div className="order-actions">
          <button className="btn-secondary" onClick={handlePrintOrder}>
            In đơn hàng
          </button>
          <button className="btn-primary" onClick={navigateToProducts}>
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
