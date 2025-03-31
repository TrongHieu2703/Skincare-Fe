import axiosClient from "./axiosClient";

const API_URL = "/Review";

// Lấy danh sách review của sản phẩm
export const getReviewsByProductId = async (productId) => {
  try {
    const response = await axiosClient.get(`${API_URL}/product/${productId}`);
    
    // Ensure we're returning a consistent structure
    if (response.data && typeof response.data === 'object') {
      // Backend wraps data in a data property
      if (response.data.data) {
        const reviews = response.data.data;
        return { data: reviews };
      } else if (Array.isArray(response.data)) {
        // Direct array (unlikely but possible)
        return { data: response.data };
      } else {
        // Direct data object
        return response.data;
      }
    }
    
    return { data: [] };
  } catch (error) {
    console.error(`Error in getReviewsByProductId(${productId}):`, error);
    throw error;
  }
};

// Lấy review theo ID
export const getReviewById = async (id) => {
  const response = await axiosClient.get(`${API_URL}/${id}`);
  return response.data;
};

// Tạo review mới
export const createReview = async (reviewData) => {
  const response = await axiosClient.post(API_URL, reviewData);
  return response.data;
};

// Cập nhật review
export const updateReview = async (id, reviewData) => {
  const response = await axiosClient.put(`${API_URL}/${id}`, reviewData);
  return response.data;
};

// Xóa review
export const deleteReview = async (id) => {
  await axiosClient.delete(`${API_URL}/${id}`);
};

// Lấy tất cả review của một sản phẩm cho admin
export const getProductReviewsForAdmin = async (productId) => {
  const response = await axiosClient.get(`${API_URL}/product/${productId}`);
  return response.data;
};

// Lấy đánh giá trung bình của sản phẩm
export const getProductAverageRating = async (productId) => {
  // Try the new endpoint first
  try {
    const response = await axiosClient.get(`${API_URL}/rating/${productId}`);
    return response.data;
  } catch (error) {
    // Fall back to the original endpoint if needed
    console.warn("Falling back to original rating endpoint");
    const response = await axiosClient.get(`${API_URL}/product/${productId}/rating`);
    return response.data;
  }
};

// Lấy cả đánh giá và rating trung bình trong một lần gọi API
export const getReviewsWithRating = async (productId) => {
  try {
    const response = await axiosClient.get(`${API_URL}/product/${productId}/reviews-with-rating`);
    
    // Check if the response structure follows the backend format
    if (response.data && response.data.data) {
      // The backend wraps data in a data object with message
      return response.data.data;
    } else {
      // Direct data structure
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching reviews with rating:", error);
    throw error;
  }
};

// Kiểm tra xem có review cho một order item cụ thể hay không
export const checkReviewExistsByOrderItem = async (orderItemId) => {
  try {
    // Thực hiện API call
    const response = await axiosClient.get(`${API_URL}/order-item/${orderItemId}`, {
      // Thêm một param dummy để bảo đảm không bị cache
      params: { _t: new Date().getTime() }
    });
    
    // Trả về kết quả theo cấu trúc chuẩn
    return {
      exists: response.data.exists || false,
      review: response.data.data || null,
      message: response.data.message || ""
    };
  } catch (error) {
    console.error(`Error checking review for order item ${orderItemId}:`, error);
    
    // If unauthorized, return exists: false with appropriate message
    if (error.response?.status === 401) {
      return { 
        exists: false, 
        review: null, 
        message: "User not authenticated" 
      };
    }
    
    return { 
      exists: false, 
      review: null, 
      message: error.message || "Error checking review" 
    };
  }
};
