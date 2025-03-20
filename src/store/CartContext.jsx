import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "../auth/AuthProvider";
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
  const [cartData, setCartData] = useState(null); // Add state for entire cart data
  const [loading, setLoading] = useState(false); // Start with false to allow initial load
  const [error, setError] = useState(null);
  
  // Refs to help with preventing duplicate calls
  const loadingRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  
  // Use Auth context to monitor authentication state
  const { isAuthenticated } = useAuth();

  // Calculate derived values
  const cartCount = cartItems.length;
  const subtotal = useMemo(() => {
    if (cartData && typeof cartData.totalPrice === 'number') {
      return cartData.totalPrice; // Use the totalPrice from API if available
    }
    // Fallback calculation if totalPrice not available
    return cartItems.reduce((sum, item) => {
      const price = item.productPrice ?? 0;
      return sum + price * item.quantity;
    }, 0);
  }, [cartItems, cartData]);

  // Load cart items when auth state changes - using useRef to prevent circular dependencies
  const loadCartItems = useCallback(async () => {
    // Use a ref to check/set loading state to prevent re-renders from affecting dependencies
    if (loadingRef.current) {
      console.log("Already loading cart, skipping duplicate call");
      return;
    }
    
    try {
      // Set both the state and the ref
      setLoading(true);
      loadingRef.current = true;
      setError(null);
      
      // Check if user is logged in by checking token existence
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, clearing cart");
        setCartItems([]);
        setCartData(null);
        return;
      }
      
      console.log("Loading cart items...");
      const response = await getCartByUser();
      console.log("Loaded cart items:", response);
      
      if (response && response.data) {
        // Store the entire cart data
        setCartData(response.data);
        
        // Extract cart items from the nested structure
        const items = response.data.cartItems || [];
        console.log("Extracted cart items:", items);
        setCartItems(Array.isArray(items) ? items : []);
      } else {
        setCartItems([]);
        setCartData(null);
      }
    } catch (err) {
      console.error("Error loading cart:", err);
      
      // Handle unauthorized errors
      if (err.response?.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem("token");
        setCartItems([]);
        setCartData(null);
      } else {
        setError("Không thể tải giỏ hàng. Vui lòng thử lại.");
      }
    } finally {
      // Reset both the state and the ref
      setLoading(false);
      loadingRef.current = false;
      isInitialLoadRef.current = false;
    }
  }, [/* no dependencies to avoid circular dependency */]);

  // Load cart on auth state changes - using a single effect with isAuthenticated dependency
  useEffect(() => {
    console.log("Auth state changed:", isAuthenticated);
    
    if (isAuthenticated) {
      // Only load if authenticated
      loadCartItems();
    } else {
      // Clear cart when logged out
      console.log("Not authenticated, clearing cart");
      setCartItems([]);
      setCartData(null);
      setLoading(false);
      loadingRef.current = false;
    }
    
    // This ensures the effect doesn't run on every render
  }, [isAuthenticated]); // Only re-run when auth state changes

  // Add an item to the cart
  const addItemToCart = useCallback(async (productId, quantity) => {
    try {
      setError(null);
      
      // Check if authenticated before making request
      if (!isAuthenticated) {
        throw new Error("Vui lòng đăng nhập để thêm vào giỏ hàng!");
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
      
      // Handle specific error types
      if (err.type === "INSUFFICIENT_INVENTORY") {
        throw new Error(err.message);
      }
      
      // Handle unauthorized errors
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Vui lòng đăng nhập để thêm vào giỏ hàng!");
      }
      
      setError("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
      throw new Error("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    }
  }, [isAuthenticated, loadCartItems]);

  // Update an item in the cart
  const updateCartItem = useCallback(async (cartItemId, productId, quantity) => {
    try {
      setError(null);
      
      // Check if authenticated before making request
      if (!isAuthenticated) {
        throw new Error("Vui lòng đăng nhập để cập nhật giỏ hàng!");
      }
      
      // Lưu lại giá trị quantity cũ để tính toán subtotal sau khi cập nhật
      const updatedItem = cartItems.find(item => item.id === cartItemId);
      const oldQuantity = updatedItem ? updatedItem.quantity : 0;
      const itemPrice = updatedItem ? updatedItem.productPrice : 0;
      
      // Optimistic update the UI - cartItemId là id của CartItem
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === cartItemId
            ? { ...item, quantity }
            : item
        )
      );
      
      // Cập nhật luôn subtotal (không đợi API trả về)
      if (cartData) {
        const quantityDiff = quantity - oldQuantity;
        const priceDiff = quantityDiff * itemPrice;
        
        setCartData(prevData => ({
          ...prevData,
          totalPrice: (prevData.totalPrice || 0) + priceDiff
        }));
      }
      
      // Gọi API - chỉ cần cartItemId và quantity
      const response = await updateCart(cartItemId, quantity);
      
      // Nếu API trả về thông tin đầy đủ, có thể sử dụng để cập nhật state chính xác hơn
      if (response && response.data && response.data.totalPrice !== undefined) {
        // Cập nhật totalPrice từ kết quả API nếu có
        setCartData(prevData => ({
          ...prevData,
          totalPrice: response.data.totalPrice
        }));
      }
      
      console.log(`Cart item ${cartItemId} updated successfully to quantity ${quantity}`);
      return true;
    } catch (err) {
      console.error("Error updating cart item:", err);
      
      // Handle specific error types
      if (err.type === "INSUFFICIENT_INVENTORY") {
        // Rollback the optimistic update
        await loadCartItems();
        
        // Re-throw with custom error type for component handling
        throw {
          type: "INSUFFICIENT_INVENTORY",
          message: err.message,
          productId: productId // Pass productId for inventory refetch
        };
      }
      
      // Handle unauthorized errors
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Vui lòng đăng nhập để cập nhật giỏ hàng!");
      }
      
      setError("Không thể cập nhật giỏ hàng. Vui lòng thử lại.");
      
      // Rollback the optimistic update by reloading only in case of error
      await loadCartItems();
      throw new Error("Không thể cập nhật giỏ hàng. Vui lòng thử lại.");
    }
  }, [isAuthenticated, loadCartItems, cartItems, cartData]);

  // Remove an item from the cart
  const removeCartItem = useCallback(async (cartItemId) => {
    try {
      setError(null);
      
      // Check if authenticated before making request
      if (!isAuthenticated) {
        throw new Error("Unauthorized: You need to be logged in");
      }
      
      // Tìm item sẽ bị xóa để tính subtotal
      const removedItem = cartItems.find(item => item.id === cartItemId);
      const itemPrice = removedItem ? removedItem.productPrice : 0;
      const itemQuantity = removedItem ? removedItem.quantity : 0;
      const itemTotal = itemPrice * itemQuantity;
      
      // Optimistically update the UI
      setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
      
      // Cập nhật subtotal
      if (cartData && removedItem) {
        setCartData(prevData => ({
          ...prevData,
          totalPrice: Math.max(0, (prevData.totalPrice || 0) - itemTotal)
        }));
      }
      
      // Gọi API xóa item
      await deleteCartItem(cartItemId);
      
      console.log(`Cart item ${cartItemId} removed successfully`);
      return true;
    } catch (err) {
      console.error("Error removing cart item:", err);
      setError("Không thể xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại.");
      
      // Rollback the optimistic update by reloading only in case of error
      await loadCartItems();
      throw err;
    }
  }, [isAuthenticated, loadCartItems, cartItems, cartData]);

  // Clear the entire cart (used after successful order)
  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      loadingRef.current = true;
      setError(null);

      // Check if authenticated before making request
      if (!isAuthenticated) {
        throw new Error("Unauthorized: You need to be logged in");
      }

      // Call the API to clear the cart on the server
      await clearCartApi();
      
      // Clear the local cart state
      setCartItems([]);
      setCartData(null);
      
      console.log("Cart cleared successfully");
      return true;
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError("Không thể xóa giỏ hàng. Vui lòng thử lại.");
      throw err;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [isAuthenticated]);

  // Format price to VND
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }, []);

  // Create a memoized context value to prevent unnecessary re-renders of consuming components
  const contextValue = useMemo(() => ({
    cartItems,
    cartData,
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
  }), [
    cartItems,
    cartData,
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
  ]);

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
}; 