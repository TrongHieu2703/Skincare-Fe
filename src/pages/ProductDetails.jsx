// src/pages/ProductDetails.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, getProductsWithFilters } from "../api/productApi";
import { getReviewsByProductId, getReviewsWithRating } from "../api/reviewApi";
import { useCart } from "../store/CartContext";
import { useAuth } from "../auth/AuthProvider";
import "/src/styles/ProductDetails.css";
import { formatProductImageUrl, handleImageError } from "../utils/imageUtils";
import { FaStar, FaRegStar, FaStarHalfAlt, FaUser, FaCalendarAlt } from "react-icons/fa";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [addingToCart, setAddingToCart] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 4;
  const recommendedSectionRef = useRef(null);
  
  // Use cart context
  const { addItemToCart, formatPrice } = useCart();
  const { isAuthenticated } = useAuth();

  // Update useEffect to fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await getProductById(id);
        setProduct(response.data);
        setError(null);
        
        // Once we have the product details, fetch recommended products
        fetchRecommendedProducts(response.data);
        
        // Also fetch reviews
        fetchProductReviews(id);
      } catch (error) {
        console.error("Lỗi khi tải thông tin sản phẩm:", error);
        setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);
  
  // Fetch reviews for this product
  const fetchProductReviews = async (productId) => {
    try {
      setReviewsLoading(true);
      console.log("Fetching reviews for product ID:", productId);
      
      // Use the combined API to get both reviews and rating in one call
      const response = await getReviewsWithRating(productId);
      console.log("Reviews with rating response:", response);
      
      // Check both possible response structures
      if (response && response.data && response.data.reviews) {
        // If the response has data.reviews structure (from backend)
        console.log("Processing reviews from data.reviews structure:", response.data.reviews);
        setReviews(response.data.reviews);
        
        // Set the average rating directly from the API response
        if (response.data.averageRating !== null && response.data.averageRating !== undefined) {
          setAvgRating(response.data.averageRating);
          console.log("Setting average rating from API:", response.data.averageRating);
        } else if (response.data.reviews.length > 0) {
          // Calculate it locally if needed as a fallback
          const totalRating = response.data.reviews.reduce((sum, review) => sum + review.rating, 0);
          const avg = totalRating / response.data.reviews.length;
          setAvgRating(avg);
          console.log("Calculated average rating:", avg);
        }
      } else if (response && response.reviews) {
        // If the response has direct reviews property 
        console.log("Processing reviews from direct reviews property:", response.reviews);
        setReviews(response.reviews);
        
        // Set the average rating directly from the API response
        if (response.averageRating !== null && response.averageRating !== undefined) {
          setAvgRating(response.averageRating);
          console.log("Setting average rating from API:", response.averageRating);
        } else if (response.reviews.length > 0) {
          // Calculate it locally if needed as a fallback
          const totalRating = response.reviews.reduce((sum, review) => sum + review.rating, 0);
          const avg = totalRating / response.reviews.length;
          setAvgRating(avg);
          console.log("Calculated average rating:", avg);
        }
      } else {
        // Fallback to old API if needed
        console.log("Falling back to getReviewsByProductId API");
        const reviewsResponse = await getReviewsByProductId(productId);
        console.log("getReviewsByProductId response:", reviewsResponse);
        
        if (reviewsResponse && reviewsResponse.data) {
          setReviews(reviewsResponse.data);
          console.log("Set reviews from fallback API:", reviewsResponse.data);
          
          // Calculate average rating
          if (reviewsResponse.data.length > 0) {
            const totalRating = reviewsResponse.data.reduce((sum, review) => sum + review.rating, 0);
            const avg = totalRating / reviewsResponse.data.length;
            setAvgRating(avg);
            console.log("Calculated average rating from fallback:", avg);
          }
        } else {
          console.log("No reviews found for product", productId);
          setReviews([]);
          setAvgRating(0);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải đánh giá sản phẩm:", error);
      // Try fallback on error
      try {
        console.log("Error occurred, trying fallback to getReviewsByProductId");
        const reviewsResponse = await getReviewsByProductId(productId);
        console.log("Fallback response:", reviewsResponse);
        
        if (reviewsResponse && reviewsResponse.data) {
          setReviews(reviewsResponse.data);
          
          if (reviewsResponse.data.length > 0) {
            const totalRating = reviewsResponse.data.reduce((sum, review) => sum + review.rating, 0);
            const avg = totalRating / reviewsResponse.data.length;
            setAvgRating(avg);
          }
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        setReviews([]);
        setAvgRating(0);
      }
    } finally {
      setReviewsLoading(false);
    }
  };
  
  // Fetch recommended products based on current product
  const fetchRecommendedProducts = async (currentProduct) => {
    if (!currentProduct) return;
    
    try {
      setLoadingRecommendations(true);
      
      // Strategy: First try to get products with the same product type and brand
      // If that doesn't yield enough results, try by skin type and brand
      // If still not enough, try just the brand
      
      let recommendedProductsData = [];
      
      // Try to get products with the same product type, but different brand
      if (currentProduct.productTypeId) {
        const typeFilters = {
          productTypeId: currentProduct.productTypeId
        };
        
        // Get by product type - fetch more products for carousel
        const typeResponse = await getProductsWithFilters(1, 12, typeFilters);
        if (typeResponse && typeResponse.products) {
          recommendedProductsData = typeResponse.products.filter(
            product => product.id !== parseInt(id)
          );
        }
      }
      
      // If we don't have enough results, try by skin type
      if (recommendedProductsData.length < 8 && currentProduct.skinTypeIds && currentProduct.skinTypeIds.length > 0) {
        const skinTypeFilters = {
          skinTypeId: currentProduct.skinTypeIds[0]
        };
        
        // Get by skin type
        const skinTypeResponse = await getProductsWithFilters(1, 12, skinTypeFilters);
        if (skinTypeResponse && skinTypeResponse.products) {
          // Filter out already included products and the current product
          const newRecommendations = skinTypeResponse.products.filter(
            product => product.id !== parseInt(id) && 
            !recommendedProductsData.some(p => p.id === product.id)
          );
          
          // Add new recommendations up to a total of 12
          recommendedProductsData = [
            ...recommendedProductsData,
            ...newRecommendations
          ].slice(0, 12);
        }
      }
      
      // If we still don't have enough results, try by brand
      if (recommendedProductsData.length < 8 && currentProduct.productBrandId) {
        const brandFilters = {
          branchId: currentProduct.productBrandId
        };
        
        // Get by brand
        const brandResponse = await getProductsWithFilters(1, 12, brandFilters);
        if (brandResponse && brandResponse.products) {
          // Filter out already included products and the current product
          const brandRecommendations = brandResponse.products.filter(
            product => product.id !== parseInt(id) && 
            !recommendedProductsData.some(p => p.id === product.id)
          );
          
          // Add brand recommendations
          recommendedProductsData = [
            ...recommendedProductsData,
            ...brandRecommendations
          ].slice(0, 12);
        }
      }
      
      // Shuffle the recommendations for some variety using Fisher-Yates algorithm
      for (let i = recommendedProductsData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [recommendedProductsData[i], recommendedProductsData[j]] = 
        [recommendedProductsData[j], recommendedProductsData[i]];
      }
      
      // Store all recommended products
      setRecommendedProducts(recommendedProductsData);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm gợi ý:", error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleAddToCart = async () => {
    if (addingToCart) return; // Prevent multiple clicks
    
    try {
      setAddingToCart(true);
      setError(null);
      
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
      
      // Handle stock error
      if (error.type === "INSUFFICIENT_INVENTORY") {
        setError("❌ " + error.message);
      } else if (error.response?.status === 401) {
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
  
  // Handle buy now - add to cart then go to checkout
  const handleBuyNow = async () => {
    if (addingToCart) return; // Prevent multiple clicks
    
    try {
      setAddingToCart(true);
      setError(null);
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Vui lòng đăng nhập để mua hàng!");
        navigate('/login', { state: { from: `/product/${id}` } });
        return;
      }
      
      // Check if there's enough stock
      if (product.stock < quantity) {
        setError(`❌ Không đủ hàng! Chỉ còn ${product.stock} sản phẩm.`);
        return;
      }
      
      // Create a buyNowItem object
      const buyNowItem = {
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productImage: product.image,
        productStock: product.stock,
        quantity: quantity
      };
      
      // Calculate totals
      const itemSubtotal = product.price * quantity;
      const shippingFee = 30000; // Standard shipping fee
      const total = itemSubtotal + shippingFee;
      
      // Navigate to checkout with the product information
      navigate('/checkout', { 
        state: { 
          cartItems: [buyNowItem], 
          subtotal: itemSubtotal, 
          shippingFee: shippingFee, 
          total: total,
          isBuyNow: true 
        } 
      });
    } catch (error) {
      console.error("Lỗi khi mua ngay:", error);
      
      if (error.response?.status === 401) {
        setError("❌ Vui lòng đăng nhập để mua hàng!");
        navigate('/login', { state: { from: `/product/${id}` } });
      } else {
        setError("❌ Không thể mua ngay! " + (error.response?.data?.message || error.message || "Vui lòng thử lại sau."));
      }
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setAddingToCart(false);
    }
  };

  // Update useEffect for quantity control
  useEffect(() => {
    // Check if product has stock
    if (product?.stock && product.stock > 0) {
      if (quantity > product.stock) {
        setQuantity(Math.max(1, product.stock));
      }
    }
  }, [product, quantity]);
  
  // Update the navigation functions to use page-based navigation
  const scrollNext = () => {
    const totalPages = Math.ceil(recommendedProducts.length / productsPerPage);
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const scrollPrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Render star rating component
  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="star filled" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="star half" />);
      } else {
        stars.push(<FaRegStar key={i} className="star empty" />);
      }
    }
    
    return stars;
  };
  
  // Format date for reviews
  const formatReviewDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
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

  // Determine if product is in stock
  const isInStock = product.stock > 0;

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
              src={formatProductImageUrl(product.image || product.mainImage)}
              alt={product.name}
              onError={(e) => handleImageError(e, "/src/assets/images/aboutus.jpg")}
            />
          </div>
          <div className="thumbnail-list">
            {product.images?.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt={`${product.name} - Ảnh ${idx + 1}`} 
                className="thumbnail"
                onError={(e) => handleImageError(e, "/src/assets/images/aboutus.jpg")}
              />
            ))}
          </div>
        </div>

        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>
          
          {/* Display average rating */}
          {avgRating > 0 && (
            <div className="product-rating-summary">
              <div className="rating-stars">
                {renderStarRating(avgRating)}
              </div>
              <span className="rating-avg">{avgRating.toFixed(1)}</span>
              <span className="review-count">({reviews.length} đánh giá)</span>
            </div>
          )}
          
          <div className="product-meta">
            <div className="meta-row">
              <p className="product-brand">
                <strong>Thương hiệu:</strong> {product.productBrandName}
              </p>
              <p className="product-stock">
                <strong>Tình trạng:</strong>{" "}
                {isInStock 
                  ? `Còn ${product.stock} sản phẩm`
                  : "Hết hàng"}
              </p>
            </div>
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
              disabled={quantity >= (product?.stock || 0)}
            >
              +
            </button>
          </div>

          <div className="product-actions">
            <button 
              className={`add-to-cart-btn ${addingToCart ? 'loading' : ''}`}
              onClick={handleAddToCart}
              disabled={!isInStock || addingToCart}
            >
              {addingToCart 
                ? 'Đang thêm...' 
                : !isInStock
                  ? 'Hết hàng' 
                  : 'Thêm vào giỏ hàng'}
            </button>
            
            <button 
              className={`buy-now-btn ${addingToCart ? 'loading' : ''}`}
              onClick={handleBuyNow}
              disabled={!isInStock || addingToCart}
            >
              {addingToCart 
                ? 'Đang xử lý...' 
                : !isInStock
                  ? 'Hết hàng' 
                  : 'Mua ngay'}
            </button>
          </div>
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
            Đánh giá ({reviews.length})
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
              <h3>Đánh giá từ khách hàng: {reviews.length > 0 ? `(${avgRating.toFixed(1)}/5)` : ''}</h3>
              
              {reviewsLoading ? (
                <div className="loading-reviews">Đang tải đánh giá...</div>
              ) : reviews && reviews.length > 0 ? (
                <div className="reviews-list">
                  {Array.isArray(reviews) && reviews.map(review => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <FaUser className="user-icon" />
                          <span className="reviewer-name">{review.customerName || 'Khách hàng'}</span>
                        </div>
                        <div className="review-date">
                          <FaCalendarAlt className="calendar-icon" />
                          <span>{formatReviewDate(review.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="review-rating">
                        {renderStarRating(review.rating)}
                        <span className="rating-value">{review.rating}/5</span>
                      </div>
                      
                      <div className="review-comment">
                        {review.comment}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-reviews">
                  <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                  
                  {isAuthenticated && (
                    <p className="review-hint">
                      Bạn đã mua sản phẩm này? Hãy đánh giá sản phẩm trong trang chi tiết đơn hàng sau khi đã nhận được sản phẩm.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Recommended Products Section */}
      <div className="recommended-products-section" ref={recommendedSectionRef}>
        <div className="recommended-header">
          <h2>Bạn cũng có thể thích</h2>
          {recommendedProducts.length > productsPerPage && (
            <div className="navigation-buttons">
              <button 
                className="nav-btn prev" 
                onClick={scrollPrev}
                disabled={currentPage === 0}
                aria-label="Xem các sản phẩm trước đó"
              >
                <span className="arrow">&#8249;</span>
              </button>
              <button 
                className="nav-btn next" 
                onClick={scrollNext}
                disabled={currentPage >= Math.ceil(recommendedProducts.length / productsPerPage) - 1}
                aria-label="Xem thêm sản phẩm"
              >
                <span className="arrow">&#8250;</span>
              </button>
            </div>
          )}
        </div>
        
        {loadingRecommendations ? (
          <div className="loading-recommendations">Đang tải sản phẩm gợi ý...</div>
        ) : recommendedProducts.length > 0 ? (
          <div className="recommended-products-carousel">
            <div className="carousel-inner">
              {recommendedProducts
                .slice(currentPage * productsPerPage, (currentPage + 1) * productsPerPage)
                .map((recommendedProduct) => (
                <div key={recommendedProduct.id} className="product-card">
                  <div 
                    onClick={() => navigate(`/product/${recommendedProduct.id}`)}
                    className="product-link" 
                  >
                    <div className="product-image-container">
                      <img
                        src={formatProductImageUrl(recommendedProduct.image)}
                        alt={recommendedProduct.name}
                        className="product-image"
                        onError={(e) => handleImageError(e, "/src/assets/images/aboutus.jpg")}
                        loading="lazy"
                        width="200"
                        height="200"
                      />
                    </div>
                    <h3 className="product-name">{recommendedProduct.name}</h3>
                    <p className="product-price">{formatPrice(recommendedProduct.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>Không tìm thấy sản phẩm gợi ý phù hợp.</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
