import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { compareProducts } from '../api/productApi';
import { formatProductImageUrl, handleImageError } from '../utils/imageUtils';
import { FaStar, FaRegStar, FaArrowLeft } from 'react-icons/fa';
import { useCart } from '../store/CartContext';
import '../styles/ProductComparison.css';
import { toast } from 'react-toastify';

const ProductComparison = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { formatPrice, addItemToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        setLoading(true);
        const storedIds = localStorage.getItem('compareProducts');
        
        if (!storedIds) {
          setError('Không tìm thấy sản phẩm để so sánh');
          setLoading(false);
          return;
        }
        
        const productIds = JSON.parse(storedIds);
        
        if (!productIds.length || productIds.length < 2) {
          setError('Cần ít nhất 2 sản phẩm để so sánh');
          setLoading(false);
          return;
        }
        
        // Fetch comparison data
        const comparisonData = await compareProducts(productIds);
        console.log('Comparison data received:', comparisonData);
        setProducts(comparisonData);
      } catch (err) {
        console.error('Error fetching comparison data:', err);
        setError('Lỗi khi tải dữ liệu so sánh. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComparisonData();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddToCart = async (product) => {
    try {
      setAddingToCart(prev => ({ ...prev, [product.id]: true }));
      
      await addItemToCart(product.id, 1);
      
      // Show success notification
      toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
    } catch (error) {
      // Show error notification
      toast.error(error.message || "Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  // Render star ratings
  const RatingStars = ({ rating }) => {
    const ratingValue = rating || 0;
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= ratingValue) {
        stars.push(<FaStar key={i} className="comp-rating-star filled" />);
      } else {
        stars.push(<FaRegStar key={i} className="comp-rating-star empty" />);
      }
    }
    
    return (
      <div className="comp-product-rating">
        <div className="comp-stars-container">
          {stars}
        </div>
        <span className="comp-rating-value">{ratingValue > 0 ? ratingValue.toFixed(1) : 'Chưa có đánh giá'}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="comp-loading-container">
        <div className="comp-loading-spinner"></div>
        <p>Đang tải dữ liệu so sánh...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comp-error-container">
        <h2>Lỗi</h2>
        <p>{error}</p>
        <button onClick={handleBack} className="comp-back-button">
          <FaArrowLeft /> Quay lại danh sách sản phẩm
        </button>
      </div>
    );
  }

  return (
    <div className="comp-container">
      <div className="comp-header">
        <h1>So sánh sản phẩm</h1>
        <button onClick={handleBack} className="comp-back-button">
          <FaArrowLeft /> Quay lại danh sách sản phẩm
        </button>
      </div>
      
      <div className="comp-table-container">
        <table className="comp-table">
          <thead>
            <tr>
              <th className="comp-attribute-column">Thuộc tính</th>
              {products.map(product => (
                <th key={product.id}>
                  <div className="comp-product-header">
                    <img 
                      src={product.image}
                      alt={product.name}
                      className="comp-product-image"
                      onError={(e) => handleImageError(e, "/src/assets/images/aboutus.jpg")}
                    />
                    <h3 className="comp-product-name">{product.name}</h3>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="comp-attribute-name">Giá</td>
              {products.map(product => (
                <td key={`price-${product.id}`} className="comp-attribute-value">
                  <span className="comp-price">{formatPrice(product.price)}</span>
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="comp-attribute-name">Đánh giá</td>
              {products.map(product => (
                <td key={`rating-${product.id}`} className="comp-attribute-value">
                  <RatingStars rating={product.averageRating} />
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="comp-attribute-name">Thương hiệu</td>
              {products.map(product => (
                <td key={`brand-${product.id}`} className="comp-attribute-value">
                  {product.productBrandName || 'Không có thông tin'}
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="comp-attribute-name">Loại sản phẩm</td>
              {products.map(product => (
                <td key={`type-${product.id}`} className="comp-attribute-value">
                  {product.productTypeName || 'Không có thông tin'}
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="comp-attribute-name">Loại da phù hợp</td>
              {products.map(product => (
                <td key={`skin-${product.id}`} className="comp-attribute-value">
                  {product.skinTypes && product.skinTypes.length > 0 
                    ? (typeof product.skinTypes[0] === 'object' 
                       ? product.skinTypes.map(skin => skin.name).join(', ') 
                       : product.skinTypes.join(', '))
                    : 'Tất cả loại da'}
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="comp-attribute-name">Mô tả</td>
              {products.map(product => (
                <td key={`desc-${product.id}`} className="comp-attribute-value comp-description">
                  {product.description || 'Không có mô tả'}
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="comp-attribute-name">Thao tác</td>
              {products.map(product => (
                <td key={`actions-${product.id}`} className="comp-attribute-value">
                  <div className="comp-product-actions">
                    <button 
                      className="comp-view-details"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      Xem chi tiết
                    </button>
                    <button 
                      className="comp-add-to-cart"
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.isAvailable || addingToCart[product.id]}
                    >
                      {addingToCart[product.id] ? 'Đang thêm...' : 
                       product.isAvailable ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductComparison; 