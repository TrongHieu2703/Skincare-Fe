// src/pages/ProductDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../api/productApi";
import { useCart } from "../store/CartContext";
import "/src/styles/ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [addingToCart, setAddingToCart] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Use cart context
  const { addItemToCart, formatPrice } = useCart();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await getProductById(id);
        setProduct(response.data);
        setError(null);
      } catch (error) {
        console.error("Lỗi khi tải thông tin sản phẩm:", error);
        setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleAddToCart = async () => {
    if (addingToCart) return; // Prevent multiple clicks
    
    try {
      setAddingToCart(true);
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
        navigate('/login', { state: { from: `/product/${id}` } });
        return;
      }
      
      const response = await addItemToCart(product.id, quantity);
      console.log("Product added to cart:", response);
      setSuccessMessage("✅ Đã thêm vào giỏ hàng thành công!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      if (error.response?.status === 401) {
        setError("❌ Vui lòng đăng nhập để thêm vào giỏ hàng!");
        navigate('/login', { state: { from: `/product/${id}` } });
      } else {
        setError("❌ Thêm vào giỏ hàng thất bại! " + (error.response?.data?.message || error.message || "Vui lòng thử lại sau."));
      }
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Đang tải thông tin sản phẩm...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate('/product-list')}>
          Quay lại danh sách sản phẩm
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <p>Không tìm thấy sản phẩm</p>
        <button onClick={() => navigate('/product-list')}>
          Quay lại danh sách sản phẩm
        </button>
      </div>
    );
  }

  return (
    <div className="product-details-container">
      {successMessage && (
        <div className="success-message-banner">
          {successMessage}
        </div>
      )}
      
      <div className="product-details-main">
        <div className="product-images">
          <div className="main-image">
            <img 
              src={product.mainImage || "/placeholder-product.png"} 
              alt={product.name}
            />
          </div>
          <div className="thumbnail-list">
            {product.images?.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt={`${product.name} - Ảnh ${idx + 1}`} 
                className="thumbnail"
              />
            ))}
          </div>
        </div>

        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>
          <div className="product-meta">
            <p className="product-brand">
              <strong>Thương hiệu:</strong> {product.brand}
            </p>
            <p className="product-stock">
              <strong>Tình trạng:</strong>{" "}
              {product.stock > 0 
                ? `Còn ${product.stock} sản phẩm` 
                : "Hết hàng"}
            </p>
          </div>

          <div className="product-price">
            {formatPrice(product.price)}
          </div>

          <div className="quantity-control">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </button>
            <span>{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              disabled={quantity >= product.stock}
            >
              +
            </button>
          </div>

          <button 
            className={`add-to-cart-btn ${addingToCart ? 'loading' : ''}`}
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addingToCart}
          >
            {addingToCart 
              ? 'Đang thêm...' 
              : product.stock === 0 
                ? 'Hết hàng' 
                : 'Thêm vào giỏ hàng'}
          </button>
        </div>
      </div>

      <div className="product-tabs">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Mô tả
          </button>
          <button 
            className={`tab ${activeTab === 'specification' ? 'active' : ''}`}
            onClick={() => setActiveTab('specification')}
          >
            Thông số
          </button>
          <button 
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Đánh giá
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="description-content">
              <h3>Thông tin sản phẩm:</h3>
              <p>{product.description || "Đang cập nhật thông tin chi tiết sản phẩm..."}</p>
              
              <h3>Ưu điểm nổi bật:</h3>
              <ul>
                {product.skinTypes && product.skinTypes.length > 0 ? (
                  <>
                    <li>Phù hợp với các loại da: {product.skinTypes.join(', ')}</li>
                    <li>Loại sản phẩm: {product.productTypeName || "Đang cập nhật"}</li>
                  </>
                ) : (
                  <li>Đang cập nhật thông tin chi tiết...</li>
                )}
              </ul>
            </div>
          )}

          {activeTab === 'specification' && (
            <div className="specification-content">
              <h3>Thông số kỹ thuật:</h3>
              <ul>
                <li><strong>Tên sản phẩm:</strong> {product.name || "Đang cập nhật"}</li>
                <li><strong>Thương hiệu:</strong> {product.productBrandName || "Đang cập nhật"}</li>
                <li><strong>Loại sản phẩm:</strong> {product.productTypeName || "Đang cập nhật"}</li>
                <li><strong>Phù hợp với da:</strong> {product.skinTypes && product.skinTypes.length > 0 ? product.skinTypes.join(', ') : 'Đang cập nhật'}</li>
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-content">
              <h3>Đánh giá từ khách hàng:</h3>
              <p>Chưa có đánh giá nào cho sản phẩm này.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
