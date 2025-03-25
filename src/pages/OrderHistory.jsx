// src/pages/OrderHistory.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrdersByUser } from "../api/orderApi";
import { getProductById } from "../api/productApi";
import { useAuth } from "../auth/AuthProvider";
import { FaShoppingBag, FaClock, FaSpinner, FaTruck, FaCheck, FaExclamationCircle, FaCalendarAlt, FaShoppingCart, FaFilter, FaSort, FaSearch } from "react-icons/fa";
import "/src/styles/OrderHistoryV2.css";
import { formatProductImageUrl, handleImageError } from "../utils/imageUtils";

// This component has been redesigned with an improved layout that prevents navbar overlap
const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
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
        const ordersData = await getOrdersByUser();
        console.log("Orders data received:", ordersData);
        
        if (Array.isArray(ordersData)) {
          // Sort orders by updatedAt date, most recent first
          const sortedOrders = [...ordersData].sort((a, b) => 
            new Date(b.updatedAt) - new Date(a.updatedAt)
          );
          setOrders(sortedOrders);
          setFilteredOrders(sortedOrders);
          
          // Fetch product details for items with missing info
          const productIds = new Set();
          sortedOrders.forEach(order => {
            if (order.orderItems) {
              order.orderItems.forEach(item => {
                if (item.productId && (!item.productPrice || item.productPrice === 0)) {
                  productIds.add(item.productId);
                }
              });
            }
          });
          
          fetchProductDetails(Array.from(productIds));
        } else {
          console.error("Expected an array of orders but received:", ordersData);
          setOrders([]);
          setFilteredOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...orders];
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(order => 
        order.status && order.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(order => {
        // Search by order ID
        if (order.id.toString().includes(term)) return true;
        
        // Search by product name
        if (order.orderItems && order.orderItems.some(item => 
          item.productName && item.productName.toLowerCase().includes(term)
        )) return true;
        
        return false;
      });
    }
    
    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
        break;
      case "highest-price":
        result.sort((a, b) => b.totalAmount - a.totalAmount);
        break;
      case "lowest-price":
        result.sort((a, b) => a.totalAmount - b.totalAmount);
        break;
      default:
        break;
    }
    
    setFilteredOrders(result);
  }, [orders, statusFilter, sortBy, searchTerm]);
  
  // Fetch product details for products with missing info
  const fetchProductDetails = async (productIds) => {
    if (!productIds.length) return;
    
    const details = { ...productDetails };
    
    for (const id of productIds) {
      if (!details[id]) {
        try {
          const product = await getProductById(id);
          if (product) {
            details[id] = {
              name: product.name,
              price: product.price,
              image: product.image
            };
          }
        } catch (err) {
          console.error(`Error fetching details for product ${id}:`, err);
        }
      }
    }
    
    setProductDetails(details);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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
    }).format(price || 0);
  };

  const handleViewOrderDetails = (orderId) => {
    if (orderId) {
      navigate(`/order/${orderId}`);
    } else {
      console.error("Invalid orderId:", orderId);
    }
  };

  const getStatusClass = (status) => {
    if (!status) return "pending";
    switch (status.toLowerCase()) {
      case "completed": 
      case "delivered": return "completed";
      case "shipped": return "shipped";
      case "processing": return "processing";
      case "confirmed": return "confirmed";
      case "cancelled": return "cancelled";
      default: return "pending";
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

  const getStatusIcon = (status) => {
    if (!status) return <FaSpinner />;
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered": return <FaCheck />;
      case "shipped": return <FaTruck />;
      case "processing": return <FaSpinner />;
      case "confirmed": return <FaCheck />;
      case "cancelled": return <FaExclamationCircle />;
      default: return <FaSpinner />;
    }
  };

  // Get placeholder image path for when product image is missing
  const getPlaceholderImage = () => {
    return "/src/assets/images/placeholder.png";
  };

  // Get product data from order item
  const getProductData = (item) => {
    // Check if we have fetched detailed product information
    const productDetail = productDetails[item.productId];
    
    // Determine the image source with proper fallbacks
    let imageSource = null;
    if (item.productImage && item.productImage !== "") {
      imageSource = item.productImage;
      console.log(`Using image from order item: ${imageSource}`);
    } else if (productDetail?.image) {
      imageSource = productDetail.image;
      console.log(`Using image from product details: ${imageSource}`);
    } else {
      imageSource = getPlaceholderImage();
      console.log(`Using placeholder image: ${imageSource}`);
    }
    
    // Safely extract product data with fallbacks
    return {
      id: item.productId || 0,
      name: item.productName || (productDetail?.name) || `Sản phẩm #${item.productId}`,
      price: item.productPrice || (productDetail?.price) || 0,
      quantity: item.itemQuantity || 1,
      image: imageSource
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="orderv2-page">
        <div className="orderv2-loading">
          <FaSpinner className="loading-spinner" />
          <p>Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="orderv2-page">
        <div className="orderv2-error">
          <FaExclamationCircle className="error-icon" />
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="orderv2-page">
        <div className="orderv2-empty">
          <FaShoppingBag className="empty-icon" />
          <h2>Chưa có đơn hàng nào</h2>
          <p>Bạn chưa có đơn hàng nào trong lịch sử mua sắm</p>
          <button onClick={() => navigate("/product-list")} className="shop-now-button">
            Mua sắm ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orderv2-page">
      <div className="orderv2-content">
        <div className="orderv2-header">
          <div className="header-icon">
            <FaShoppingBag />
          </div>
          <div className="header-text">
            <h1>Lịch sử đơn hàng</h1>
            <p>Theo dõi và quản lý đơn hàng của bạn</p>
          </div>
        </div>

        {/* Add filters and sorting controls */}
        <div className="orderv2-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hoặc tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-sort-controls">
            <div className="filter-dropdown">
              <div className="dropdown-label">
                <FaFilter />
                <span>Lọc theo trạng thái:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tất cả đơn hàng</option>
                <option value="pending">Chờ xử lý</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipped">Đang giao hàng</option>
                <option value="delivered">Đã giao hàng</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
            
            <div className="sort-dropdown">
              <div className="dropdown-label">
                <FaSort />
                <span>Sắp xếp theo:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="highest-price">Giá cao nhất</option>
                <option value="lowest-price">Giá thấp nhất</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders count indicator */}
        <div className="order-count">
          Hiển thị {filteredOrders.length} / {orders.length} đơn hàng
        </div>

        {/* Filtered orders warning */}
        {filteredOrders.length === 0 && (
          <div className="no-matching-orders">
            <FaExclamationCircle />
            <p>Không tìm thấy đơn hàng nào phù hợp với bộ lọc. Vui lòng thử lại với điều kiện khác.</p>
            <button onClick={() => {
              setStatusFilter('all');
              setSortBy('newest');
              setSearchTerm('');
            }} className="reset-filters-button">
              Xóa bộ lọc
            </button>
          </div>
        )}

        <div className="orderv2-list">
          {filteredOrders.map((order) => {
            // Safely extract data from order with fallbacks
            const totalAmount = order.totalAmount || 0;
            const items = order.orderItems || [];
            const shippingFee = order.shippingFee ?? 30000;
            const subtotal = order.subtotal ?? totalAmount - shippingFee;
            const orderDate = order.updatedAt || new Date();
            const status = order.status || "pending";
            const discount = order.discountPrice || 0;

            return (
              <div key={order.id} className="orderv2-card">
                <div className="orderv2-card-header">
                  <div className="order-info">
                    <div className="order-number">
                      Đơn hàng <span className="order-id">#{order.id}</span>
                    </div>
                    <div className="order-date">
                      <FaCalendarAlt />
                      <span>{formatDate(orderDate)}</span>
                    </div>
                  </div>
                  <div className={`order-status ${getStatusClass(status)}`}>
                    {getStatusIcon(status)}
                    <span>{getStatusLabel(status)}</span>
                  </div>
                </div>

                <div className="orderv2-card-content">
                  <div className="orderv2-products">
                    {items.slice(0, 2).map((item, index) => {
                      const product = getProductData(item);
                      
                      return (
                        <div key={index} className="product-item">
                          <div className="product-image">
                            <img
                              src={formatProductImageUrl(product.image)}
                              alt={product.name}
                              onError={(e) => handleImageError(e)}
                              loading="lazy"
                              data-product-id={product.id}
                            />
                          </div>
                          <div className="product-details">
                            <p className="product-name">{product.name}</p>
                            <div className="product-meta">
                              <span className="product-quantity">x{product.quantity}</span>
                              <span className="product-price">
                                {formatPrice(product.price)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {items.length > 2 && (
                      <div className="more-items">
                        +{items.length - 2} sản phẩm khác
                      </div>
                    )}
                  </div>

                  <div className="orderv2-summary">
                    <div className="order-breakdown">
                      <div className="price-row">
                        <span>Tạm tính:</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="price-row discount">
                          <span>Giảm giá:</span>
                          <span>-{formatPrice(discount)}</span>
                        </div>
                      )}
                      <div className="price-row">
                        <span>Phí vận chuyển:</span>
                        <span>{formatPrice(shippingFee)}</span>
                      </div>
                      <div className="price-row total">
                        <strong>Tổng cộng:</strong>
                        <strong>{formatPrice(totalAmount)}</strong>
                      </div>
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
    </div>
  );
};

export default OrderHistory;