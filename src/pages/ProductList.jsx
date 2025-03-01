import React, { useEffect, useState } from 'react';
import { getAllProducts } from '../api/productApi';
import { Link } from 'react-router-dom';
import '/src/styles/ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState([]);

  useEffect(() => {
    getAllProducts(1, 50)
      .then((res) => {
        setProducts(res.data);
        setFilteredProducts(res.data);
        const initialQuantities = res.data.reduce((acc, product) => {
          acc[product.id] = 1;
          return acc;
        }, {});
        setQuantities(initialQuantities);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleFilterChange = (range) => {
    setSelectedPriceRange(range);
    if (!range) {
      setFilteredProducts(products);
    } else {
      const [min, max] = range;
      setFilteredProducts(products.filter((p) => p.price >= min && p.price <= max));
    }
    setCurrentPage(1);
  };

  const handleQuantityChange = (id, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, prev[id] + delta),
    }));
  };

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantities[product.id] } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: quantities[product.id] }];
      }
    });
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="product-page full-page">
      <div className="sidebar animated-slide-in">
        <div className="filter-box">
          <h3 className="filter-title">BỘ LỌC</h3>
          <div className="filter-group">
            <h4>GIÁ SẢN PHẨM</h4>
            <div className="filter-option">
              <input type="radio" name="priceFilter" id="all" checked={!selectedPriceRange} onChange={() => handleFilterChange(null)} />
              <label htmlFor="all">Tất cả</label>
            </div>
            <div className="filter-option">
              <input type="radio" name="priceFilter" id="price1" onChange={() => handleFilterChange([0, 100000])} />
              <label htmlFor="price1">Giá dưới 100.000đ</label>
            </div>
            <div className="filter-option">
              <input type="radio" name="priceFilter" id="price2" onChange={() => handleFilterChange([100000, 200000])} />
              <label htmlFor="price2">100.000đ - 200.000đ</label>
            </div>
            <div className="filter-option">
              <input type="radio" name="priceFilter" id="price3" onChange={() => handleFilterChange([200000, 300000])} />
              <label htmlFor="price3">200.000đ - 300.000đ</label>
            </div>
            <div className="filter-option">
              <input type="radio" name="priceFilter" id="price4" onChange={() => handleFilterChange([300000, 500000])} />
              <label htmlFor="price4">300.000đ - 500.000đ</label>
            </div>
          </div>
        </div>
        {/* Danh mục sản phẩm */}
        <div className="category-box animated-fade-in">
          <h3 className="category-title">SẢN PHẨM MỘC AN</h3>
          <ul className="category-list">
            <li><span>🌿</span> Chăm Sóc Môi & Trang Điểm</li>
            <li><span>🌿</span> Chăm Sóc - Trị Rụng Tóc</li>
            <li><span>🌿</span> Chăm Sóc Da An Toàn</li>
            <li><span>🌿</span> Nước Hoa Khô - Tinh Dầu Thiên Nhiên</li>
            <li><span>🌿</span> Combo Giảm Giá</li>
          </ul>
        </div>
      </div>


      <div className="product-list animated-grid">
        {currentProducts.map((product) => (
          <div key={product.id} className="product-card animated-fade-in">
            <img src={product.imageUrl || 'https://via.placeholder.com/150'} alt={product.name} className="product-image hover-zoom" />
            <div className="product-details">
              <h3 className="product-name highlighted-text">{product.name}</h3>
              <p className="product-price">Giá: {product.price.toLocaleString()}</p>
              <div className="quantity-control" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button className="quantity-btn" onClick={() => handleQuantityChange(product.id, -1)}>-</button>
                <span className="quantity">{quantities[product.id]}</span>
                <button className="quantity-btn" onClick={() => handleQuantityChange(product.id, 1)}>+</button>
              </div>
              <button className="add-to-cart-btn" onClick={() => handleAddToCart(product)}>Thêm vào giỏ hàng</button>
              <Link to={`/product/${product.id}`} className="product-link btn-animated">
                Xem chi tiết
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
