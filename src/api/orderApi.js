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
    console.log(`Fetching order details for ID: ${id}`);
    const response = await axiosClient.get(`/Order/detail/${id}`);
    
    console.log("Raw order detail response:", response);
    
    // Check response structure and return data
    if (response.data && response.data.data) {
      console.log("Returning response.data.data:", response.data.data);
      return response.data.data;
    } else if (response.data) {
      console.log("Returning response.data:", response.data);
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
    console.log('User orders response:', response);
    // Giả sử server trả về dạng: { message: "...", data: [...] }
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

// Create a new order
export const createOrder = async (orderData) => {
  try {
    console.log('Creating order with data:', orderData);
    const response = await axiosClient.post('/Order', orderData);
    console.log('Create order response:', response);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    
    // Handle specific error cases
    if (error.response?.data) {
      const errorData = error.response.data;
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
    console.log("Order by ID response:", response);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order with ID ${id}:`, error);
    throw error;
  }
};
