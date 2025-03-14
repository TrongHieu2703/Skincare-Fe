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
  const response = await axiosClient.get(`/Order/detail/${orderId}`);
  return response.data.data;
};

// NEW: Fetch orders for the currently logged-in user
export const getOrdersByUser = async () => {
  const response = await axiosClient.get('/Order/user');
  // Giả sử server trả về dạng: { message: "...", data: [...] }
  return response.data.data;
};

// Create a new order
export const createOrder = async (orderData) => {
  const response = await axiosClient.post('/Order', orderData);
  return response.data;
};

// Update an existing order
export const updateOrder = async (orderId, orderData) => {
  const response = await axiosClient.put(`/Order/${orderId}`, orderData);
  return response.data;
};

// Delete an order
export const deleteOrder = async (orderId) => {
  const response = await axiosClient.delete(`/Order/${orderId}`);
  return response.data;
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  const response = await axios.patch(`${API_URL}/${orderId}/status`, { status });
  return response.data;
};
