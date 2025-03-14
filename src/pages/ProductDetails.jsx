// src/pages/ProductDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import "/src/styles/ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

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
    try {
      await addToCart(product.id, quantity);
      alert("✅ Đã thêm vào giỏ hàng thành công!");
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      alert("❌ Thêm vào giỏ hàng thất bại!");
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
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(product.price)}
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
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
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
              <p>{product.description}</p>
              
              <h3>Ưu điểm nổi bật:</h3>
              <ul>
                {product.features?.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'specification' && (
            <div className="specification-content">
              <h3>Thông số kỹ thuật:</h3>
              {/* Thêm thông số kỹ thuật của sản phẩm nếu có */}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-content">
              <h3>Đánh giá từ khách hàng:</h3>
              {/* Thêm phần đánh giá sản phẩm nếu có */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
