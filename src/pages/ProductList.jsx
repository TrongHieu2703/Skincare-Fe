import React, { useEffect, useState } from "react";
import { getAllProducts, getProductsBySkinType } from "../api/productApi";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../store/CartContext";
import "/src/styles/ProductList.css";
import { FiFilter, FiShoppingCart, FiEye, FiMinus, FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { formatProductImageUrl } from "../utils/imageUtils";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [skinTypes, setSkinTypes] = useState([]);
  const [selectedSkinType, setSelectedSkinType] = useState(null);

  // Thêm state pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 12, // Hiển thị 12 sản phẩm mỗi trang
    totalPages: 1,
    totalItems: 0
  });

  const navigate = useNavigate();

  // Use cart context
  const { addItemToCart, formatPrice } = useCart();

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      console.log(`Fetching products for page ${page} with page size ${pagination.pageSize}`);

      const response = await getAllProducts(page, pagination.pageSize);

      // Kiểm tra nếu response bị debounced
      if (!response) {
        console.log("Request was debounced, skipping update");
        setLoading(false);
        return;
      }

      console.log("API Response:", response);

      if (!response.products || !Array.isArray(response.products)) {
        throw new Error("Invalid product data format");
      }

      // Cập nhật products
      setProducts(response.products);
      setFilteredProducts(response.products);

      // Cập nhật pagination từ API response
      setPagination(prev => ({
        ...prev,
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.totalItems
      }));

      console.log("Pagination updated:", {
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.totalItems
      });

      // Khởi tạo số lượng cho mỗi sản phẩm
      const initialQuantities = response.products.reduce((acc, product) => {
        acc[product.id] = 1;
        return acc;
      }, {});
      setQuantities(initialQuantities);
    } catch (error) {
      console.error("❌ Lỗi khi tải sản phẩm:", error);

      // Add detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      } else if (error.request) {
        console.error("Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsBySkinType = async (skinTypeId) => {
    try {
      setLoading(true);
      const response = await getProductsBySkinType(skinTypeId);

      if (response && response.data) {
        setFilteredProducts(response.data);

        // Đặt lại pagination khi filter theo skin type
        setPagination(prev => ({
          ...prev,
          currentPage: 1,
          totalPages: 1,
          totalItems: response.data.length
        }));
      }
    } catch (error) {
      console.error(`Error fetching products for skin type ${skinTypeId}:`, error);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (selectedSkinType) {
      fetchProductsBySkinType(selectedSkinType);
    } else {
      fetchProducts(pagination.currentPage);
    }
  }, [pagination.currentPage, selectedSkinType]);


  const handleFilterChange = (range, category = null) => {
    setSelectedPriceRange(range);
    setSelectedCategory(category);

    // Reset pagination to page 1 when filter changes
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));

    let filtered = products;

    if (range) {
      const [min, max] = range;
      filtered = filtered.filter((p) => p.price >= min && p.price <= max);
    }

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }

    setFilteredProducts(filtered);

    // Close mobile filters after applying
    if (window.innerWidth < 768) {
      setShowMobileFilters(false);
    }
  };

  const handleQuantityChange = (id, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, prev[id] + delta),
    }));
  };

  const handleAddToCart = async (product) => {
    // Prevent double-clicking or clicking on multiple products at once
    if (addingToCart[product.id]) return;

    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
        navigate('/login', { state: { from: '/product-list' } });
        return;
      }

      // Set loading state for this specific product
      setAddingToCart(prev => ({ ...prev, [product.id]: true }));

      const quantity = quantities[product.id];
      const response = await addItemToCart(product.id, quantity);
      console.log("Product added to cart:", response);

      // Show success message
      setSuccessMessage(`✅ Đã thêm ${product.name} vào giỏ hàng!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      if (error.response?.status === 401) {
        alert("❌ Vui lòng đăng nhập để thêm vào giỏ hàng!");
        navigate('/login', { state: { from: '/product-list' } });
      } else {
        alert("❌ Thêm vào giỏ hàng thất bại! " + (error.response?.data?.message || error.message || "Vui lòng thử lại sau."));
      }
    } finally {
      // Clear loading state
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }));
      window.scrollTo(0, 0);
    }
  };

  const handleSkinTypeChange = async (skinTypeId) => {
    setSelectedSkinType(skinTypeId);
    const products = await getProductsBySkinType(skinTypeId);
    setFilteredProducts(products.data);
  };

  const categoryIcons = {
    'Chăm Sóc Da Mặt': '🧴',
    'Chăm Sóc Cơ Thể': '🧼',
    'Chăm Sóc Tóc': '✨',
    'Mỹ Phẩm Trang Điểm': '💄',
    'Combo Tiết Kiệm': '🎁'
  };

  const categories = [
    'Chăm Sóc Da Mặt',
    'Chăm Sóc Cơ Thể',
    'Chăm Sóc Tóc',
    'Mỹ Phẩm Trang Điểm',
    'Combo Tiết Kiệm'
  ];

  const priceRanges = [
    { id: 'all', label: 'Tất cả', range: null },
    { id: 'price1', label: 'Dưới 100.000₫', range: [0, 100000] },
    { id: 'price2', label: '100.000đ - 200.000đ', range: [100000, 200000] },
    { id: 'price3', label: '200.000đ - 300.000đ', range: [200000, 300000] },
    { id: 'price4', label: '300.000đ - 500.000đ', range: [300000, 500000] }
  ];

  // Component Pagination giống ProductManager.jsx
  const Pagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    console.log('Rendering pagination with:', {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      pageNumbers
    });

    if (pagination.totalPages <= 1) return null;

    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(1)}
          disabled={pagination.currentPage === 1}
          className="page-nav first"
        >
          {"<<"}
        </button>
        <button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="page-nav prev"
        >
          <FiChevronLeft /> Trước
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="page-btn"
            >
              1
            </button>
            {startPage > 2 && <span className="ellipsis">...</span>}
          </>
        )}

        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`page-btn ${number === pagination.currentPage ? 'active' : ''}`}
          >
            {number}
          </button>
        ))}

        {endPage < pagination.totalPages && (
          <>
            {endPage < pagination.totalPages - 1 && <span className="ellipsis">...</span>}
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              className="page-btn"
            >
              {pagination.totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          className="page-nav next"
        >
          Sau <FiChevronRight />
        </button>
        <button
          onClick={() => handlePageChange(pagination.totalPages)}
          disabled={pagination.currentPage === pagination.totalPages}
          className="page-nav last"
        >
          {">>"}
        </button>
      </div>
    );
  };

  return (
    <div className="product-page">
      {successMessage && (
        <div className="success-message-banner">
          {successMessage}
        </div>
      )}

      <div className="product-page-container">
        <aside className={`sidebar ${showMobileFilters ? 'show-mobile' : ''}`}>
          <div className="filter-header">
            <h3>Bộ lọc tìm kiếm</h3>
            <button
              className="close-filter-btn"
              onClick={() => setShowMobileFilters(false)}
            >
              ×
            </button>
          </div>

          <div className="filter-box">
            <h4 className="filter-title">Khoảng giá</h4>
            <div className="price-filters">
              {priceRanges.map(range => (
                <div
                  key={range.id}
                  className={`price-filter-chip ${selectedPriceRange === range.range ? 'active' : ''}`}
                  onClick={() => handleFilterChange(range.range)}
                >
                  {range.label}
                </div>
              ))}
            </div>
          </div>

          <div className="filter-box">
            <h4 className="filter-title">Đề xuất sản phẩm theo loại da của bạn</h4>
            <select
              value={selectedSkinType || ""}
              onChange={(e) => setSelectedSkinType(e.target.value)}
            >
              <option value="">Tất cả</option>
              {skinTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className="reset-filter-btn"
            onClick={() => handleFilterChange(null, null)}
          >
            Xóa bộ lọc
          </button>
        </aside>

        <main className="product-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : (
            <>
              <div className="result-stats">
                <span>Tìm thấy <strong>{pagination.totalItems}</strong> sản phẩm</span>
                <span>Hiển thị {(pagination.currentPage - 1) * pagination.pageSize + 1} - {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}</span>
              </div>

              <div className="product-list">
                {Array.isArray(filteredProducts) && filteredProducts.map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-image-container">
                      <Link to={`/product/${product.id}`}>
                        <div className="product-image-wrapper">
                          <img
                            src={formatProductImageUrl(product.image)}
                            alt={product.name}
                            className="product-image"
                            loading="lazy"
                            onError={(e) => {
                              console.error('Image load error:', e.target.src);
                              e.target.onerror = null;
                              e.target.src = "../src/assets/images/aboutus.jpg";
                            }}
                          />
                        </div>
                      </Link>
                      <div className="quick-actions">
                        <button
                          className="quick-view-btn"
                          onClick={() => navigate(`/product/${product.id}`)}
                          title="Xem chi tiết"
                        >
                          <FiEye />
                        </button>
                        <button
                          className="quick-cart-btn"
                          onClick={() => handleAddToCart(product)}
                          disabled={addingToCart[product.id]}
                          title="Thêm vào giỏ hàng"
                        >
                          <FiShoppingCart />
                        </button>
                      </div>
                    </div>

                    <div className="product-details">
                      <Link to={`/product/${product.id}`} className="product-name-link">
                        <h3 className="product-name">{product.name}</h3>
                      </Link>
                      <div className="product-price">
                        {formatPrice(product.price)}
                      </div>

                      <div className="product-actions">
                        <div className="quantity-control">
                          <button
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(product.id, -1)}
                            disabled={quantities[product.id] <= 1}
                            aria-label="Decrease quantity"
                          >
                            <FiMinus size={18} />
                          </button>
                          <span className="quantity">{quantities[product.id]}</span>
                          <button
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(product.id, 1)}
                            aria-label="Increase quantity"
                          >
                            <FiPlus size={18} />
                          </button>
                        </div>

                        <button
                          className={`add-to-cart-btn ${addingToCart[product.id] ? 'loading' : ''}`}
                          onClick={() => handleAddToCart(product)}
                          disabled={addingToCart[product.id]}
                        >
                          {addingToCart[product.id] ? 'Đang thêm...' : 'Thêm vào giỏ'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length > 0 && <Pagination />}

              {filteredProducts.length === 0 && !loading && (
                <div className="no-products-message">
                  <img src="/empty-results.svg" alt="No products found" className="empty-icon" />
                  <h3>Không tìm thấy sản phẩm</h3>
                  <p>Không có sản phẩm nào phù hợp với bộ lọc đã chọn</p>
                  <button
                    className="reset-filter-btn"
                    onClick={() => handleFilterChange(null, null)}
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductList;
