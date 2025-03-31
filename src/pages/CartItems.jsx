// src/pages/CartItems.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaMinus, FaTrash, FaSpinner } from "react-icons/fa";
import { useCart } from "../store/CartContext";
import "/src/styles/CartItems.css";
import { formatProductImageUrl, handleImageError } from "../utils/imageUtils";
import { getProductsWithFilters } from "../api/productApi";

// Thêm style nội tuyến để ghi đè lên các animation không cần thiết
const overrideStyles = {
  quantityButton: {
    width: '38px',
    height: '38px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s ease, background-color 0.2s ease',
  },
  quantityButtonDisabled: {
    backgroundColor: '#bdbdbd',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  removeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s ease, background-color 0.2s ease',
  },
  removeButtonDisabled: {
    backgroundColor: '#bdbdbd',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  icon: {
    width: '20px',
    height: '20px',
    color: 'white',
    fill: 'white',
  }
};

const CartItems = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    cartData,
    loading: globalLoading, 
    error: globalError, 
    subtotal,
    formatPrice,
    updateCartItem,
    removeCartItem,
    loadCartItems
  } = useCart();
  
  // Local state cho UI loading
  const [updatingItems, setUpdatingItems] = useState({});
  const [deletingItems, setDeletingItems] = useState({});
  const [localError, setLocalError] = useState(null);
  const [iconsLoaded, setIconsLoaded] = useState(true);
  
  // State for recommended products
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 4;
  const recommendedSectionRef = useRef(null);
  
  // Refs cho theo dõi thay đổi và tạo hiệu ứng
  const prevQuantitiesRef = useRef({});
  const animatingItemsRef = useRef({});

  // Kiểm tra xem icons có load được không
  useEffect(() => {
    // Hàm kiểm tra icons
    const checkIcons = () => {
      try {
        // Kiểm tra xem FaPlus/FaMinus có đúng không
        const hasValidIcons = 
          typeof FaPlus === 'function' && 
          typeof FaMinus === 'function' && 
          typeof FaTrash === 'function';
        
        setIconsLoaded(hasValidIcons);
      } catch (error) {
        console.error("Error checking icons:", error);
        setIconsLoaded(false);
      }
    };
    
    checkIcons();
  }, []);

  // Debugging the cartItems
  useEffect(() => {
    console.log("CartItems component - cartItems:", cartItems);
    console.log("CartItems component - cartData:", cartData);
    
    // Cập nhật ref sau mỗi lần cartItems thay đổi
    const newQuantities = {};
    cartItems.forEach(item => {
      newQuantities[item.id] = item.quantity;
    });
    prevQuantitiesRef.current = newQuantities;
  }, [cartItems, cartData]);

  const shippingFee = 30000;
  const total = subtotal + shippingFee;

  // Update quantity, chỉ vô hiệu hóa nút khi đang cập nhật
  const handleUpdateQuantity = async (itemId, productId, change, currentQuantity) => {
    try {
      // Đánh dấu item đang được update để vô hiệu hóa nút
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
      
      // Xóa lỗi cũ nếu có
      setLocalError(null);
      
      // Tính toán số lượng mới
      const newQuantity = Math.max(1, currentQuantity + change);
      console.log(`Updating item ${itemId} quantity from ${currentQuantity} to ${newQuantity}`);
      
      // Gọi hàm updateCartItem từ context
      await updateCartItem(itemId, productId, newQuantity);
      
      // Cập nhật prevQuantitiesRef sau khi thành công
      prevQuantitiesRef.current[itemId] = newQuantity;
    } catch (error) {
      console.error("Error updating item quantity:", error);
      // Ưu tiên hiển thị thông báo lỗi từ API nếu có
      const errorMessage = error.message || "Không thể cập nhật số lượng. Vui lòng thử lại!";
      setLocalError(errorMessage);
    } finally {
      // Bỏ đánh dấu updating sau khi hoàn thành
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Xử lý xóa item với loading state và hiệu ứng chuyển đổi
  const handleRemoveItem = async (itemId) => {
    try {
      // Hiển thị loading cho mục này
      setDeletingItems(prev => ({ ...prev, [itemId]: true }));
      
      // Xóa lỗi cũ nếu có
      setLocalError(null);
      
      // Thêm transition khi xóa
      animatingItemsRef.current[itemId] = "remove";
      
      await removeCartItem(itemId);
    } catch (error) {
      console.error("Error removing cart item:", error);
      setLocalError("Không thể xóa sản phẩm. Vui lòng thử lại!");
      // Reset loading state và animation trong trường hợp lỗi
      setDeletingItems(prev => ({ ...prev, [itemId]: false }));
      delete animatingItemsRef.current[itemId];
    }
  };

  // Tính toán giá trị item total với hiệu ứng hiển thị tức thì
  const calculateItemTotal = (item, isUpdating) => {
    const price = item.productPrice ?? 0;
    const quantity = item.quantity ?? 0;
    return formatPrice(price * quantity);
  };

  // Handle checkout
  const handleCheckout = () => {
    navigate("/Checkout", { state: { cartItems, subtotal, shippingFee, total } });
  };

  // Check if any item has stock issues
  const hasStockIssues = useMemo(() => {
    return cartItems.some(item => {
      const stock = item.productStock ?? 0;
      // Chỉ coi là có vấn đề khi số lượng vượt quá stock hoặc stock <= 0
      return stock <= 0 || item.quantity > stock;
    });
  }, [cartItems]);

  // Add function to handle product click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Fetch recommended products based on cart items
  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      if (!cartItems || cartItems.length === 0) return;
      
      try {
        setLoadingRecommendations(true);
        
        // Take product types and brands from cart items
        const productTypes = [...new Set(cartItems.map(item => item.productTypeId).filter(Boolean))];
        const productBrands = [...new Set(cartItems.map(item => item.productBrandId).filter(Boolean))];
        
        let recommendedProductsData = [];
        
        // Try to get products with the same product type
        if (productTypes.length > 0) {
          for (const typeId of productTypes) {
            if (recommendedProductsData.length >= 12) break;
            
            const typeFilters = {
              productTypeId: typeId
            };
            
            const typeResponse = await getProductsWithFilters(1, 8, typeFilters);
            if (typeResponse && typeResponse.products) {
              const newRecommendations = typeResponse.products.filter(
                product => !cartItems.some(item => item.productId === product.id) &&
                !recommendedProductsData.some(p => p.id === product.id)
              );
              
              recommendedProductsData = [
                ...recommendedProductsData,
                ...newRecommendations
              ].slice(0, 12);
            }
          }
        }
        
        // If we don't have enough results, try by brand
        if (recommendedProductsData.length < 8 && productBrands.length > 0) {
          for (const brandId of productBrands) {
            if (recommendedProductsData.length >= 12) break;
            
            const brandFilters = {
              branchId: brandId
            };
            
            const brandResponse = await getProductsWithFilters(1, 8, brandFilters);
            if (brandResponse && brandResponse.products) {
              const brandRecommendations = brandResponse.products.filter(
                product => !cartItems.some(item => item.productId === product.id) &&
                !recommendedProductsData.some(p => p.id === product.id)
              );
              
              recommendedProductsData = [
                ...recommendedProductsData,
                ...brandRecommendations
              ].slice(0, 12);
            }
          }
        }
        
        // If still not enough, get some general popular products
        if (recommendedProductsData.length < 8) {
          const popularResponse = await getProductsWithFilters(1, 12, {});
          if (popularResponse && popularResponse.products) {
            const popularRecommendations = popularResponse.products.filter(
              product => !cartItems.some(item => item.productId === product.id) &&
              !recommendedProductsData.some(p => p.id === product.id)
            );
            
            recommendedProductsData = [
              ...recommendedProductsData,
              ...popularRecommendations
            ].slice(0, 12);
          }
        }
        
        // Shuffle the recommendations for variety using Fisher-Yates algorithm
        for (let i = recommendedProductsData.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [recommendedProductsData[i], recommendedProductsData[j]] = 
          [recommendedProductsData[j], recommendedProductsData[i]];
        }
        
        setRecommendedProducts(recommendedProductsData);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm gợi ý:", error);
      } finally {
        setLoadingRecommendations(false);
      }
    };
    
    fetchRecommendedProducts();
  }, [cartItems]);
  
  // Navigation functions for recommended products
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

  if (globalLoading) {
    return (
      <div className="loading-container">
        <h2>Đang tải giỏ hàng...</h2>
      </div>
    );
  }

  if (globalError) {
    return (
      <div className="error-container">
        <h2>Có lỗi xảy ra</h2>
        <p>{globalError}</p>
        <button onClick={loadCartItems}>Thử lại</button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-header">
            <h1>Giỏ Hàng</h1>
          </div>
          <div className="empty-cart">
            <h2>Giỏ hàng của bạn đang trống 🛒</h2>
            <p>Hãy thêm sản phẩm để tiếp tục mua sắm!</p>
            <button onClick={() => navigate("/product-list")} className="continue-shopping">
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Giỏ Hàng</h1>
          <span className="item-count">{cartItems.length} sản phẩm</span>
        </div>

        {localError && (
          <div className="local-error-message">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <div className="error-title">Không thể cập nhật giỏ hàng</div>
              <div className="error-details">{localError}</div>
            </div>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <h2>Giỏ hàng của bạn đang trống 🛒</h2>
            <p>Hãy thêm sản phẩm để tiếp tục mua sắm!</p>
            <button onClick={() => navigate("/product-list")} className="continue-shopping">
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map((item) => {
                const productPrice = item.productPrice ?? 0;
                const productName = item.productName || "Unnamed product";
                const isUpdating = updatingItems[item.id];
                const isDeleting = deletingItems[item.id];
                const animationState = animatingItemsRef.current[item.id] || "";
                // Use product's stock directly
                const availableStock = item.productStock ?? 0;
                const isOutOfStock = availableStock <= 0;
                // Sửa điều kiện để chỉ coi là max khi lớn hơn, bằng vẫn hợp lệ
                const isMaxQuantity = item.quantity > availableStock;
                const isAtMaxQuantity = item.quantity === availableStock;
                
                if (isDeleting) {
                  return (
                    <div key={item.id} className="cart-item deleting">
                      <div className="deleting-overlay">
                        {iconsLoaded ? (
                          <FaSpinner className="spinner-icon" />
                        ) : (
                          <div className="spinner-fallback">⟳</div>
                        )}
                        <p>Đang xóa...</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={item.id} className={`cart-item ${isOutOfStock ? 'out-of-stock' : ''} ${isMaxQuantity ? 'max-quantity' : ''} ${isAtMaxQuantity ? 'at-max-quantity' : ''}`}>
                    <div className="item-image" onClick={() => handleProductClick(item.productId)} style={{ cursor: 'pointer' }}>
                      <img 
                        src={formatProductImageUrl(item.productImage)} 
                        alt={productName}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/src/assets/images/aboutus.jpg";
                        }}
                      />
                    </div>
                    <div className="item-details">
                      <h3 onClick={() => handleProductClick(item.productId)} style={{ cursor: 'pointer' }}>
                        {productName}
                      </h3>
                      <div className="item-price">
                        {formatPrice(productPrice)}
                      </div>
                      <div className="item-total">
                        Thành tiền: {calculateItemTotal(item, isUpdating)}
                      </div>
                      <div className={`item-stock ${isOutOfStock ? 'out-of-stock' : ''} ${isMaxQuantity ? 'max-quantity' : ''} ${isAtMaxQuantity ? 'at-max-quantity' : ''}`}>
                        <strong>Tình trạng:</strong> {
                          isOutOfStock 
                            ? <span className="stock-status error">Hết hàng</span> 
                            : isMaxQuantity 
                              ? <span className="stock-status error">Vượt giới hạn tồn kho ({availableStock})</span>
                              : isAtMaxQuantity
                                ? <span className="stock-status warning">Đạt giới hạn tồn kho ({availableStock})</span> 
                                : <span className="stock-status available">Còn {availableStock} sản phẩm</span>
                        }
                      </div>
                      
                      {(isOutOfStock || isMaxQuantity || isAtMaxQuantity) && (
                        <div className="stock-alert">
                          {isOutOfStock 
                            ? "Sản phẩm này hiện đã hết hàng, vui lòng xóa khỏi giỏ hàng hoặc quay lại sau." 
                            : isMaxQuantity
                              ? `Số lượng đã vượt quá tồn kho hiện có (${availableStock}), vui lòng giảm số lượng.`
                              : `Bạn đã chọn tối đa số lượng có thể (${availableStock}).`}
                        </div>
                      )}
                    </div>

                    <div className="item-controls">
                      <div className="quantity-controls">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.productId, -1, item.quantity)}
                          disabled={item.quantity <= 1 || isUpdating}
                          className="minus-btn"
                          aria-label="Giảm số lượng"
                          type="button"
                          style={{
                            ...overrideStyles.quantityButton,
                            ...(item.quantity <= 1 || isUpdating ? overrideStyles.quantityButtonDisabled : {})
                          }}
                        >
                          <FaMinus style={overrideStyles.icon} />
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.productId, 1, item.quantity)}
                          disabled={isUpdating || isMaxQuantity || isOutOfStock}
                          className="plus-btn"
                          aria-label="Tăng số lượng"
                          type="button"
                          style={{
                            ...overrideStyles.quantityButton,
                            ...(isUpdating || isMaxQuantity || isOutOfStock ? overrideStyles.quantityButtonDisabled : {})
                          }}
                        >
                          <FaPlus style={overrideStyles.icon} />
                        </button>
                      </div>
                      <button 
                        className="remove-button" 
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isDeleting || isUpdating}
                        type="button"
                        style={{
                          ...overrideStyles.removeButton,
                          ...(isDeleting || isUpdating ? overrideStyles.removeButtonDisabled : {})
                        }}
                      >
                        <FaTrash style={overrideStyles.icon} /> <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <h3>Tóm Tắt Đơn Hàng</h3>
              <div className="summary-row">
                <span>Tổng Tạm Tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Phí Vận Chuyển</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <div className="summary-row total">
                <span>Tổng Cộng</span>
                <span>{formatPrice(total)}</span>
              </div>
              
              {hasStockIssues && (
                <div className="stock-warning">
                  <p>Không thể thanh toán vì có sản phẩm hết hàng hoặc số lượng vượt quá tồn kho.</p>
                  <p>Vui lòng điều chỉnh số lượng hoặc xóa các sản phẩm không đủ hàng.</p>
                </div>
              )}
              
              <button
                className="checkout-button"
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || hasStockIssues}
              >
                {hasStockIssues ? 'Có sản phẩm hết hàng' : 'Tiến Hành Thanh Toán'}
              </button>
            </div>
          </div>
        )}
        
        {/* Recommended Products Section */}
        {cartItems.length > 0 && recommendedProducts.length > 0 && (
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
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItems;
