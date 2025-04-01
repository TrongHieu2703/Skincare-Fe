// src/pages/OrderDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getOrderDetail } from '../api/orderApi';
import { getProductById } from '../api/productApi';
import { getReviewsByProductId, getReviewById, checkReviewExistsByOrderItem } from '../api/reviewApi';
import { useAuth } from '../auth/AuthProvider';
import '/src/styles/OrderDetails.css';
import { formatProductImageUrl } from "../utils/imageUtils";
import ReviewModal from '../components/ReviewModal';
import ViewReviewModal from '../components/ViewReviewModal';

const OrderDetails = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [reviewedProducts, setReviewedProducts] = useState([]);
  const [userReviews, setUserReviews] = useState({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isViewReviewModalOpen, setIsViewReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  const orderIdToFetch = orderId || (location.state && location.state.orderId);

  useEffect(() => {
    // Only redirect if auth is not loading and user is not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    // Only fetch order details if authenticated and auth loading is complete
    if (isAuthenticated && !authLoading) {
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
          setOrder(orderData);

          // Check for any existing reviews for this order's products
          if (orderData && orderData.items && orderData.items.length > 0) {
            await fetchProductReviews(orderData.items);
          }
        } catch (err) {
          console.error("Error fetching order details:", err);
          setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
        } finally {
          setLoading(false);
        }
      };

      fetchOrderDetails();
    }
  }, [orderIdToFetch, isAuthenticated, navigate, location, authLoading]);

  // Fetch product reviews to check which products the user has already reviewed
  const fetchProductReviews = async (orderItems) => {
    if (!user || !user.id) {
      return;
    }

    try {
      // Tạo mảng mới để lưu trữ kết quả
      const reviewedProductIds = [];
      const reviewsData = {};

      // Check each order item directly with API endpoint
      for (const item of orderItems) {
        const orderItemId = Number(item.id);

        try {
          const reviewCheck = await checkReviewExistsByOrderItem(orderItemId);

          if (reviewCheck.exists && reviewCheck.review) {
            // Add to list of reviewed products (as Number for consistency)
            reviewedProductIds.push(orderItemId);

            // Store review data with string key (for consistent object access)
            const reviewKey = String(orderItemId);
            reviewsData[reviewKey] = reviewCheck.review;
          }
        } catch (error) {
          console.error(`Error checking review for order item ${orderItemId}:`, error);
        }
      }

      // Directly update state (both at once to maintain consistency)
      setReviewedProducts(reviewedProductIds);
      setUserReviews(reviewsData);
    } catch (error) {
      console.error("Error checking product reviews:", error);
    }
  };

  // Sử dụng một useEffect riêng để đảm bảo khi token thay đổi, fetch lại review
  useEffect(() => {
    const token = localStorage.getItem('token');

    // Nếu đã có token và đã có order data, refetch reviews
    if (token && order && order.items && order.items.length > 0) {
      fetchProductReviews(order.items);
    }
  }, []);  // Chỉ chạy 1 lần khi component mount

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

  // Function to directly check specific order items
  const forceCheckOrderItem = async (orderItemId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      // Use fetch API directly to bypass any potential issues with axiosClient
      const response = await fetch(`https://localhost:7290/api/Review/order-item/${orderItemId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data.exists && data.data) {
        // Update state directly
        setReviewedProducts(prevItems => {
          if (!prevItems.includes(Number(orderItemId))) {
            return [...prevItems, Number(orderItemId)];
          }
          return prevItems;
        });

        setUserReviews(prev => {
          const key = String(orderItemId);
          if (!(key in prev)) {
            return { ...prev, [key]: data.data };
          }
          return prev;
        });

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(`Error checking review for item ${orderItemId}:`, error);
      return false;
    }
  };

  // Effect để force check các order items sau khi component mount hoàn toàn
  useEffect(() => {
    // Chỉ chạy khi đã có order data và order.items
    if (order && order.items && order.items.length > 0 && isAuthenticated && !authLoading) {
      // Đợi 1 giây để đảm bảo mọi thứ đã load xong
      const timer = setTimeout(async () => {
        // Kiểm tra từng order item
        for (const item of order.items) {
          await forceCheckOrderItem(item.id);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [order, isAuthenticated, authLoading]);

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
      case 'delivered':
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

  const getStatusLabel = (status) => {
    if (!status) return "Đang xử lý";
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered": return "Đã giao hàng";
      case "shipped": return "Đang giao hàng";
      case "processing": return "Đang xử lý";
      case "confirmed": return "Đã xác nhận";
      case "cancelled": return "Đã hủy";
      case "pending": return "Chờ xử lý";
      default: return status;
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

  const navigateToProductDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleReviewProduct = (item) => {
    setSelectedProduct(item);
    setIsReviewModalOpen(true);
  };

  const handleViewReview = (item) => {
    // Convert to number for consistent lookup
    const numericItemId = Number(item.id);

    // Look up review using string key for object access
    const stringKey = String(numericItemId);
    const reviewData = userReviews[stringKey];

    if (reviewData) {
      setSelectedProduct(item);
      setSelectedReview(reviewData);
      setIsViewReviewModalOpen(true);
    } else {
      console.error(`No review data found for item ${numericItemId}`);
    }
  };

  const handleReviewSubmitted = (reviewData) => {
    // Make sure we have the proper data
    if (reviewData && selectedProduct) {
      // Convert to number to ensure consistent types
      const itemId = Number(selectedProduct.id);

      // Add the reviewed product to the list if not already there
      setReviewedProducts(prev => {
        if (prev.includes(itemId)) {
          return prev;
        }
        return [...prev, itemId];
      });

      // Also add the review data to userReviews
      setUserReviews(prev => ({
        ...prev,
        [itemId]: reviewData
      }));

      // Refresh the review data for all products to ensure our state is updated
      if (order && order.items) {
        setTimeout(() => {
          fetchProductReviews(order.items);
        }, 1000); // Give the backend a second to process the new review
      }
    }
  };

  const isOrderDeliveredOrCompleted = () => {
    if (!order || !order.status) return false;
    const status = order.status.toLowerCase();
    return status === 'completed' || status === 'delivered';
  };

  const canReviewProduct = (item) => {
    // Only allow reviews for delivered/completed orders and products not already reviewed
    return isOrderDeliveredOrCompleted() && !reviewedProducts.includes(item.id);
  };

  const isProductReviewed = (itemId) => {
    // Convert to number for consistent comparison
    const numericItemId = Number(itemId);

    // Kiểm tra trong reviewedProducts array
    const isReviewed = reviewedProducts.includes(numericItemId);

    // Kiểm tra cả trong userReviews object (backup check)
    const stringKey = String(numericItemId);
    const hasReviewData = stringKey in userReviews;

    // Return true nếu có trong reviewedProducts array hoặc trong userReviews object
    return isReviewed || hasReviewData;
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
              {getStatusLabel(order.status)}
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
                {isOrderDeliveredOrCompleted() && (
                  <div className="item-col action-col">Đánh giá</div>
                )}
              </div>

              <div className="order-items-body">
                {order.items && order.items.map((item, index) => {
                  const product = getProductInfo(item.productId);
                  const productImage = item.productImage || 'placeholder.jpg';
                  const imageUrl = formatProductImageUrl(productImage);

                  // Kiểm tra review status cho mỗi item
                  const itemId = Number(item.id);
                  const hasBeenReviewed = isProductReviewed(itemId);

                  return (
                    <div className="order-item-row" key={index}>
                      <div className="item-col product-col">
                        <div
                          className="product-info"
                          onClick={() => navigateToProductDetails(item.productId)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className={`product-image ${!item.productImage ? 'placeholder' : ''}`}>
                            <img
                              src={imageUrl}
                              alt={item.productName}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/src/assets/images/aboutus.jpg";
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
                      {isOrderDeliveredOrCompleted() && (
                        <div className="item-col action-col">
                          {hasBeenReviewed ? (
                            <button
                              className="review-product-btn view-review"
                              onClick={() => handleViewReview(item)}
                            >
                              Xem đánh giá
                            </button>
                          ) : (
                            <button
                              className="review-product-btn"
                              onClick={() => handleReviewProduct(item)}
                            >
                              Đánh giá
                            </button>
                          )}
                        </div>
                      )}
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
                  <span>
                    {formatPrice(
                      (order.totalPrice || 0) + 30000 - (order.discountPrice || 0)
                    )}
                  </span>
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

      {/* Review Modal */}
      {selectedProduct && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          productId={selectedProduct.productId}
          orderId={order.id}
          orderItemId={selectedProduct.id}
          productName={selectedProduct.productName}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* View Review Modal */}
      {selectedReview && (
        <ViewReviewModal
          isOpen={isViewReviewModalOpen}
          onClose={() => {
            setIsViewReviewModalOpen(false);
            setSelectedReview(null); // Clear selected review when closing modal
          }}
          review={selectedReview}
          productName={selectedProduct?.productName}
        />
      )}
    </div>
  );
};

export default OrderDetails;
