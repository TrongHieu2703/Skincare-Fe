import React, { useEffect, useState } from "react";
import { getAllProducts, getProductsBySkinType } from "../api/productApi";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../store/CartContext";
import "/src/styles/ProductList.css";
import { FiMinus, FiPlus } from "react-icons/fi";
import { formatProductImageUrl } from "../utils/imageUtils";
import Footer from "../components/Footer";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 12,
    totalPages: 1,
    totalItems: 0
  });
  const [skinTypeFilter, setSkinTypeFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");

  const navigate = useNavigate();
  const { addItemToCart, formatPrice } = useCart();

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getAllProducts(page, pagination.pageSize);
      if (!response) return;
      setProducts(response.products);
      applyFilters(response.products);
      setPagination({
        currentPage: response.pagination.currentPage,
        pageSize: pagination.pageSize,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.totalItems
      });
      const initialQuantities = response.products.reduce((acc, product) => {
        acc[product.id] = 1;
        return acc;
      }, {});
      setQuantities(initialQuantities);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (productsList) => {
    let filtered = [...productsList];

    if (skinTypeFilter) {
      filtered = filtered.filter(p => p.skinType === skinTypeFilter);
    }

    if (priceFilter) {
      const [min, max] = priceFilter.split("-").map(Number);
      filtered = filtered.filter(p => p.price >= min && p.price <= max);
    }

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    fetchProducts(pagination.currentPage);
  }, [pagination.currentPage]);

  useEffect(() => {
    applyFilters(products);
  }, [skinTypeFilter, priceFilter]);

  const handleQuantityChange = (id, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, prev[id] + delta),
    }));
  };

  const handleAddToCart = async (product) => {
    if (addingToCart[product.id]) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
        navigate('/login', { state: { from: '/product-list' } });
        return;
      }
      
      // Check if the product is in stock
      if (product.stock <= 0) {
        alert("Sản phẩm này hiện đã hết hàng. Vui lòng chọn sản phẩm khác.");
        return;
      }
      
      setAddingToCart(prev => ({ ...prev, [product.id]: true }));
      const quantity = quantities[product.id];
      await addItemToCart(product.id, quantity);
      setSuccessMessage(`✅ Đã thêm ${product.name} vào giỏ hàng!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      alert("❌ Thêm vào giỏ hàng thất bại! " + (error.message || "Vui lòng thử lại sau."));
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
      window.scrollTo(0, 0);
    }
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
      <div className="filter-bar">
        <select value={skinTypeFilter} onChange={e => setSkinTypeFilter(e.target.value)}>
          <option value="">Tất cả loại da</option>
          <option value="dry">Da khô</option>
          <option value="oily">Da dầu</option>
          <option value="sensitive">Da nhạy cảm</option>
        </select>

        <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)}>
          <option value="">Tất cả mức giá</option>
          <option value="0-100000">Dưới 100.000đ</option>
          <option value="100000-300000">100.000đ - 300.000đ</option>
          <option value="300000-500000">300.000đ - 500.000đ</option>
          <option value="500000-1000000">Trên 500.000đ</option>
        </select>
      </div>

      {successMessage && <div className="success-message-banner">{successMessage}</div>}
      <h2 className="product-title">Danh sách sản phẩm</h2>
      {loading ? (
        <div className="loading">Đang tải sản phẩm...</div>
      ) : (
        <div className="product-grid large-images">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <Link to={`/product/${product.id}`}>
                <img
                  src={formatProductImageUrl(product.image)}
                  alt={product.name}
                  className="product-image large"
                />
              </Link>
              <h3 className="product-name">{product.name}</h3>
              <p className="product-price">{formatPrice(product.price)}</p>
              <div className="product-actions">
                <div className="quantity-control">
                  <button onClick={() => handleQuantityChange(product.id, -1)} disabled={quantities[product.id] <= 1}>
                    <FiMinus />
                  </button>
                  <span>{quantities[product.id]}</span>
                  <button onClick={() => handleQuantityChange(product.id, 1)}>
                    <FiPlus />
                  </button>
                </div>
                <button
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                  disabled={addingToCart[product.id]}
                >
                  {addingToCart[product.id] ? "Đang thêm..." : "Thêm vào giỏ"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && filteredProducts.length > 0 && <Pagination />}
    </div>
  );
};

export default ProductList;