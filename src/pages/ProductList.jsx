import React, { useEffect, useState } from "react";
import { getAllProducts } from "../api/productApi";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../store/CartContext";
import "/src/styles/ProductList.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  
  // Use cart context
  const { addItemToCart, formatPrice } = useCart();

  const fetchProducts = async (page) => {
    try {
      setLoading(true);
      const response = await getAllProducts(page, 12);
      console.log("📦 RESPONSE FROM API:", response);

      const productArray = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

      if (!productArray.length) {
        throw new Error("Invalid product data format");
      }

      setProducts(productArray);
      setFilteredProducts(productArray);
      setTotalPages(response.totalPages || response.data?.totalPages || 1);

      const initialQuantities = productArray.reduce((acc, product) => {
        acc[product.id] = 1;
        return acc;
      }, {});
      setQuantities(initialQuantities);
    } catch (error) {
      console.error("❌ Lỗi khi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const handleFilterChange = (range, category = null) => {
    setSelectedPriceRange(range);
    setSelectedCategory(category);
    setCurrentPage(1);

    let filtered = products;

    if (range) {
      const [min, max] = range;
      filtered = filtered.filter((p) => p.price >= min && p.price <= max);
    }

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }

    setFilteredProducts(filtered);
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
      setSuccessMessage("✅ Đã thêm vào giỏ hàng thành công!");
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
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="product-page full-page">
      {successMessage && (
        <div className="success-message-banner">
          {successMessage}
        </div>
      )}
      
      <div className="sidebar animated-slide-in">
        <div className="filter-box">
          <h3 className="filter-title">BỘ LỌC TÌM KIẾM</h3>
          <div className="filter-group">
            <h4>KHOẢNG GIÁ</h4>
            <div className="filter-option">
              <input
                type="radio"
                name="priceFilter"
                id="all"
                checked={!selectedPriceRange}
                onChange={() => handleFilterChange(null)}
              />
              <label htmlFor="all">Tất cả</label>
            </div>
            <div className="filter-option">
              <input
                type="radio"
                name="priceFilter"
                id="price1"
                onChange={() => handleFilterChange([0, 100000])}
              />
              <label htmlFor="price1">Dưới 100.000₫</label>
            </div>
            <div className="filter-option">
              <input
                type="radio"
                name="priceFilter"
                id="price2"
                onChange={() => handleFilterChange([100000, 200000])}
              />
              <label htmlFor="price2">100.000đ - 200.000đ</label>
            </div>
            <div className="filter-option">
              <input
                type="radio"
                name="priceFilter"
                id="price3"
                onChange={() => handleFilterChange([200000, 300000])}
              />
              <label htmlFor="price3">200.000đ - 300.000đ</label>
            </div>
            <div className="filter-option">
              <input
                type="radio"
                name="priceFilter"
                id="price4"
                onChange={() => handleFilterChange([300000, 500000])}
              />
              <label htmlFor="price4">300.000đ - 500.000đ</label>
            </div>
          </div>
          <div className="filter-group">
            {/* Add more categories as needed */}
          </div>
        </div>
        <div className="category-box animated-fade-in">
          <h3 className="category-title">DANH MỤC SẢN PHẨM</h3>
          <ul className="category-list">
            <li><span>🌿</span> Chăm Sóc Da Mặt</li>
            <li><span>🌿</span> Chăm Sóc Cơ Thể</li>
            <li><span>🌿</span> Chăm Sóc Tóc</li>
            <li><span>🌿</span> Mỹ Phẩm Trang Điểm</li>
            <li><span>🌿</span> Combo Tiết Kiệm</li>
          </ul>
        </div>
      </div>

      <div className="product-content">
        {loading ? (
          <div className="loading-spinner">Đang tải sản phẩm...</div>
        ) : (
          <>
            <div className="product-list animated-grid">
              {Array.isArray(filteredProducts) && filteredProducts.map((product) => (
                <div key={product.id} className="product-card animated-fade-in">
                  <Link to={`/product/${product.id}`} className="product-image-link">
                    <img
                      src={product.mainImage || "/placeholder-product.png"}
                      alt={product.name}
                      className="product-image hover-zoom"
                    />
                  </Link>
                  <div className="product-details">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">
                      {formatPrice(product.price)}
                    </p>
                    <div className="quantity-control">
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(product.id, -1)}
                      >
                        -
                      </button>
                      <span className="quantity">{quantities[product.id]}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(product.id, 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className={`add-to-cart-btn ${addingToCart[product.id] ? 'loading' : ''}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCart[product.id]}
                    >
                      {addingToCart[product.id] ? 'Đang thêm...' : 'Thêm vào giỏ'}
                    </button>
                    <Link
                      to={`/product/${product.id}`}
                      className="view-detail-btn"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`page-btn ${currentPage === 1 ? 'disabled' : ''}`}
              >
                <span className="nav-text">&lt; Trước</span>
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`page-btn ${currentPage === totalPages ? 'disabled' : ''}`}
              >
                <span className="nav-text">Sau &gt;</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductList;
