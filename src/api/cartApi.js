import axiosClient from "./axiosClient";

// Debug counter for API calls
let apiCallCount = 0;

// Helper to track API calls
const trackApiCall = (name) => {
  apiCallCount++;
  console.log(`🔄 [${apiCallCount}] Cart API Call: ${name}`);
  return apiCallCount;
};

// Lấy cart của user hiện tại với phân trang (server dựa vào token)
export const getCartByUser = async (pageNumber = 1, pageSize = 10) => {
  const callId = trackApiCall("getCartByUser");
  console.log(`🛒 [${callId}] GET /cart/user - START`);
  
  try {
    const response = await axiosClient.get("/cart/user", {
      params: { pageNumber, pageSize }
    });
    console.log(`✅ [${callId}] GET /cart/user - SUCCESS`, response.data);
    return response.data; // Mảng cart item
  } catch (error) {
    console.error(`❌ [${callId}] GET /cart/user - ERROR`, error);
    throw error;
  }
};

// Thêm sản phẩm vào giỏ
export const addToCart = async (productId, quantity) => {
  const callId = trackApiCall("addToCart");
  console.log(`🛒 [${callId}] POST /cart - START`, { productId, quantity });
  
  try {
    const response = await axiosClient.post("/cart", { productId, quantity });
    console.log(`✅ [${callId}] POST /cart - SUCCESS`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ [${callId}] POST /cart - ERROR`, error);
    
    // Handle specific error cases
    if (error.response?.status === 400 && error.response?.data?.errorCode === "INSUFFICIENT_INVENTORY") {
      throw {
        type: "INSUFFICIENT_INVENTORY",
        message: error.response.data.message
      };
    }
    
    throw error;
  }
};

// Cập nhật cart item
export const updateCart = async (cartItemId, quantity) => {
  const callId = trackApiCall("updateCart");
  console.log(`🛒 [${callId}] PUT /cart/item/${cartItemId} - START`, { quantity });
  
  try {
    const response = await axiosClient.put(`/cart/item/${cartItemId}`, { 
      cartItemId,
      quantity 
    });
    console.log(`✅ [${callId}] PUT /cart/item/${cartItemId} - SUCCESS`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ [${callId}] PUT /cart/item/${cartItemId} - ERROR`, error);
    
    // Handle specific error cases
    if (error.response?.status === 400 && error.response?.data?.errorCode === "INSUFFICIENT_INVENTORY") {
      throw {
        type: "INSUFFICIENT_INVENTORY",
        message: error.response.data.message
      };
    }
    
    throw error;
  }
};

// Xóa cart item
export const deleteCartItem = async (cartItemId) => {
  const callId = trackApiCall("deleteCartItem");
  console.log(`🛒 [${callId}] DELETE /cart/item/${cartItemId} - START`);
  
  try {
    await axiosClient.delete(`/cart/item/${cartItemId}`);
    console.log(`✅ [${callId}] DELETE /cart/item/${cartItemId} - SUCCESS`);
    return { success: true, id: cartItemId };
  } catch (error) {
    console.error(`❌ [${callId}] DELETE /cart/item/${cartItemId} - ERROR`, error);
    throw error;
  }
};

// Xóa toàn bộ giỏ hàng của user
export const clearCart = async () => {
  const callId = trackApiCall("clearCart");
  console.log(`🛒 [${callId}] DELETE /cart/clear - START`);
  
  try {
    const response = await axiosClient.delete("/cart/clear");
    console.log(`✅ [${callId}] DELETE /cart/clear - SUCCESS`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ [${callId}] DELETE /cart/clear - ERROR`, error);
    throw error;
  }
};
