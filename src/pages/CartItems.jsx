// src/pages/CartItems.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import { useCart } from "../store/CartContext";
import "/src/styles/CartItems.css";

const CartItems = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    loading, 
    error, 
    subtotal,
    formatPrice,
    updateCartItem,
    removeCartItem,
    loadCartItems
  } = useCart();

  // Load cart items when component mounts - FIX: Add empty dependency array
  useEffect(() => {
    // Only load cart items once when component mounts
    loadCartItems();
    // Adding empty dependency array to prevent infinite loops
  }, []); // <-- Empty dependency array ensures this runs only once

  const shippingFee = 30000;
  const total = subtotal + shippingFee;

  // Update quantity
  const updateQuantity = async (cartId, productId, change, currentQuantity) => {
    const newQuantity = Math.max(1, currentQuantity + change);
    await updateCartItem(cartId, productId, newQuantity);
  };

  // Handle checkout
  const handleCheckout = () => {
    navigate("/Checkout", { state: { cartItems, subtotal, shippingFee, total } });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Đang tải giỏ hàng...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Có lỗi xảy ra</h2>
        <p>{error}</p>
        <button onClick={loadCartItems}>Thử lại</button>
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
                const productPrice = item.product?.price ?? 0;
                const productName = item.product?.name || "Unnamed product";
                const productImage = item.product?.mainImage || "https://via.placeholder.com/150";

                return (
                  <div key={item.cartId} className="cart-item">
                    <div className="item-image">
                      <img src={productImage} alt={productName} />
                    </div>

                    <div className="item-details">
                      <h3>{productName}</h3>
                      <div className="item-price">
                        {formatPrice(productPrice)}
                      </div>
                      <div className="item-total">
                        Thành tiền: {formatPrice(productPrice * item.quantity)}
                      </div>
                    </div>

                    <div className="item-controls">
                      <div className="quantity-controls">
                        <button
                          onClick={() => updateQuantity(item.cartId, item.productId, -1, item.quantity)}
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartId, item.productId, 1, item.quantity)}>
                          <FaPlus />
                        </button>
                      </div>
                      <button className="remove-button" onClick={() => removeCartItem(item.cartId)}>
                        <FaTrash /> Xóa
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
              <button
                className="checkout-button"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
                Tiến Hành Thanh Toán
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItems;
