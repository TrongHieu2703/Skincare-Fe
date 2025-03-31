import React, { useEffect, useState } from "react";
import { 
  getAllProducts, 
  getProductsBySkinType, 
  getAllSkinTypes, 
  getAllProductTypes, 
  getAllBranches,
  getProductsWithFilters
} from "../api/productApi";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../store/CartContext";
import "/src/styles/ProductList.css";
import { formatProductImageUrl, handleImageError } from "../utils/imageUtils";
import { FaStar, FaRegStar, FaRandom } from "react-icons/fa";
import Footer from "../components/Footer";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 12,
    totalPages: 1,
    totalItems: 0
  });
  
  // Filters
  const [skinTypeFilter, setSkinTypeFilter] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [sortOption, setSortOption] = useState("");
  
  // Filter data
  const [skinTypes, setSkinTypes] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [branches, setBranches] = useState([]);
  
  // Comparison state
  const [productsToCompare, setProductsToCompare] = useState([]);
  const [showCompareButton, setShowCompareButton] = useState(false);
  
  // Loading states
  const [loadingSkinTypes, setLoadingSkinTypes] = useState(false);
  const [loadingProductTypes, setLoadingProductTypes] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  
  const [allFilteredProducts, setAllFilteredProducts] = useState([]); // Store all filtered products

  const navigate = useNavigate();
  const { formatPrice } = useCart();

  // Fetch all filter options data
  const fetchFilterData = async () => {
    try {
      setLoadingSkinTypes(true);
      setLoadingProductTypes(true);
      setLoadingBranches(true);
      
      const [skinTypesResponse, productTypesResponse, branchesResponse] = await Promise.all([
        getAllSkinTypes(),
        getAllProductTypes(),
        getAllBranches()
      ]);
      
      setSkinTypes(skinTypesResponse);
      setProductTypes(productTypesResponse);
      setBranches(branchesResponse);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu bộ lọc:", error);
    } finally {
      setLoadingSkinTypes(false);
      setLoadingProductTypes(false);
      setLoadingBranches(false);
    }
  };

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      
      // Create filters object for API
      const filters = {};
      if (skinTypeFilter) filters.skinTypeId = skinTypeFilter;
      if (productTypeFilter) filters.productTypeId = productTypeFilter;
      if (branchFilter) filters.branchId = branchFilter;
      
      if (priceFilter) {
        const [min, max] = priceFilter.split("-").map(Number);
        filters.minPrice = min;
        if (max) filters.maxPrice = max;
      }
      
      if (ratingFilter) {
        const [min, max] = ratingFilter.split("-").map(Number);
        filters.minRating = min;
        if (max) filters.maxRating = max;
      }
      
      // Check if there are any filters or sort options
      if (Object.keys(filters).length > 0 || sortOption) {
        const response = await getProductsWithFilters(page, pagination.pageSize, filters, sortOption);
        if (!response) return;
        
        setProducts(response.products);
        setFilteredProducts(response.products);
        setAllFilteredProducts(response.products);
        
        setPagination({
          currentPage: response.pagination.currentPage,
          pageSize: pagination.pageSize,
          totalPages: response.pagination.totalPages,
          totalItems: response.pagination.totalItems
        });
      } else {
        // No filters, get all products
        const response = await getAllProducts(page, pagination.pageSize);
        if (!response) return;
        
        setProducts(response.products);
        setFilteredProducts(response.products);
        setAllFilteredProducts([]);
        
        setPagination({
          currentPage: response.pagination.currentPage,
          pageSize: pagination.pageSize,
          totalPages: response.pagination.totalPages,
          totalItems: response.pagination.totalItems
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterData();
  }, []);

  useEffect(() => {
    // Reset to page 1 when any filter changes
    setPagination(prev => ({...prev, currentPage: 1}));
    fetchProducts(1);
  }, [skinTypeFilter, productTypeFilter, branchFilter, priceFilter, ratingFilter, sortOption]);

  useEffect(() => {
    // Handle page changes
    if (pagination.currentPage > 1) {
      fetchProducts(pagination.currentPage);
    }
  }, [pagination.currentPage]);

  // Toggle product for comparison
  const toggleCompare = (product) => {
    setProductsToCompare(prevProducts => {
      // Check if product is already in the comparison list
      const exists = prevProducts.some(p => p.id === product.id);
      
      if (exists) {
        // If exists, remove it
        const updated = prevProducts.filter(p => p.id !== product.id);
        if (updated.length < 2) {
          setShowCompareButton(false);
        }
        return updated;
      } else {
        // If doesn't exist and less than 4 products, add it
        if (prevProducts.length < 4) {
          const updated = [...prevProducts, product];
          if (updated.length >= 2) {
            setShowCompareButton(true);
          }
          return updated;
        } else {
          // If trying to add more than 4, show an alert
          alert("Bạn chỉ có thể so sánh tối đa 4 sản phẩm");
          return prevProducts;
        }
      }
    });
  };

  // Navigate to comparison page
  const goToComparison = () => {
    if (productsToCompare.length < 2) {
      alert("Vui lòng chọn ít nhất 2 sản phẩm để so sánh");
      return;
    }
    
    // Store product IDs in local storage or state
    const productIds = productsToCompare.map(p => p.id);
    localStorage.setItem('compareProducts', JSON.stringify(productIds));
    
    // Navigate to the comparison page
    navigate('/product-comparison');
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleResetFilters = () => {
    setSkinTypeFilter("");
    setProductTypeFilter("");
    setBranchFilter("");
    setPriceFilter("");
    setRatingFilter("");
    setSortOption("");
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
      window.scrollTo(0, 0);
    }
  };

  // Render star ratings component
  const RatingStars = ({ rating }) => {
    const ratingValue = rating || 0;
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= ratingValue) {
        stars.push(<FaStar key={i} className="rating-star filled" />);
      } else {
        stars.push(<FaRegStar key={i} className="rating-star empty" />);
      }
    }
    
    return (
      <div className="product-rating product-card-rating">
        <div className="stars-container product-stars">
          {stars}
        </div>
        <span className="rating-value product-rating-value">{ratingValue > 0 ? ratingValue.toFixed(1) : 'Chưa có đánh giá'}</span>
      </div>
    );
  };

  const Pagination = () => {
    const pages = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      pages.push(i);
    }
    return (
      <div className="pagination">
        {pages.map((num) => (
          <button
            key={num}
            onClick={() => handlePageChange(num)}
            className={num === pagination.currentPage ? 'active' : ''}
          >
            {num}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="product-page full-width">
      <div className="product-content">
        {successMessage && <div className="success-message-banner">{successMessage}</div>}
        <h2 className="product-title">Danh sách sản phẩm</h2>
        
        <div className="filter-bar">
          {/* Skin Type Filter */}
          <select value={skinTypeFilter} onChange={handleFilterChange(setSkinTypeFilter)}>
            <option value="">Tất cả loại da</option>
            {loadingSkinTypes ? (
              <option disabled>Đang tải...</option>
            ) : (
              skinTypes.map(skinType => (
                <option key={skinType.id} value={skinType.id}>
                  {skinType.name}
                </option>
              ))
            )}
          </select>

          {/* Product Type Filter */}
          <select value={productTypeFilter} onChange={handleFilterChange(setProductTypeFilter)}>
            <option value="">Tất cả loại sản phẩm</option>
            {loadingProductTypes ? (
              <option disabled>Đang tải...</option>
            ) : (
              productTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))
            )}
          </select>

          {/* Brand Filter */}
          <select value={branchFilter} onChange={handleFilterChange(setBranchFilter)}>
            <option value="">Tất cả thương hiệu</option>
            {loadingBranches ? (
              <option disabled>Đang tải...</option>
            ) : (
              branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))
            )}
          </select>

          {/* Price Filter */}
          <select value={priceFilter} onChange={handleFilterChange(setPriceFilter)}>
            <option value="">Tất cả mức giá</option>
            <option value="0-100000">Dưới 100.000đ</option>
            <option value="100000-300000">100.000đ - 300.000đ</option>
            <option value="300000-500000">300.000đ - 500.000đ</option>
            <option value="500000-1000000">500.000đ - 1.000.000đ</option>
            <option value="1000000">Trên 1.000.000đ</option>
          </select>

          {/* Rating Filter */}
          <select value={ratingFilter} onChange={handleFilterChange(setRatingFilter)}>
            <option value="">Tất cả đánh giá</option>
            {/* <option value="0-1">Đánh giá 0-1 sao</option> */}
            <option value="1-2">Đánh giá 1-2 sao</option>
            <option value="2-3">Đánh giá 2-3 sao</option>
            <option value="3-4">Đánh giá 3-4 sao</option>
            <option value="4-5">Đánh giá 4-5 sao</option>
          </select>

          {/* Sort Options */}
          <select value={sortOption} onChange={handleFilterChange(setSortOption)}>
            <option value="">Sắp xếp</option>
            <option value="price_asc">Giá: Thấp đến cao</option>
            <option value="price_desc">Giá: Cao đến thấp</option>
            <option value="name_asc">Tên: A-Z</option>
            <option value="name_desc">Tên: Z-A</option>
            <option value="rating_asc">Đánh giá: Thấp đến cao</option>
            <option value="rating_desc">Đánh giá: Cao đến thấp</option>
          </select>

          {/* Reset Filters */}
          <button className="reset-filters-btn" onClick={handleResetFilters}>
            Xóa bộ lọc
          </button>

          {/* Compare button */}
          {showCompareButton && (
            <button 
              className="compare-button" 
              onClick={goToComparison}
              title={`So sánh ${productsToCompare.length} sản phẩm`}
            >
              <FaRandom /> So sánh ({productsToCompare.length})
            </button>
          )}
        </div>

        {/* Selected products indicator */}
        {productsToCompare.length > 0 && (
          <div className="compare-selection">
            <div className="compare-selection-header">
              <h3>Sản phẩm đã chọn ({productsToCompare.length}/4)</h3>
              <button 
                className="clear-selection" 
                onClick={() => {
                  setProductsToCompare([]);
                  setShowCompareButton(false);
                }}
              >
                Bỏ chọn tất cả
              </button>
            </div>
            <div className="compare-items">
              {productsToCompare.map(product => (
                <div key={`compare-${product.id}`} className="compare-item">
                  <img 
                    src={formatProductImageUrl(product.image)} 
                    alt={product.name} 
                    className="compare-item-image"
                    onError={(e) => handleImageError(e, "/src/assets/images/aboutus.jpg")}
                  />
                  <div className="compare-item-name">{product.name}</div>
                  <button 
                    className="remove-compare-item" 
                    onClick={() => toggleCompare(product)}
                  >
                    &times;
                  </button>
                </div>
              ))}
              {Array(4 - productsToCompare.length).fill().map((_, index) => (
                <div key={`empty-${index}`} className="compare-item empty">
                  <div className="empty-slot">+ Thêm sản phẩm</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Đang tải sản phẩm...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-products">Không tìm thấy sản phẩm phù hợp</div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="compare-checkbox">
                  <input
                    type="checkbox"
                    id={`compare-${product.id}`}
                    checked={productsToCompare.some(p => p.id === product.id)}
                    onChange={() => toggleCompare(product)}
                  />
                  <label htmlFor={`compare-${product.id}`}>So sánh</label>
                </div>
                <Link to={`/product/${product.id}`} className="product-link">
                  <div className="product-image-container">
                    <img
                      src={formatProductImageUrl(product.image)}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => handleImageError(e, "/src/assets/images/aboutus.jpg")}
                      loading="lazy"
                      width="200"
                      height="200"
                      style={{ minWidth: '80%', minHeight: '80%' }}
                    />
                  </div>
                  <h3 className="product-name product-title-text">{product.name}</h3>
                  <RatingStars rating={product.averageRating} />
                  <p className="product-price product-card-price">{formatPrice(product.price)}</p>
                </Link>
              </div>
            ))}
          </div>
        )}
        {!loading && filteredProducts.length > 0 && <Pagination />}
      </div>
    </div>
  );
};

export default ProductList;