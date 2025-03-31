// src/pages/OrderHistory.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrdersByUser } from "../api/orderApi";
import { getProductById } from "../api/productApi";
import { getReviewsByProductId } from "../api/reviewApi";
import { useAuth } from "../auth/AuthProvider";
import { FaShoppingBag, FaClock, FaSpinner, FaTruck, FaCheck, FaExclamationCircle, FaCalendarAlt, FaShoppingCart, FaFilter, FaSort, FaSearch, FaCalendar, FaStar } from "react-icons/fa";
import "/src/styles/OrderHistoryV2.css";
import { formatProductImageUrl, handleImageError } from "../utils/imageUtils";

// This component has been redesigned with an improved layout that prevents navbar overlap
const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [paginatedOrders, setPaginatedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  // Add date filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  // Track reviewed products
  const [reviewedProducts, setReviewedProducts] = useState({});
  
  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 5,
    totalPages: 1,
    totalItems: 0
  });
  
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  useEffect(() => {
    // Only redirect if auth is not loading and user is not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { state: { from: "/order-history" } });
      return;
    }

    // Only fetch orders if authenticated and auth loading is complete
    if (isAuthenticated && !authLoading) {
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
            
            // Initialize pagination
            const totalItems = sortedOrders.length;
            const totalPages = Math.ceil(totalItems / pagination.pageSize);
            setPagination(prev => ({
              ...prev,
              totalItems,
              totalPages
            }));
            
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
            
            // Check for reviewed products in delivered orders
            const completedOrders = sortedOrders.filter(order => 
              order.status && (order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'delivered')
            );
            
            if (completedOrders.length > 0) {
              await checkReviewedProducts(completedOrders);
            }
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
    }
  }, [isAuthenticated, navigate, authLoading, user]);

  // Apply filters and pagination
  useEffect(() => {
    if (orders.length === 0) return;
    
    applyFiltersAndPagination();
  }, [orders, statusFilter, sortBy, searchTerm, startDate, endDate, pagination.currentPage, pagination.pageSize]);
  
  // Check which products have been reviewed by the user
  const checkReviewedProducts = async (completedOrders) => {
    if (!user || !user.id) return;
    
    try {
      const reviewedMap = {};
      
      for (const order of completedOrders) {
        if (order.orderItems && order.orderItems.length > 0) {
          for (const item of order.orderItems) {
            const productId = item.productId;
            
            if (productId) {
              const reviews = await getReviewsByProductId(productId);
              
              if (reviews && reviews.data) {
                // Check if this user has already reviewed this product for this specific order item
                const hasReviewed = reviews.data.some(
                  review => review.customerId === user.id && review.orderDetailId === item.id
                );
                
                // Store the review status by order item ID
                reviewedMap[item.id] = hasReviewed;
              }
            }
          }
        }
      }
      
      setReviewedProducts(reviewedMap);
    } catch (error) {
      console.error("Error checking reviewed products:", error);
    }
  };
  
  const applyFiltersAndPagination = () => {
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
    
    // Apply date range filter - now supports filtering with only one date field
    if (startDate || endDate) {
      result = result.filter(order => {
        const orderDate = new Date(order.updatedAt);
        
        // If only start date is provided, filter orders after that date
        if (startDate && !endDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          return orderDate >= start;
        }
        
        // If only end date is provided, filter orders before that date
        if (!startDate && endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return orderDate <= end;
        }
        
        // If both dates are provided, filter orders between those dates
        if (startDate && endDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          
          return orderDate >= start && orderDate <= end;
        }
        
        return true;
      });
    }
    
    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.updatedAt) - new Date(a.updatedAt));
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
    
    // Save filtered orders
    setFilteredOrders(result);
    
    // Update pagination details based on filtered results
    const totalItems = result.length;
    const totalPages = Math.ceil(totalItems / pagination.pageSize);
    
    setPagination(prev => ({
      ...prev,
      totalItems,
      totalPages: totalPages || 1 // Ensure at least 1 page
    }));
    
    // Apply pagination
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const paginatedResult = result.slice(startIndex, startIndex + pagination.pageSize);
    
    setPaginatedOrders(paginatedResult);
  };
  
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

  // Check if an order is delivered/completed and can have product reviews
  const isOrderCompletedOrDelivered = (status) => {
    if (!status) return false;
    const statusLower = status.toLowerCase();
    return statusLower === 'completed' || statusLower === 'delivered';
  };
  
  // Check if a specific order item has been reviewed
  const isProductReviewed = (itemId) => {
    return reviewedProducts[itemId] === true;
  };
  
  // Handle navigating to order details with a specific intent to review
  const handleViewWithReviewIntent = (orderId, shouldReview = false) => {
    if (orderId) {
      navigate(`/order/${orderId}`, {
        state: {
          reviewIntent: shouldReview
        }
      });
    } else {
      console.error("Invalid orderId:", orderId);
    }
  };

  // Generate year options
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 3; i--) {
      years.push(i);
    }
    return years;
  };

  // Get month name
  const getMonthName = (monthNumber) => {
    const months = [
      "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
      "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];
    return months[monthNumber - 1];
  };

  // Reset all date/time filters
  const resetDateFilters = () => {
    setStartDate("");
    setEndDate("");
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
      orderItemId: item.id,
      name: item.productName || (productDetail?.name) || `Sản phẩm #${item.productId}`,
      price: item.productPrice || (productDetail?.price) || 0,
      quantity: item.itemQuantity || 1,
      image: imageSource,
      reviewed: isProductReviewed(item.id)
    };
  };

  // Update the reset function to reset all filters
  const resetAllFilters = () => {
    setStatusFilter("all");
    setSortBy("newest");
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    
    // Reset to first page
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };
  
  // Handle page change for pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }));
    }
  };
  
  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPagination(prev => ({
      ...prev,
      pageSize: newSize,
      currentPage: 1, // Reset to first page when changing page size
      totalPages: Math.ceil(prev.totalItems / newSize)
    }));
  };
  
  // Pagination component
  const Pagination = () => {
    if (pagination.totalPages <= 1) return null;
    
    const maxPageButtons = 5; // Max number of page buttons to show
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxPageButtons - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    const pageButtons = [];
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <button
          key={i}
          className={`pagination-button ${i === pagination.currentPage ? 'active-page' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="pagination-container">
        <div className="pagination-controls">
          <button
            className="pagination-button"
            onClick={() => handlePageChange(1)}
            disabled={pagination.currentPage === 1}
          >
            &laquo;
          </button>
          <button
            className="pagination-button"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            &lsaquo;
          </button>
          
          {pageButtons}
          
          <button
            className="pagination-button"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            &rsaquo;
          </button>
          <button
            className="pagination-button"
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            &raquo;
          </button>
        </div>
        
        <div className="page-size-selector">
          <span>Hiển thị:</span>
          <select
            value={pagination.pageSize}
            onChange={handlePageSizeChange}
            className="page-size-select"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span>đơn hàng / trang</span>
        </div>
      </div>
    );
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
            
            <div className="date-range-filter">
              <div className="date-filter-title">
                <FaCalendar />
                <span>Thời gian:</span>
              </div>
              <div className="date-inputs">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                />
                <span className="date-separator">đến</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="date-input"
                />
              </div>
            </div>
            
            {(statusFilter !== "all" || sortBy !== "newest" || searchTerm || startDate || endDate) && (
              <button 
                className="reset-filters-button filter-button"
                onClick={resetAllFilters}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Orders count indicator */}
        <div className="order-count">
          Hiển thị {paginatedOrders.length} / {pagination.totalItems} đơn hàng
        </div>

        {/* Filtered orders warning */}
        {filteredOrders.length === 0 && (
          <div className="no-matching-orders">
            <FaExclamationCircle />
            <p>Không tìm thấy đơn hàng nào phù hợp với bộ lọc. Vui lòng thử lại với điều kiện khác.</p>
            <button onClick={resetAllFilters} className="reset-filters-button">
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}

        <div className="orderv2-list">
          {paginatedOrders.map((order) => {
            // Safely extract data from order with fallbacks
            const totalAmount = order.totalAmount || 0;
            const items = order.orderItems || [];
            const shippingFee = order.shippingFee ?? 30000;
            const subtotal = order.subtotal ?? totalAmount - shippingFee;
            const orderDate = order.updatedAt || new Date();
            const status = order.status || "pending";
            const discount = order.discountPrice || 0;
            const canReview = isOrderCompletedOrDelivered(status);

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
                            {canReview && (
                              <div className={`review-status ${product.reviewed ? 'reviewed' : ''}`}>
                                {product.reviewed ? (
                                  <FaStar className="star-icon" title="Đã đánh giá" />
                                ) : (
                                  <button 
                                    className="need-review-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewWithReviewIntent(order.id, true);
                                    }}
                                    title="Đánh giá sản phẩm"
                                  >
                                    <FaStar className="star-icon" />
                                  </button>
                                )}
                              </div>
                            )}
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
        
        {/* Pagination */}
        {filteredOrders.length > 0 && <Pagination />}
      </div>
    </div>
  );
};

export default OrderHistory;