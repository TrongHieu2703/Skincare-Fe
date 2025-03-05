// src/pages/CartItems.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import { getCartByUser, updateCart, deleteCartItem } from "../api/cartApi";
import "/src/styles/CartItems.css";

const CartItems = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Lấy cart từ server
  useEffect(() => {
    async function fetchCart() {
      try {
        const data = await getCartByUser();
        setCartItems(data);
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, []);

  // Cập nhật số lượng
  const updateQuantity = async (cartId, productId, change) => {
    // Cập nhật state local
    const updatedItems = cartItems.map((item) => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(updatedItems);

    // Gọi API updateCart
    const itemToUpdate = updatedItems.find((item) => item.cartId === cartId);
    if (itemToUpdate) {
      try {
        await updateCart(itemToUpdate.cartId, productId, itemToUpdate.quantity);
      } catch (err) {
        console.error("Error updating cart:", err);
      }
    }
  };

  // Xóa item
  const removeItem = async (cartId) => {
    try {
      await deleteCartItem(cartId);
      setCartItems(cartItems.filter((item) => item.cartId !== cartId));
    } catch (error) {
      console.error("Error deleting cart item:", error);
    }
  };

  // Tính subtotal dựa trên item.product?.price
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const shippingFee = 30000;
  const total = subtotal + shippingFee;

  const handleCheckout = () => {
    navigate("/Checkout", { state: { cartItems, subtotal, shippingFee, total } });
  };

  if (loading) {
    return <h2>Đang tải giỏ hàng...</h2>;
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
                        {formatVND(productPrice)}
                      </div>
                      <div className="item-total">
                        Thành tiền: {formatVND(productPrice * item.quantity)}
                      </div>
                    </div>

                    <div className="item-controls">
                      <div className="quantity-controls">
                        <button
                          onClick={() => updateQuantity(item.cartId, item.productId, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartId, item.productId, 1)}>
                          <FaPlus />
                        </button>
                      </div>
                      <button className="remove-button" onClick={() => removeItem(item.cartId)}>
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
                <span>{formatVND(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Phí Vận Chuyển</span>
                <span>{formatVND(shippingFee)}</span>
              </div>
              <div className="summary-row total">
                <span>Tổng Cộng</span>
                <span>{formatVND(total)}</span>
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
