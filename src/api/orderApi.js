// src/api/orderApi.js
import axios from 'axios';
import axiosClient from './axiosClient';

const API_URL = 'https://localhost:7290/api/Order';

// Fetch all orders (Admin hoặc cho mục đích khác)
export const getAllOrders = async () => {
  const response = await axiosClient.get('/Order');
  return response.data;
};

// Fetch order details by ID (cho trang chi tiết đơn hàng)
export const getOrderDetail = async (id) => {
  try {
    const response = await axiosClient.get(`/Order/detail/${id}`);
    
    // Check response structure and return data
    if (response.data && response.data.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    } else {
      console.error("Invalid response format:", response);
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error(`Error fetching order detail for ID ${id}:`, error);
    throw error;
  }
};

// NEW: Fetch orders for the currently logged-in user
export const getOrdersByUser = async () => {
  try {
    const response = await axiosClient.get('/Order/user');
    
    // Check response structure and return data
    if (response.data && response.data.data) {
      const orderData = response.data.data;
      
      // Enhance the data if needed
      return orderData.map(order => {
        // Ensure orderItems is always an array
        if (!order.orderItems) {
          order.orderItems = [];
        }
        
        return order;
      });
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error("Invalid response format:", response);
      return []; // Return empty array on invalid format
    }
  } catch (error) {
    console.error('Error fetching user orders:', error);
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Please log in');
    }
    throw error;
  }
};

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const response = await axiosClient.post('/Order', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    
    // Extract specific error information
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Handle voucher-specific errors
      if (errorData.errorCode === "VOUCHER_EXPIRED") {
        throw {
          type: "VOUCHER_ERROR",
          errorCode: "VOUCHER_EXPIRED",
          message: "Voucher đã hết hạn. Vui lòng chọn voucher khác."
        };
      } else if (errorData.errorCode === "VOUCHER_FULLY_REDEEMED") {
        throw {
          type: "VOUCHER_ERROR",
          errorCode: "VOUCHER_FULLY_REDEEMED",
          message: "Voucher đã hết lượt sử dụng. Vui lòng chọn voucher khác."
        };
      } else if (errorData.errorCode === "VOUCHER_MIN_ORDER_NOT_MET") {
        throw {
          type: "VOUCHER_ERROR",
          errorCode: "VOUCHER_MIN_ORDER_NOT_MET",
          message: `Đơn hàng không đạt giá trị tối thiểu để sử dụng voucher (${new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(errorData.details?.minOrderValue || 0).replace('₫', 'đ')}).`
        };
      } else if (errorData.message && errorData.message.includes("voucher")) {
        // Generic voucher error
        throw {
          type: "VOUCHER_ERROR",
          message: errorData.message || "Có lỗi khi áp dụng voucher. Vui lòng thử voucher khác."
        };
      }
      
      // Handle other specific errors
      throw {
        type: errorData.errorCode || 'ORDER_ERROR',
        message: errorData.message || 'Đã xảy ra lỗi khi tạo đơn hàng',
        details: errorData.details || null
      };
    }
    
    throw {
      type: 'ORDER_ERROR',
      message: error.message || 'Đã xảy ra lỗi khi tạo đơn hàng'
    };
  }
};

// Update an existing order
export const updateOrder = async (orderId, orderData) => {
  try {
    const response = await axiosClient.put(`/Order/${orderId}`, orderData);
    return response.data;
  } catch (error) {
    console.error(`Error updating order ${orderId}:`, error);
    throw error;
  }
};

// Delete an order
export const deleteOrder = async (orderId) => {
  try {
    const response = await axiosClient.delete(`/Order/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting order ${orderId}:`, error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.patch(`${API_URL}/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating status for order ${orderId}:`, error);
    throw error;
  }
};

// Add/update this function in your orderApi.js file

// Fetch order by ID
export const getOrderById = async (id) => {
  try {
    const response = await axiosClient.get(`/Order/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order with ID ${id}:`, error);
    throw error;
  }
};
