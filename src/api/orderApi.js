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
export const getOrderDetail = async (orderId) => {
  if (!orderId) {
    console.error('getOrderDetail called with undefined or null orderId');
    throw new Error('Order ID is required');
  }
  
  try {
    console.log(`Fetching order details for ID: ${orderId}`);
    const response = await axiosClient.get(`/Order/detail/${orderId}`);
    console.log('Order details response:', response);
    
    // Kiểm tra response và trả về dữ liệu order
    if (response && response.data) {
      if (response.data.data) {
        return response.data.data;
      } else {
        console.warn('Order data structure unexpected:', response.data);
        return response.data; // Trả về trực tiếp nếu không có data.data
      }
    } else {
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    console.error(`Error fetching order details for ID ${orderId}:`, error);
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
    throw error;
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
