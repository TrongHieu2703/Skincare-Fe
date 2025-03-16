import { createContext, useContext, useState, useEffect } from "react";
import { getCartByUser, addToCart, updateCart, deleteCartItem, clearCart as clearCartApi } from "../api/cartApi";

// Create the context
const CartContext = createContext();

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // State
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate derived values
  const cartCount = cartItems.length;
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  // Load cart items on first render and when auth state changes
  const loadCartItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is logged in by checking token existence
      const token = localStorage.getItem("token");
      if (!token) {
        setCartItems([]);
        setLoading(false);
        return;
      }
      
      const response = await getCartByUser();
      console.log("Loaded cart items:", response);
      
      if (response && response.data) {
        setCartItems(Array.isArray(response.data) ? response.data : []);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error("Error loading cart:", err);
      
      // Handle unauthorized errors
      if (err.response?.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem("token");
        setCartItems([]);
      } else {
        setError("Không thể tải giỏ hàng. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load cart on mount and when auth state changes
  useEffect(() => {
    const initialize = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        await loadCartItems();
      } else {
        setCartItems([]);
        setLoading(false);
      }
    };
    
    initialize();
  }, []);

  // Add an item to the cart
  const addItemToCart = async (productId, quantity) => {
    try {
      setError(null);
      
      // Check token before making the request
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Unauthorized: No token found");
      }
      
      // Call API to add item to cart
      const response = await addToCart(productId, quantity);
      console.log("Add to cart response:", response);
      
      // Only reload if add was successful
      if (response) {
        await loadCartItems(); // Reload the entire cart to ensure consistency
      }
      
      return response;
    } catch (err) {
      console.error("Error adding item to cart:", err);
      
      // Handle unauthorized errors
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
      }
      
      setError("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
      throw err;
    }
  };

  // Update an item in the cart
  const updateCartItem = async (cartId, productId, quantity) => {
    try {
      setError(null);
      // Optimistically update the UI
      setCartItems(items =>
        items.map(item =>
          item.cartId === cartId
            ? { ...item, quantity }
            : item
        )
      );
      
      await updateCart(cartId, productId, quantity);
      // Reload to ensure server-side consistency
      await loadCartItems();
    } catch (err) {
      console.error("Error updating cart item:", err);
      setError("Không thể cập nhật giỏ hàng. Vui lòng thử lại.");
      // Rollback the optimistic update by reloading
      await loadCartItems();
      throw err;
    }
  };

  // Remove an item from the cart
  const removeCartItem = async (cartId) => {
    try {
      setError(null);
      // Optimistically update the UI
      setCartItems(items => items.filter(item => item.cartId !== cartId));
      
      await deleteCartItem(cartId);
      // No need to reload since we're just removing an item
    } catch (err) {
      console.error("Error removing cart item:", err);
      setError("Không thể xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại.");
      // Rollback the optimistic update by reloading
      await loadCartItems();
      throw err;
    }
  };

  // Clear the entire cart (used after successful order)
  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the API to clear the cart on the server
      await clearCartApi();
      
      // Clear the local cart state
      setCartItems([]);
      
      console.log("Cart cleared successfully");
      return true;
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError("Không thể xóa giỏ hàng. Vui lòng thử lại.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Value to be provided
  const value = {
    cartItems,
    cartCount,
    loading,
    error,
    subtotal,
    loadCartItems,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    formatPrice
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 